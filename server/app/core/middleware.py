from __future__ import annotations

import json
import time
import uuid
from typing import Any

from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.core.logger import get_logger


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Any:
        rid = request.headers.get("X-Request-Id") or uuid.uuid4().hex
        request.state.request_id = rid
        body_obj = None
        try:
            raw = await request.body()
            if raw:
                try:
                    body_obj = json.loads(raw)
                except Exception:
                    body_obj = None
        except Exception:
            body_obj = None
        start = time.perf_counter()
        logger = get_logger()
        logger.info(
            {
                "event": "request",
                "request_id": rid,
                "method": request.method,
                "path": request.url.path,
                "query": dict(request.query_params),
                "body": body_obj,
                "user_id": request.headers.get("X-User-Id"),
            }
        )
        response = await call_next(request)
        resp_data = None
        try:
            ct = (response.headers.get("content-type") or "").lower()
            if "application/json" in ct:
                body_bytes = getattr(response, "body", None)
                if isinstance(body_bytes, (bytes, bytearray)) and len(body_bytes) > 0:
                    payload = json.loads(body_bytes.decode("utf-8"))
                    resp_data = payload.get("data")
        except Exception:
            resp_data = None
        elapsed_ms = int((time.perf_counter() - start) * 1000)
        logger.info(
            {
                "event": "response",
                "request_id": rid,
                "status": getattr(response, "status_code", None),
                "elapsed_ms": elapsed_ms,
                "data": resp_data,
            }
        )
        response.headers["X-Request-Id"] = rid
        return response
