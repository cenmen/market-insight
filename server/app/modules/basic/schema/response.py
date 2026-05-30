from __future__ import annotations

from typing import List, Optional

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
