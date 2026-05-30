from __future__ import annotations

from typing import Any, Optional

from pydantic import BaseModel


class ResponseModel(BaseModel):
    code: int = 0
    success: bool = True
    data: Optional[Any] = None
    message: Optional[str] = None
    request_id: Optional[str] = None

def _resp_success(
    data: Any | None = None,
    message: Optional[str] = None,
    request_id: Optional[str] = None,
) -> ResponseModel:
    return ResponseModel(code=0, success=True, data=data, message=message, request_id=request_id)


def _resp_fail(
    code: int = 1,
    data: Any | None = None,
    message: Optional[str] = None,
    request_id: Optional[str] = None,
) -> ResponseModel:
    return ResponseModel(code=code, success=False, data=data, message=message, request_id=request_id)


ResponseModel.success = staticmethod(_resp_success)
ResponseModel.fail = staticmethod(_resp_fail)
