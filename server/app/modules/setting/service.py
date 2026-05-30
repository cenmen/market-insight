from __future__ import annotations

from typing import List, Dict, Any

from app.modules.setting.schema.request import StrategyListParams
from app.constants.strategies import STRATEGIES


def list_strategies(params: StrategyListParams) -> List[Dict[str, Any]]:
    kw = str(params.keyword or "").strip().lower()
    if not kw:
        return STRATEGIES
    return [
        it
        for it in STRATEGIES
        if kw in str(it.get("title", "")).lower() or kw in str(it.get("desc", "")).lower()
    ]
