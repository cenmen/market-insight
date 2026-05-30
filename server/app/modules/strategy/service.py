from __future__ import annotations

from typing import Any, Dict, List
# 使用列式数据处理，提高批量计算效率
import polars as pl

from app.constants.enums import StrategyEnum, TradeTypeEnum
from app.modules.strategy.schema.request import StrategyRunParams
from app.modules.basic.schema.request import KlineParams
from app.modules.basic.service import load_kline_by_tx_cached
from app.utils.candle import is_inverted_hammer


async def run_inverted_hammer_next_day_exit_v1(params: StrategyRunParams) -> Dict[str, Any]:
    """
    策略执行：遍历 K 线记录，识别倒锤子线，生成买卖事件并统计平均收益。

    - 买点：倒锤子线当日收盘价
    - 卖点：次日开盘价
    - 盈利：以买入收盘价为基准计算次日开盘的百分比收益
    """
    k_params = KlineParams(
        code=params.code,
        period=params.period,
        startDate=params.startDate,
        endDate=params.endDate,
        adjust=params.adjust,
        timeout=params.timeout,
    )
    # 拉取并缓存 K 线数据（DataFrame）
    df = await load_kline_by_tx_cached(k_params)
    if df.is_empty():
        return {"items": [], "expected_profit_pct": 0.0}
    # 增加行索引并生成次日关键字段
    df = df.with_row_index("idx").with_columns([
        pl.col("open").shift(-1).alias("sell_open_nxt"),
        pl.col("date").shift(-1).alias("sell_date_nxt"),
        pl.col("high").shift(-1).alias("sell_high_nxt"),
    ])  # 增加行索引与次日关键字段
    # 使用封装函数进行形态判定（逐行）
    inv = pl.struct(["date", "open", "close", "high", "low"]).map_elements(
        lambda s: is_inverted_hammer(s["date"], s["open"], s["close"], s["high"], s["low"])  # noqa: E731
    )
    # 有效振幅过滤
    mask = (pl.col("high") - pl.col("low")) > 0.0
    # 次日数据必须存在且满足形态
    valid = mask & inv & pl.col("sell_open_nxt").is_not_null() & pl.col("sell_date_nxt").is_not_null()
    signals = df.filter(valid)
    if signals.is_empty():
        return {"items": [], "expected_profit_pct": 0.0}
    # 生成买入事件
    buys_df = signals.select([
        pl.col("idx"),
        pl.col("date").cast(pl.Utf8).alias("date"),
        pl.col("close").alias("value"),
        pl.lit(TradeTypeEnum.Buy.name.lower()).alias("type"),
        pl.lit(None).cast(pl.Float64).alias("profit_pct"),
        pl.lit(None).cast(pl.Float64).alias("profit_pct_vs_high"),
    ]).with_columns([pl.col("value").cast(pl.Float64)])
    # 生成卖出事件及收益
    sells_df = signals.select([
        pl.col("idx"),
        pl.col("sell_date_nxt").cast(pl.Utf8).alias("date"),
        pl.col("sell_open_nxt").alias("value"),
        pl.lit(TradeTypeEnum.Sell.name.lower()).alias("type"),
        (((pl.col("sell_open_nxt") - pl.col("close")) / pl.col("close")) * 100.0).round(2).alias("profit_pct"),
        (((pl.col("sell_high_nxt") - pl.col("close")) / pl.col("close")) * 100.0).round(2).alias("profit_pct_vs_high"),
    ]).with_columns([pl.col("value").cast(pl.Float64)])
    # 合并买卖事件并按顺序排序
    items_df = pl.concat([
        buys_df.with_columns(pl.lit(0).alias("seq")),
        sells_df.with_columns(pl.lit(1).alias("seq")),
    ]).sort(["idx", "seq"]) 
    # 统计平均收益
    avg_df = signals.select((((pl.col("sell_open_nxt") - pl.col("close")) / pl.col("close")) * 100.0).mean().alias("avg"))
    avg_val = avg_df["avg"][0] if avg_df.height > 0 else None
    expected_profit_pct = 0.0 if avg_val is None else round(float(avg_val), 2)
    # 序列化事件列表
    items = items_df.select(["date", "value", "type", "profit_pct", "profit_pct_vs_high"]).to_dicts()
    return {"items": items, "expected_profit_pct": expected_profit_pct}


async def dispatch_strategy(params: StrategyRunParams) -> Dict[str, Any]:
    sid = int(params.strategyId)
    try:
        st = StrategyEnum(sid)
    except Exception:
        return {"items": [], "expected_profit_pct": 0.0}
    if st == StrategyEnum.InvertedHammerNextDayExitV1:
        return await run_inverted_hammer_next_day_exit_v1(params)
    return {"items": [], "expected_profit_pct": 0.0}
