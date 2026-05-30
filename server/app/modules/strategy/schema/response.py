from __future__ import annotations

from typing import List, Optional

from pydantic import BaseModel, Field


class TradeItem(BaseModel):
    date: str = Field()  # 交易日期
    value: float = Field()  # 价格（元）
    type: str = Field()  # 事件类型：buy/sell
    profit_pct: Optional[float] = Field(default=None)  # 盈利百分比（仅卖点）
    profit_pct_vs_high: Optional[float] = Field(default=None)  # 相对买入日最高价的收益（%，仅卖点）


class StrategyRunResponse(BaseModel):
    items: List[TradeItem] = Field()  # 交易事件列表
    expected_profit_pct: float = Field()  # 预计平均收益（%）
