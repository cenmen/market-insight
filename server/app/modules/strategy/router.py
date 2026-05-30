from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.context import Context, build_context
from app.core.response import ResponseModel
from app.modules.strategy.schema.request import StrategyRunParams
from app.modules.strategy.schema.response import StrategyRunResponse, TradeItem
from app.modules.strategy.service import dispatch_strategy

router = APIRouter()


@router.get(
    "/signals",
    response_model=ResponseModel,
    summary="策略信号计算",
    description="接收 K线参数与策略ID，分发到对应策略并返回买卖信号与预计收益",
)
async def signals(params: StrategyRunParams = Depends(), context: Context = Depends(build_context)):
    data = await dispatch_strategy(params)
    items = [TradeItem.model_validate(it) for it in data.get("items", [])]
    resp = StrategyRunResponse(items=items, expected_profit_pct=float(data.get("expected_profit_pct", 0.0)))
    return ResponseModel.success(data=resp, request_id=context.request_id)
