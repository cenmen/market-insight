from fastapi import APIRouter

from app.modules.basic.router import router as basic_router
from app.modules.setting.router import router as setting_router

router = APIRouter()

router.include_router(basic_router, prefix="/basic", tags=["基础数据"])
router.include_router(setting_router, prefix="/setting", tags=["系统设置"])
