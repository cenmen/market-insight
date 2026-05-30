from __future__ import annotations

from pydantic import Field

from app.modules.basic.schema.request import KlineParams


class StrategyRunParams(KlineParams):
    strategyId: int = Field(description="策略ID")
