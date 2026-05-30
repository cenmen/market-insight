from __future__ import annotations

from fastapi import APIRouter, Depends

from datetime import datetime

from app.config.settings import settings
from app.core.context import Context, build_context
from app.core.response import ResponseModel
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
