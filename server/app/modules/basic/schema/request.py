from __future__ import annotations

from typing import Optional

from pydantic import BaseModel, Field

from app.constants.enums import PeriodEnum


class KlineParams(BaseModel):
    code: str = Field(..., description="股票代码", min_length=1, json_schema_extra={"example": "600519"})
    period: PeriodEnum = Field(default=PeriodEnum.Daily, description="周期，枚举: daily/weekly/monthly")
    startDate: str = Field(
        ...,
        pattern=r"^20(0\d|1\d|2\d|3\d|4\d|50)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$",
        description="开始日期，格式 YYYYMMDD（合法日期，年份 2000-2050）",
        json_schema_extra={"example": "20250101"},
    )
    endDate: str = Field(
        ...,
        pattern=r"^20(0\d|1\d|2\d|3\d|4\d|50)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])$",
        description="结束日期，格式 YYYYMMDD（合法日期，年份 2000-2050）",
        json_schema_extra={"example": "20500101"},
    )
    adjust: Optional[str] = Field(default=None, description="复权参数: 默认不复权；qfq 前复权；hfq 后复权")
    timeout: Optional[float] = Field(default=None, description="请求超时（秒）")


class SearchStockParams(BaseModel):
    keyword: str = Field(..., description="关键词，支持股票代码或名称的部分匹配", min_length=1, json_schema_extra={"example": "伊利股份"})
