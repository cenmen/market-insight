from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.context import Context, build_context
from app.core.response import ResponseModel
from app.modules.setting.schema.request import StrategyListParams
from app.modules.setting.schema.response import StrategyItem, StrategyListResponse
from app.modules.setting.service import list_strategies as query_strategies
from app.config.settings import settings
from app.utils.time import format_dt
from datetime import datetime

router = APIRouter()

@router.get(
    "/health",
    response_model=ResponseModel,
    summary="系统健康检查",
    description="返回服务健康状态与版本信息",
)
def health(context: Context = Depends(build_context)):
    now = datetime.now()
    health_data = {
        "timestamp": format_dt(now),
        "service": settings.app_name,
        "version": settings.version,
    }
    return ResponseModel.success(data=health_data, request_id=context.request_id)

@router.get(
    "/strategies",
    response_model=ResponseModel,
    summary="获取策略集合",
    description="返回可用策略列表",
)
def list_strategies(params: StrategyListParams = Depends(), context: Context = Depends(build_context)):
    items = query_strategies(params)
    models = [StrategyItem.model_validate(it) for it in items]
    data = StrategyListResponse(count=len(models), items=models)
    return ResponseModel.success(data=data, request_id=context.request_id)

