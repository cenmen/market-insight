from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Dict, Iterable

from aiocache import SimpleMemoryCache

from app.modules.basic.service import (
    fetch_fund_snapshot,
    fetch_fund_snapshot_cached,
    fetch_fund_top_holdings,
    fetch_fund_top_holdings_cached,
    fetch_stock_main_finance,
    fetch_stock_main_finance_cached,
    fetch_ths_kline,
    fetch_ths_kline_cached,
    sync_market_turnover_csv,
)
from app.constants.theme_config import THEME_CONFIG_MAP

etf_base_data_cache = SimpleMemoryCache()
sector_congestion_cache = SimpleMemoryCache()


def target_quarter_end(today: datetime) -> str:
    """根据当前日期推导目标季度末日期（YYYY-MM-DD）。"""
    year = today.year
    month = today.month
    day = today.day
    if month < 6 or (month == 6 and day < 30):
        return f"{year}-03-31"
    if month < 9 or (month == 9 and day < 30):
        return f"{year}-06-30"
    if month < 12 or (month == 12 and day < 31):
        return f"{year}-09-30"
    return f"{year}-12-31"


def report_type(quarter_end: str) -> str:
    """把季度末日期映射为东方财富财务报告类型。"""
    return {
        "03-31": "一季报",
        "06-30": "中报",
        "09-30": "三季报",
        "12-31": "年报",
    }.get(quarter_end[5:], "一季报")


def _normalize_keys(theme_keys: Iterable[str]) -> list[str]:
    """去重并清理主题 key，保留用户输入顺序。"""
    keys: list[str] = []
    seen: set[str] = set()
    for key in theme_keys:
        normalized = str(key).strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        keys.append(normalized)
    return keys


def _normalize_amount_to_yi_yuan(value: Any) -> float | None:
    """把原始成交额统一转换成亿元。"""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        amount = float(value)
    else:
        text = str(value).strip().replace(",", "").replace("%", "")
        if not text or text in {"--", "None", "nan", "NaN"}:
            return None
        try:
            amount = float(text)
        except ValueError:
            return None
    if abs(amount) >= 100000000:
        amount /= 100000000
    return round(amount, 2)


def _resolve_theme_configs(theme_keys: Iterable[str]) -> tuple[list[dict[str, Any]], list[str], list[str]]:
    """把主题 key 映射成可查询的配置，并返回未命中和缺少指数代码的 key 列表。"""
    keys = _normalize_keys(theme_keys)
    if not keys:
        return [], [], []

    configs: list[dict[str, Any]] = []
    missing_keys: list[str] = []
    missing_index_codes: list[str] = []
    for key in keys:
        config = THEME_CONFIG_MAP.get(key)
        if config is None:
            missing_keys.append(key)
            continue
        index_code = config.get("indexCode")
        if not index_code:
            missing_index_codes.append(key)
            continue
        item = dict(config)
        item["liquidityCode"] = str(index_code)
        configs.append(item)
    return configs, missing_keys, missing_index_codes


def _build_amount_map(records: list[dict[str, Any]]) -> dict[str, float]:
    """把单个 K 线序列转成按日期索引的成交额映射。"""
    amount_map: dict[str, float] = {}
    for record in records:
        date = str(record.get("date") or "").strip()
        if not date:
            continue
        amount = _normalize_amount_to_yi_yuan(record.get("amount"))
        if amount is None:
            continue
        amount_map[date] = amount
    return amount_map


def fetch_etf_base_data(code: str, kline_limit: int = 60) -> Dict[str, Any]:
    """一次性抓取 skill 所需 ETF 基础数据（K线、持仓、持仓股核心财务）。"""
    quarter_end = target_quarter_end(datetime.now())
    current_report_type = report_type(quarter_end)
    try:
        snapshot = fetch_fund_snapshot(code)
    except Exception:
        snapshot = None
    holdings, position_report = fetch_fund_top_holdings(code)
    k_line_data = fetch_ths_kline(code, kline_limit)

    for holding in holdings:
        try:
            quarter_data = fetch_stock_main_finance(holding["stock_code"], current_report_type)
        except Exception:
            continue
        if quarter_data and quarter_data["date"] == quarter_end:
            holding["quarter_data"] = [quarter_data]

    return {
        "code": code,
        "source": "eastmoney",
        "fetched_at": datetime.now().isoformat(timespec="seconds"),
        "target_quarter_end": quarter_end,
        "report_type": current_report_type,
        "position_report": position_report,
        "scale": (
            f"{(snapshot.get('circulatingMarketValue') or 0) / 100000000:.2f} 亿元"
            if snapshot and snapshot.get("circulatingMarketValue") is not None
            else None
        ),
        "kLineData": k_line_data,
        "holdings": holdings,
    }


async def fetch_etf_base_data_cached(code: str, kline_limit: int = 60) -> Dict[str, Any]:
    """带内存缓存的 ETF 基础数据聚合接口，优先复用缓存子接口结果。"""
    key = f"etf_base_data:{str(code).zfill(6)}|{kline_limit}"
    cached = await etf_base_data_cache.get(key)
    if cached is not None:
        return cached

    quarter_end = target_quarter_end(datetime.now())
    current_report_type = report_type(quarter_end)

    snapshot_task = fetch_fund_snapshot_cached(code)
    holdings_task = fetch_fund_top_holdings_cached(code)
    kline_task = fetch_ths_kline_cached(code, kline_limit)

    try:
        snapshot = await snapshot_task
    except Exception:
        snapshot = None
    holdings, position_report = await holdings_task
    k_line_data = await kline_task

    finance_tasks = [fetch_stock_main_finance_cached(holding["stock_code"], current_report_type) for holding in holdings]
    finance_results = await asyncio.gather(*finance_tasks, return_exceptions=True)

    for holding, finance_result in zip(holdings, finance_results):
        if isinstance(finance_result, Exception) or not finance_result:
            continue
        if finance_result["date"] == quarter_end:
            holding["quarter_data"] = [finance_result]

    record = {
        "code": code,
        "source": "eastmoney",
        "fetched_at": datetime.now().isoformat(timespec="seconds"),
        "target_quarter_end": quarter_end,
        "report_type": current_report_type,
        "position_report": position_report,
        "scale": (
            f"{(snapshot.get('circulatingMarketValue') or 0) / 100000000:.2f} 亿元"
            if snapshot and snapshot.get("circulatingMarketValue") is not None
            else None
        ),
        "kLineData": k_line_data,
        "holdings": holdings,
    }
    await etf_base_data_cache.set(key, record, ttl=1800)
    return record


async def fetch_sector_congestion(theme_keys: Iterable[str], days: int = 90) -> list[dict[str, Any]]:
    """按主题 key 聚合市场成交额与板块成交额，返回板块拥挤度序列。"""
    resolved_configs, missing_keys, missing_index_codes = _resolve_theme_configs(theme_keys)
    if missing_keys:
        raise ValueError(f"未知主题 key: {', '.join(missing_keys)}")
    if missing_index_codes:
        raise ValueError(f"主题缺少 indexCode，无法计算板块拥挤度: {', '.join(missing_index_codes)}")

    cache_key = f"sector_congestion:{','.join(item['key'] for item in resolved_configs)}|{days}"
    cached = await sector_congestion_cache.get(cache_key)
    if cached is not None:
        return cached

    if not resolved_configs:
        market_records = await asyncio.to_thread(sync_market_turnover_csv, days)
        rows = [
            {
                "date": str(record.get("date") or "").strip(),
                "sse_amount": record.get("sse_amount"),
                "szse_amount": record.get("szse_amount"),
                "total_amount": record.get("total_amount"),
                "unit": record.get("unit") or "亿元",
            }
            for record in market_records
        ]
        await sector_congestion_cache.set(cache_key, rows, ttl=1800)
        return rows

    market_task = asyncio.to_thread(sync_market_turnover_csv, days)
    kline_tasks = [fetch_ths_kline_cached(item["liquidityCode"], days) for item in resolved_configs]

    market_records = await market_task
    kline_results = await asyncio.gather(*kline_tasks, return_exceptions=True)

    theme_amount_maps: dict[str, dict[str, float]] = {}
    for config, result in zip(resolved_configs, kline_results):
        if isinstance(result, Exception):
            theme_amount_maps[config["key"]] = {}
            continue
        theme_amount_maps[config["key"]] = _build_amount_map(result)

    rows: list[dict[str, Any]] = []
    for market_record in market_records:
        date = str(market_record.get("date") or "").strip()
        total_amount = market_record.get("total_amount")
        row: dict[str, Any] = {
            "date": date,
            "sse_amount": market_record.get("sse_amount"),
            "szse_amount": market_record.get("szse_amount"),
            "total_amount": total_amount,
            "unit": market_record.get("unit") or "亿元",
        }
        total_amount_float = None
        if isinstance(total_amount, (int, float)):
            total_amount_float = float(total_amount)
        else:
            try:
                total_amount_float = float(str(total_amount))
            except (TypeError, ValueError):
                total_amount_float = None
        for config in resolved_configs:
            key = config["key"]
            amount = theme_amount_maps.get(key, {}).get(date)
            ratio = round(amount / total_amount_float * 100, 2) if amount is not None and total_amount_float else None
            row[key] = {
                "amount": amount,
                "ratio": ratio,
            }
        rows.append(row)

    await sector_congestion_cache.set(cache_key, rows, ttl=1800)
    return rows
