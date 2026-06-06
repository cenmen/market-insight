from __future__ import annotations

import asyncio
import json
from typing import List

import httpx
from aiocache import SimpleMemoryCache

from app.modules.basic.schema.request import SearchStockParams

search_stocks_cache = SimpleMemoryCache()


def fetch_search_stocks(params: SearchStockParams) -> List[dict]:
    """根据关键词调用东方财富搜索接口，返回股票代码与名称列表。"""
    keyword = str(params.keyword or "").strip()
    if not keyword:
        return []

    query = {
        "client": "web",
        "clientType": "webSuggest",
        "clientVersion": "lastest",
        "keyword": keyword,
        "pageIndex": "1",
        "pageSize": "20",
        "securityFilter": "",
        "cb": "jQuery112400000000000000_0",
    }
    headers = {
        "accept": "*/*",
        "referer": "https://www.eastmoney.com/",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
    }
    try:
        response = httpx.get(
            "https://search-codetable.eastmoney.com/codetable/search/web",
            params=query,
            headers=headers,
            timeout=8.0,
            follow_redirects=True,
        )
        text = response.text
    except Exception as exc:
        raise RuntimeError(f"Eastmoney 接口请求失败: {exc}")

    start = text.find("(")
    end = text.rfind(")")
    if start == -1 or end == -1 or end <= start:
        return []

    payload = text[start + 1 : end].strip()
    try:
        data = json.loads(payload)
    except Exception:
        return []

    records: List[dict] = []
    for item in data.get("result") or []:
        code = item.get("code")
        name = item.get("shortName")
        if code and name:
            records.append(
                {
                    "code": str(code),
                    "name": str(name),
                    "marketText": str(item.get("securityTypeName") or ""),
                }
            )
    return records


async def fetch_search_stocks_cached(params: SearchStockParams) -> List[dict]:
    """带内存缓存的股票搜索，避免短时间内重复搜索同一关键词。"""
    keyword = str(params.keyword or "").strip()
    key = f"search_stocks:{keyword}"
    cached = await search_stocks_cache.get(key)
    if cached is not None:
        return cached
    records = await asyncio.to_thread(fetch_search_stocks, params)
    await search_stocks_cache.set(key, records, ttl=600)
    return records
