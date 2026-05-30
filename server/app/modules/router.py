from fastapi import APIRouter

from app.modules.basic.router import router as basic_router
from app.modules.setting.router import router as setting_router
from app.modules.skill.router import router as skill_router

router = APIRouter()

router.include_router(basic_router, prefix="/basic", tags=["基础数据"])
router.include_router(setting_router, prefix="/setting", tags=["系统设置"])
router.include_router(skill_router, prefix="/skill", tags=["Skill 数据"])
