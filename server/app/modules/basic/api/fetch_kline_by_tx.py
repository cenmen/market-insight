from __future__ import annotations

import asyncio

import akshare as ak
import polars as pl
from aiocache import SimpleMemoryCache

from app.modules.basic.schema.request import KlineParams
from app.utils.tool import get_stock_info_by_code

kline_cache = SimpleMemoryCache()


def fetch_kline_by_tx(params: KlineParams) -> pl.DataFrame:
    """按股票代码与区间拉取腾讯源日 K 线数据。"""
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
        return pl.DataFrame(
            {
                "date": [],
                "open": [],
                "high": [],
                "low": [],
                "close": [],
                "amount": [],
                "amplitude": [],
                "change": [],
                "change_pct": [],
            }
        )

    rename_map = {
        "日期": "date",
        "开盘": "open",
        "收盘": "close",
        "最高": "high",
        "最低": "low",
        "成交额": "amount",
    }
    pdf = pdf.rename(columns={key: value for key, value in rename_map.items() if key in pdf.columns})
    pl_df = pl.from_pandas(pdf)

    # 统一数值列类型，避免不同数据源返回字符串时影响后续计算。
    casts = []
    for key in ["open", "high", "low", "close", "amount"]:
        if key in pl_df.columns:
            casts.append(pl.col(key).cast(pl.Float64, strict=False))
    if "date" in pl_df.columns:
        casts.append(pl.col("date").cast(pl.Utf8))
    if casts:
        pl_df = pl_df.with_columns(casts)

    # 派生振幅、涨跌额和涨跌幅，输出结构与前端约定保持一致。
    amplitude_expr = pl.when(
        (pl.col("open").is_not_null())
        & (pl.col("high").is_not_null())
        & (pl.col("low").is_not_null())
        & (pl.col("open") != 0)
    ).then(((pl.col("high") - pl.col("low")) / pl.col("open")) * 100.0).otherwise(None)
    change_expr = pl.when((pl.col("open").is_not_null()) & (pl.col("close").is_not_null())).then(
        pl.col("close") - pl.col("open")
    ).otherwise(None)
    change_pct_expr = pl.when(
        (pl.col("open").is_not_null()) & (pl.col("close").is_not_null()) & (pl.col("open") != 0)
    ).then(((pl.col("close") - pl.col("open")) / pl.col("open")) * 100.0).otherwise(None)
    pl_df = pl_df.with_columns(
        [
            amplitude_expr.alias("amplitude"),
            change_expr.alias("change"),
            change_pct_expr.alias("change_pct"),
        ]
    )
    pl_df = pl_df.with_columns(
        [
            pl.col("amplitude").round(2),
            pl.col("change").round(2),
            pl.col("change_pct").round(2),
        ]
    )

    out_cols = [col for col in ["date", "open", "high", "low", "close", "amount", "amplitude", "change", "change_pct"] if col in pl_df.columns]
    return pl_df.select(out_cols)


async def fetch_kline_by_tx_cached(params: KlineParams) -> pl.DataFrame:
    """带内存缓存的股票 K 线读取，避免重复请求同一时间段数据。"""
    adjust = params.adjust or ""
    key = f"kline:{params.code}|{params.period.value}|{params.startDate}|{params.endDate}|{adjust}"
    cached = await kline_cache.get(key)
    if cached is not None:
        return cached
    df = await asyncio.to_thread(fetch_kline_by_tx, params)
    await kline_cache.set(key, df, ttl=1800)
    return df
