from __future__ import annotations

from datetime import datetime
from typing import List, Optional
import json
import re

import akshare as ak
import httpx
import polars as pl
import asyncio
from aiocache import SimpleMemoryCache

from app.config.settings import settings
from app.utils.time import format_dt
from app.utils.tool import get_stock_info_by_code
from app.modules.basic.schema.request import KlineParams, SearchStockParams
from app.constants.enums import PeriodEnum

kline_cache = SimpleMemoryCache()

def load_kline_by_tx(params: KlineParams) -> pl.DataFrame:
    info = get_stock_info_by_code(params.code)
    prefix = "sh" if info.get("is_sh") else "sz"
    symbol = f"{prefix}{info.get('code')}"
    try:
        pdf = ak.stock_zh_a_hist_tx(
            symbol=symbol,
            start_date=params.startDate,
            end_date=params.endDate,
            adjust=(params.adjust or "qfq"),
            timeout=params.timeout,
        )
    except Exception as exc:
        raise RuntimeError(f"AkShare 数据拉取失败: {exc}")
    if pdf is None or len(pdf) == 0:
        return pl.DataFrame({
            "date": [],
            "open": [],
            "high": [],
            "low": [],
            "close": [],
            "amount": [],
            "amplitude": [],
            "change": [],
            "change_pct": [],
        })
    rename_map = {
        "日期": "date",
        "开盘": "open",
        "收盘": "close",
        "最高": "high",
        "最低": "low",
        "成交额": "amount",
    }
    pdf = pdf.rename(columns={k: v for k, v in rename_map.items() if k in pdf.columns})
    pl_df = pl.from_pandas(pdf)
    # 统一数值列类型为 Float64
    casts = []
    for key in ["open", "high", "low", "close", "amount"]:
        if key in pl_df.columns:
            casts.append(pl.col(key).cast(pl.Float64, strict=False))
    # 日期列统一为字符串
    if "date" in pl_df.columns:
        casts.append(pl.col("date").cast(pl.Utf8))
    # 批量应用类型转换
    if casts:
        pl_df = pl_df.with_columns(casts)
    # 计算振幅百分比 (high-low)/open*100，保护空值与除零
    amplitude_expr = pl.when(
        (pl.col("open").is_not_null())
        & (pl.col("high").is_not_null())
        & (pl.col("low").is_not_null())
        & (pl.col("open") != 0)
    ).then(((pl.col("high") - pl.col("low")) / pl.col("open")) * 100.0).otherwise(None)
    # 计算涨跌额 close - open（空值返回 None）
    change_expr = pl.when((pl.col("open").is_not_null()) & (pl.col("close").is_not_null())).then(pl.col("close") - pl.col("open")).otherwise(None)
    # 计算涨跌幅百分比 ((close-open)/open)*100（保护除零）
    change_pct_expr = pl.when(
        (pl.col("open").is_not_null()) & (pl.col("close").is_not_null()) & (pl.col("open") != 0)
    ).then(((pl.col("close") - pl.col("open")) / pl.col("open")) * 100.0).otherwise(None)
    # 写入派生列
    pl_df = pl_df.with_columns([
        amplitude_expr.alias("amplitude"),
        change_expr.alias("change"),
        change_pct_expr.alias("change_pct"),
    ])
    # 保留两位小数
    pl_df = pl_df.with_columns([
        pl.col("amplitude").round(2),
        pl.col("change").round(2),
        pl.col("change_pct").round(2),
    ])
    # 输出字段列表（按存在选择，避免缺列）
    out_cols = [
        c
        for c in ["date", "open", "high", "low", "close", "amount", "amplitude", "change", "change_pct"]
        if c in pl_df.columns
    ]
    return pl_df.select(out_cols)


async def load_kline_by_tx_cached(params: KlineParams) -> pl.DataFrame:
    adj = params.adjust or ""
    key = f"kline:{params.code}|{params.period.value}|{params.startDate}|{params.endDate}|{adj}"
    cached = await kline_cache.get(key)
    if cached is not None:
        return cached
    df = await asyncio.to_thread(load_kline_by_tx, params)
    await kline_cache.set(key, df, ttl=1800)
    return df


def search_stocks(params: SearchStockParams) -> List[dict]:
    kw = str(params.keyword or "").strip()
    if not kw:
        return []
    query = {
        "client": "web",
        "clientType": "webSuggest",
        "clientVersion": "lastest",
        "keyword": kw,
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
        resp = httpx.get(
            "https://search-codetable.eastmoney.com/codetable/search/web",
            params=query,
            headers=headers,
            timeout=8.0,
            follow_redirects=True,
        )
        text = resp.text
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

    items = data.get("result") or []
    records: List[dict] = []
    for it in items:
        marketText = str(it.get("securityTypeName") or "")
        code = it.get("code")
        name = it.get("shortName")
        if code and name:
            records.append({"code": str(code), "name": str(name), "marketText": marketText})
    return records
