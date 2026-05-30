from __future__ import annotations

from pydantic import BaseModel, Field


class FetchEtfBaseDataParams(BaseModel):
    code: str = Field(..., description="ETF 基金代码", min_length=1, json_schema_extra={"example": "588200"})
    klineLimit: int = Field(default=60, description="K线条数", ge=1, le=500)
