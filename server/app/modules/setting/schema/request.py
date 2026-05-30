from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field


class StrategyListParams(BaseModel):
    keyword: Optional[str] = Field(default=None, description="关键词（按标题或描述过滤）")
