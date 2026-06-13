from __future__ import annotations

from fastapi import APIRouter, Depends

from datetime import datetime

from app.config.settings import settings
from app.core.context import Context, build_context
from app.core.response import ResponseModel
from app.modules.setting.service import get_setting_payload
from app.utils.time import format_dt

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
    "/etf-tracking",
    response_model=ResponseModel,
    summary="获取 ETF 跟踪配置",
    description="返回 ETF 主题配置、当前启用配置和启用主题 key，供 frontend 与 skill 统一查询",
)
def get_etf_tracking(context: Context = Depends(build_context)):
    return ResponseModel.success(data=get_setting_payload(), request_id=context.request_id)
