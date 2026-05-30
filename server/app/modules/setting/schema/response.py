from __future__ import annotations

from typing import List

from pydantic import BaseModel, Field


class StrategyItem(BaseModel):
    strategy_id: int = Field()  # 策略ID
    title: str = Field()  # 策略名称
    desc: str = Field()  # 策略描述


class StrategyListResponse(BaseModel):
    count: int = Field()  # 策略数量
    items: List[StrategyItem] = Field()  # 策略列表
