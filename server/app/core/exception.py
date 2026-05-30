from __future__ import annotations

from typing import Any

from fastapi import FastAPI
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from app.core.logger import get_logger
from app.core.response import ResponseModel


class APIError(Exception):
    def __init__(
        self, message: str, *, code: int = -1, status_code: int = 400, data: Any | None = None
    ) -> None:
        super().__init__(message)
        self.code = code
        self.status_code = status_code
        self.message = message
        self.data = data


def register_api_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(APIError)
    async def _api_error_handler(request, exc: APIError):  # type: ignore[override]
        logger = get_logger()
        rid = getattr(getattr(request, "state", None), "request_id", None)
        logger.error({"event": "api_error", "request_id": rid, "path": str(request.url.path), "status_code": exc.status_code, "code": exc.code, "message": exc.message})
        content = ResponseModel.fail(code=exc.code, data=exc.data, message=exc.message, request_id=rid).model_dump()
        return JSONResponse(status_code=exc.status_code, content=content)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger = get_logger()
        rid = getattr(getattr(request, "state", None), "request_id", None)
        logger.exception({"event": "validation_error", "request_id": rid, "path": str(request.url.path)})
        fields: list[str] = []
        try:
            for err in exc.errors():
                loc = err.get("loc") or []
                name = None
                for part in reversed(loc):
                    if part in ("body", "query", "path", "header"):
                        continue
                    name = str(part)
                    break
                if name:
                    fields.append(name)
        except Exception:
            pass
        if fields:
            msg = f"请求参数错误（{','.join(sorted(set(fields)))}）"
        else:
            msg = "请求参数错误"
        content = ResponseModel.fail(code=-1, data=None, message=msg, request_id=rid).model_dump()
        return JSONResponse(status_code=400, content=content)

    @app.exception_handler(Exception)
    async def _general_error_handler(request, exc: Exception):
        logger = get_logger()
        rid = getattr(getattr(request, "state", None), "request_id", None)
        logger.exception({"event": "unhandled_error", "request_id": rid, "path": str(request.url.path)})
        content = ResponseModel.fail(code=-1, data=None, message="服务内部错误", request_id=rid).model_dump()
        return JSONResponse(status_code=500, content=content)
