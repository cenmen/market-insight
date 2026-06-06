from __future__ import annotations

import asyncio
from datetime import datetime
from typing import Any, Dict, List

import httpx
from aiocache import SimpleMemoryCache

fund_kline_cache = SimpleMemoryCache()


def _safe_float(value: Any, default: float = 0.0) -> float:
    """把接口中的数值统一转换成 float。"""
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip().replace("%", "").replace(",", "")
    if not text or text in {"--", "nan", "None"}:
        return default
    try:
        return float(text)
    except ValueError:
        return default


def _ths_market(code_value: str) -> str:
    """转换同花顺基金接口要求的市场代码。"""
    code = str(code_value).zfill(6)
    return "20" if code.startswith(("5", "6", "9")) else "36"


def _format_ths_timestamp(value: Any) -> str:
    """把同花顺毫秒时间戳转换成 YYYY-MM-DD。"""
    timestamp = _safe_float(value)
    if timestamp <= 0:
        return ""
    return datetime.fromtimestamp(timestamp / 1000).strftime("%Y-%m-%d")


def _parse_ths_fund_kline_value(item: List[Any], previous_close: float | None = None) -> Dict[str, Any]:
    """解析同花顺单条基金 K 线数组。字段顺序来自 data_fields: 1,7,8,9,11,13,19。"""
    open_price = _safe_float(item[1] if len(item) > 1 else None)
    high = _safe_float(item[2] if len(item) > 2 else None)
    low = _safe_float(item[3] if len(item) > 3 else None)
    close = _safe_float(item[4] if len(item) > 4 else None)
    volume = _safe_float(item[5] if len(item) > 5 else None)
    amount = _safe_float(item[6] if len(item) > 6 else None)
    change_amount = close - previous_close if previous_close else 0.0
    change_percent = (change_amount / previous_close * 100) if previous_close else 0.0
    amplitude = ((high - low) / open_price * 100) if open_price else 0.0
    max_drawdown = ((low - open_price) / open_price * 100) if open_price else 0.0

    return {
        "date": _format_ths_timestamp(item[0] if item else None),
        "open": open_price,
        "close": close,
        "high": high,
        "low": low,
        "volume": volume,
        "amount": amount,
        "amplitude": round(amplitude, 2),
        "maxDrawdown": round(max_drawdown, 2),
        "changePercent": round(change_percent, 2),
        "changeAmount": round(change_amount, 3),
        "turnoverRate": 0.0,
    }


def fetch_fund_kline(code: str, limit: int) -> List[Dict[str, Any]]:
    """抓取同花顺基金日 K 线数据，仅返回格式化 K 线列表。"""
    if limit <= 0:
        raise ValueError("limit 必须大于 0")

    normalized_code = str(code).zfill(6)
    request_body = {
        "code_list": [{"codes": [normalized_code], "market": _ths_market(normalized_code)}],
        "trade_class": "intraday",
        "time_period": "day_1",
        "trade_date": -1,
        "begin_time": -limit,
        "end_time": 0,
        "adjust_type": "forward",
        "gpid": 1,
    }
    # 保留调试信息，便于排查同花顺接口字段或参数变化。
    print(
        "[fetch_fund_kline] request params:",
        {
            "code": code,
            "limit": limit,
            "normalized_code": normalized_code,
            "market": _ths_market(normalized_code),
            "body": request_body,
        },
    )
    try:
        response = httpx.post(
            "https://quota-h.10jqka.com.cn/fuyao/common_hq_aggr/quote/v1/single_kline",
            headers={
                "accept": "*/*",
                "content-type": "application/json",
                "origin": "https://stockpage.10jqka.com.cn",
                "platform": "hxkline",
                "referer": "https://stockpage.10jqka.com.cn/",
                "source-id": "hxkline-NEWS_appNewsFlowHome_Page",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
                "x-auth-appname": "AINVEST",
                "x-auth-progid": "7047",
                "x-auth-type": "ths",
                "x-auth-version": "1.0",
                "x-fuyao-auth": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRob3JpemVyX25hbWVzcGFjZSI6ImNvbW1vbi1ocS1hZ2dyIiwibGljZW5zZWVfdHlwZSI6IkZST05UX0FQUCIsImxpY2Vuc2VlX25hbWVzcGFjZSI6Imh4a2xpbmUtTkVXU19hcHBOZXdzRmxvd0hvbWVfUGFnZSJ9.ldrvWTheNnGOa_rH_buA6OoUpLtW2bhcdr3fABrGHbk",
            },
            json=request_body,
            timeout=20.0,
            follow_redirects=True,
        )
        data = response.json()
    except Exception as exc:
        raise RuntimeError(f"获取基金K线失败: {exc}")

    if data.get("status_code") != 0:
        message = data.get("status_msg") or "未知错误"
        raise RuntimeError(f"获取基金K线失败: {message}")

    quote_data = (data.get("data") or {}).get("quote_data") or []
    if not quote_data:
        return []

    values = quote_data[0].get("value") or []
    records: List[Dict[str, Any]] = []
    previous_close: float | None = None
    for item in values:
        if not isinstance(item, list):
            continue
        record = _parse_ths_fund_kline_value(item, previous_close)
        records.append(record)
        previous_close = record["close"]
    return records


async def fetch_fund_kline_cached(code: str, limit: int) -> List[Dict[str, Any]]:
    """带内存缓存的基金 K 线读取，避免重复请求同一代码与条数数据。"""
    key = f"fund_kline:{str(code).zfill(6)}|{limit}"
    cached = await fund_kline_cache.get(key)
    if cached is not None:
        return cached
    records = await asyncio.to_thread(fetch_fund_kline, code, limit)
    await fund_kline_cache.set(key, records, ttl=1800)
    return records
