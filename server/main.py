"""
FastAPI 基础应用
"""

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from scalar_fastapi import get_scalar_api_reference, Layout
import logging

from app.core.exception import register_api_error_handlers
from app.core.middleware import RequestLoggingMiddleware
from app.core.logger import get_logger
from app.modules.router import router as api_router


def create_app() -> FastAPI:
    """创建并配置 FastAPI 应用。

    - 加载环境变量并创建应用实例。
    - 配置 CORS 允许来源。
    - 注册统一异常处理。
    - 挂载聚合路由（前缀为 /api）。
    """

    app = FastAPI(
        title="量化回测系统",
        description="基于 FastAPI 的投资量化回测数据服务",
        version="1.0.0",
        docs_url=None,
        redoc_url=None,
    )

    logging.getLogger("uvicorn.access").disabled = True

    get_logger()
    register_api_error_handlers(app)
    app.add_middleware(RequestLoggingMiddleware)

    app.include_router(api_router, prefix="/api")

    @app.get("/docs", include_in_schema=False)
    async def scalar_docs():
        return get_scalar_api_reference(
            title="接口文档（Scalar）",
            openapi_url="/openapi.json",
            dark_mode=True,
            hide_models=False,
            layout=Layout.MODERN,
        )

    return app


# 供 `uvicorn app:app --reload` 引用
app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000, access_log=False)
