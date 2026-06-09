from __future__ import annotations

import asyncio
import json
import time
from typing import Any, Dict, List

import httpx
from aiocache import SimpleMemoryCache

from app.modules.basic.schema.request import IndexKlineByTxParams

index_kline_by_tx_cache = SimpleMemoryCache()


def _parse_tx_payload(text: str) -> dict[str, Any]:
    """解析腾讯行情接口返回的 JSONP/JS 赋值文本。"""
    payload = text.strip().rstrip(";")
    start = payload.find("{")
    end = payload.rfind("}")
    if start == -1 or end == -1 or end < start:
        raise ValueError("腾讯行情返回内容解析失败")
    return json.loads(payload[start : end + 1])


def _build_tx_symbol(code: str) -> str:
    """根据指数代码推导腾讯行情前缀。"""
    normalized = str(code or "").strip()
    if normalized.startswith("399"):
        return f"sz{normalized}"
    return f"sh{normalized}"


def _safe_float(value: Any, default: float = 0.0) -> float:
    """把数值字段统一转换成 float。"""
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


def _parse_tx_kline_value(item: list[Any]) -> Dict[str, Any]:
    """解析腾讯单条指数 K 线数组。"""
    return {
        "date": str(item[0]) if len(item) > 0 and item[0] is not None else "",
        "open": _safe_float(item[1] if len(item) > 1 else None),
        "close": _safe_float(item[2] if len(item) > 2 else None),
        "high": _safe_float(item[3] if len(item) > 3 else None),
        "low": _safe_float(item[4] if len(item) > 4 else None),
        "volume": _safe_float(item[5] if len(item) > 5 else None),
        "meta": item[6] if len(item) > 6 else None,
        "changePercent": _safe_float(item[7] if len(item) > 7 else None),
        "amount": _safe_float(item[8] if len(item) > 8 else None),
        "changeAmount": _safe_float(item[9] if len(item) > 9 else None),
        "turnoverRate": _safe_float(item[10] if len(item) > 10 else None),
    }


def fetch_index_kline_by_tx(params: IndexKlineByTxParams) -> List[Dict[str, Any]]:
    """在腾讯获取指数历史 K 线数据，仅保留 day 数组。"""
    code = str(params.code or "").strip()
    if not code:
        return []

    symbol = _build_tx_symbol(code)
    query = {
        "_var": "kline_dayqfq",
        "param": f"{symbol},day,,,{params.limit},qfq",
        "r": f"{time.time():.16f}",
    }
    try:
        response = httpx.get(
            "https://proxy.finance.qq.com/ifzqgtimg/appstock/app/newfqkline/get",
            params=query,
            timeout=8.0,
            follow_redirects=True,
        )
        payload = _parse_tx_payload(response.text)
    except Exception as exc:
        raise RuntimeError(f"腾讯指数历史K线请求失败: {exc}")

    data = payload.get("data") or {}
    symbol_data = data.get(symbol) or {}
    values = symbol_data.get("day") or []
    if not isinstance(values, list):
        return []
    klines: List[Dict[str, Any]] = []
    for item in values:
        if isinstance(item, list):
            klines.append(_parse_tx_kline_value(item))
    return klines


async def fetch_index_kline_by_tx_cached(params: IndexKlineByTxParams) -> List[Dict[str, Any]]:
    """带内存缓存的腾讯指数历史 K 线读取，避免短时间内重复请求。"""
    code = str(params.code or "").strip()
    key = f"index_kline_by_tx:{code}|{params.limit}"
    cached = await index_kline_by_tx_cache.get(key)
    if cached is not None:
        return cached
    klines = await asyncio.to_thread(fetch_index_kline_by_tx, params)
    await index_kline_by_tx_cache.set(key, klines, ttl=1800)
    return klines
