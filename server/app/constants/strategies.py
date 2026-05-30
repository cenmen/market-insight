from __future__ import annotations

from typing import Any, Dict, List

from app.constants.enums import StrategyEnum

STRATEGIES: List[Dict[str, Any]] = [
    {
        "strategy_id": int(StrategyEnum.InvertedHammerNextDayExitV1),
        "title": "倒锤子线抄底·次日卖出（V1）",
        "desc": "出现倒锤子线当日建仓，次日卖出",
    }
]
