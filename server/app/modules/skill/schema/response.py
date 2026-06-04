from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class FetchEtfBaseDataResponse(BaseModel):
    code: str = Field()
    source: str = Field()
    fetched_at: str = Field()
    target_quarter_end: str = Field()
    report_type: str = Field()
    position_report: Optional[str] = Field(default=None)
    scale: Optional[str] = Field(default=None)
    kLineData: List[Dict[str, Any]] = Field()
    holdings: List[Dict[str, Any]] = Field()
