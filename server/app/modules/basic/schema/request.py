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


class FundTopHoldingsParams(BaseModel):
    code: str = Field(..., description="ETF 基金代码", min_length=1, json_schema_extra={"example": "588200"})


class FundKlineParams(BaseModel):
    code: str = Field(..., description="ETF 基金代码", min_length=1, json_schema_extra={"example": "588200"})
    limit: int = Field(default=60, description="返回K线条数", ge=1, le=500)


class FundSnapshotParams(BaseModel):
    code: str = Field(..., description="ETF 基金代码", min_length=1, json_schema_extra={"example": "588200"})


class StockMainFinanceParams(BaseModel):
    stockCode: str = Field(..., description="股票代码", min_length=1, json_schema_extra={"example": "600519"})
    reportType: str = Field(..., description="报告类型，如 一季报/中报/三季报/年报", min_length=1, json_schema_extra={"example": "一季报"})


class MarketTurnoverParams(BaseModel):
    """市场成交额接口的查询参数。"""

    days: int = Field(default=90, ge=1, le=240, description="需要返回的最近交易日数量", json_schema_extra={"example": 90})


class IndexKlineByTxParams(BaseModel):
    code: str = Field(
        ...,
        description="指数代码，不带市场前缀，例如 000685",
        min_length=6,
        max_length=6,
        json_schema_extra={"example": "000685"},
    )
    limit: int = Field(default=320, description="返回日K线条数", ge=1, le=1000)
