from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Dict

from aiocache import SimpleMemoryCache

from app.modules.basic.service import (
    fetch_fund_kline,
    fetch_fund_kline_cached,
    fetch_fund_snapshot,
    fetch_fund_snapshot_cached,
    fetch_fund_top_holdings,
    fetch_fund_top_holdings_cached,
    fetch_stock_main_finance,
    fetch_stock_main_finance_cached,
)

etf_base_data_cache = SimpleMemoryCache()


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


def fetch_etf_base_data(code: str, kline_limit: int = 60) -> Dict[str, Any]:
    """一次性抓取 skill 所需 ETF 基础数据（K线、持仓、持仓股核心财务）。"""
    quarter_end = target_quarter_end(datetime.now())
    current_report_type = report_type(quarter_end)
    try:
        snapshot = fetch_fund_snapshot(code)
    except Exception:
        snapshot = None
    holdings, position_report = fetch_fund_top_holdings(code)
    k_line_data = fetch_fund_kline(code, kline_limit)

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
    kline_task = fetch_fund_kline_cached(code, kline_limit)

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
