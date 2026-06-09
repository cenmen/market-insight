from __future__ import annotations

import asyncio
import json
import time
from typing import Any, List

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


def fetch_index_kline_by_tx(params: IndexKlineByTxParams) -> List[list[Any]]:
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
    klines = symbol_data.get("day") or []
    if not isinstance(klines, list):
        return []
    return klines


async def fetch_index_kline_by_tx_cached(params: IndexKlineByTxParams) -> List[list[Any]]:
    """带内存缓存的腾讯指数历史 K 线读取，避免短时间内重复请求。"""
    code = str(params.code or "").strip()
    key = f"index_kline_by_tx:{code}|{params.limit}"
    cached = await index_kline_by_tx_cache.get(key)
    if cached is not None:
        return cached
    klines = await asyncio.to_thread(fetch_index_kline_by_tx, params)
    await index_kline_by_tx_cache.set(key, klines, ttl=1800)
    return klines
