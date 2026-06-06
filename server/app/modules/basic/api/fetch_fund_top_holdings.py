from __future__ import annotations

import asyncio
import json
import time
from typing import Any, Dict, List, Tuple

import httpx
from aiocache import SimpleMemoryCache

fund_top_holdings_cache = SimpleMemoryCache()


def _safe_float(value: Any, default: float = 0.0) -> float:
    """把百分比、逗号数字和空值统一转换成 float。"""
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


def _parse_jsonp_payload(text: str) -> Dict[str, Any]:
    """解析东方财富基金持仓接口返回的 JSONP 包装。"""
    payload = text.strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    start = payload.find("(")
    end = payload.rfind(")")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("响应不是合法 JSONP")
    return json.loads(payload[start + 1 : end])


def fetch_fund_top_holdings(code: str) -> Tuple[List[Dict[str, Any]], str | None]:
    """抓取 ETF 前十大持仓，返回持仓列表和持仓报告期。"""
    ts = int(time.time() * 1000)
    callback = f"jQuery3510_{ts}"
    try:
        response = httpx.get(
            "https://fundwebapi.eastmoney.com//FundMEApi/FundPositionList",
            params={
                "callback": callback,
                "pageIndex": 1,
                "pageSize": 10,
                "deviceid": "1234567.py.service",
                "version": "4.3.0",
                "product": "Eastmoney",
                "plat": "Web",
                "FCODE": code,
                "_": ts + 1,
            },
            timeout=20.0,
            follow_redirects=True,
        )
        text = response.text
    except Exception as exc:
        raise RuntimeError(f"获取基金持仓失败: {exc}")

    data = _parse_jsonp_payload(text)
    if not data.get("Success"):
        message = data.get("ErrMsg") or data.get("Message") or "未知错误"
        raise RuntimeError(f"获取基金持仓失败: {message}")

    holdings = [
        {
            "stock_code": str(item.get("ShareCode", "")).zfill(6),
            "stock_name": str(item.get("ShareName", "")),
            "hold_rate": _safe_float(item.get("ShareProportion")),
            "quarter_data": [],
        }
        for item in data.get("Datas") or []
    ]
    holdings.sort(key=lambda item: item["hold_rate"], reverse=True)
    expansion = data.get("Expansion")
    return holdings[:10], str(expansion) if expansion else None


async def fetch_fund_top_holdings_cached(code: str) -> Tuple[List[Dict[str, Any]], str | None]:
    """带内存缓存的基金前十大持仓读取，避免重复请求同一基金持仓。"""
    key = f"fund_top_holdings:{str(code).zfill(6)}"
    cached = await fund_top_holdings_cache.get(key)
    if cached is not None:
        return cached
    records = await asyncio.to_thread(fetch_fund_top_holdings, code)
    await fund_top_holdings_cache.set(key, records, ttl=1800)
    return records
