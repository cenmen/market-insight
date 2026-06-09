from __future__ import annotations

from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class KlineBar(BaseModel):
    date: Optional[str] = Field(default=None)  # 交易日
    open: Optional[float] = Field(default=None)  # 开盘价
    close: Optional[float] = Field(default=None)  # 收盘价
    high: Optional[float] = Field(default=None)  # 最高价
    low: Optional[float] = Field(default=None)  # 最低价
    amount: Optional[float] = Field(default=None)  # 成交额（元）
    amplitude: Optional[float] = Field(default=None)  # 振幅（%），(高-低)/开盘*100
    change_pct: Optional[float] = Field(default=None)  # 涨跌幅（%），(收-开)/开盘*100
    change: Optional[float] = Field(default=None)  # 涨跌额（元），收盘-开盘


class KlineResponse(BaseModel):
    code: str = Field()  # 股票代码
    count: int = Field()  # 数据条数
    lines: List[KlineBar] = Field()  # K线条目列表


class SearchStockItem(BaseModel):
    code: str = Field()  # 股票代码
    name: str = Field()  # 股票名称
    marketText: str = Field()  # 市场/板块文本


class SearchStockResponse(BaseModel):
    count: int = Field()  # 结果条数
    items: List[SearchStockItem] = Field()  # 返回的匹配项列表


class QuarterFinanceItem(BaseModel):
    date: str = Field()
    roe: float = Field()
    main_grow: float = Field()
    net_rate: float = Field()
    gross_rate: float = Field()
    rev_grow: float = Field()
    profit_grow: float = Field()


class FundTopHoldingItem(BaseModel):
    stock_code: str = Field()
    stock_name: str = Field()
    hold_rate: float = Field()
    quarter_data: List[QuarterFinanceItem] = Field(default_factory=list)


class FundTopHoldingsResponse(BaseModel):
    code: str = Field()
    count: int = Field()
    position_report: Optional[str] = Field(default=None)
    items: List[FundTopHoldingItem] = Field()


class FundKlineItem(BaseModel):
    date: Optional[str] = Field(default=None)
    open: Optional[float] = Field(default=None)
    close: Optional[float] = Field(default=None)
    high: Optional[float] = Field(default=None)
    low: Optional[float] = Field(default=None)
    volume: Optional[float] = Field(default=None)
    amount: Optional[float] = Field(default=None)
    amplitude: Optional[float] = Field(default=None)
    maxDrawdown: Optional[float] = Field(default=None)  # 最大跌幅（%），(最低-开盘)/开盘*100
    changePercent: Optional[float] = Field(default=None)
    changeAmount: Optional[float] = Field(default=None)
    turnoverRate: Optional[float] = Field(default=None)


class FundKlineResponse(BaseModel):
    code: str = Field()
    count: int = Field()
    lines: List[FundKlineItem] = Field()


class FundSnapshotItem(BaseModel):
    code: str = Field()
    market: Optional[str] = Field(default=None)
    tradeClass: Optional[str] = Field(default=None)
    previousClose: Optional[float] = Field(default=None)
    open: Optional[float] = Field(default=None)
    high: Optional[float] = Field(default=None)
    low: Optional[float] = Field(default=None)
    latest: Optional[float] = Field(default=None)
    averagePrice: Optional[float] = Field(default=None)
    volume: Optional[float] = Field(default=None)
    amount: Optional[float] = Field(default=None)
    changeAmount: Optional[float] = Field(default=None)
    changePercent: Optional[float] = Field(default=None)
    amplitude: Optional[float] = Field(default=None)
    turnoverRate: Optional[float] = Field(default=None)
    totalMarketValue: Optional[float] = Field(default=None)
    circulatingMarketValue: Optional[float] = Field(default=None)


class MarketTurnoverItem(BaseModel):
    """单日沪深两市成交额数据。"""

    date: str = Field(description="交易日，YYYYMMDD")
    sse_amount: float = Field(description="上交所成交额，单位亿元")
    szse_amount: float = Field(description="深交所成交额，单位亿元")
    total_amount: float = Field(description="沪深两市成交额合计，单位亿元")
    unit: str = Field(default="亿元", description="金额单位")
    source: str = Field(default="AKShare", description="数据来源")


class MarketTurnoverResponse(BaseModel):
    """市场成交额接口返回体。"""

    count: int = Field(description="返回条数")
    items: list[MarketTurnoverItem] = Field(default_factory=list)
    message: Optional[str] = Field(default=None, description="说明信息")


class IndexKlineByTxResponse(BaseModel):
    code: str = Field(description="指数代码")
    count: int = Field(description="历史日K线条数")
    klines: list[list[Any]] = Field(default_factory=list, description="腾讯原始日K线数组")
