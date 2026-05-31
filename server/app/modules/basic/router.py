from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.context import Context, build_context
from app.core.response import ResponseModel
from app.modules.basic.schema.request import (
    FundKlineParams,
    FundTopHoldingsParams,
    KlineParams,
    SearchStockParams,
    StockMainFinanceParams,
)
from app.modules.basic.schema.response import (
    FundKlineItem,
    FundKlineResponse,
    FundTopHoldingItem,
    FundTopHoldingsResponse,
    KlineBar,
    KlineResponse,
    QuarterFinanceItem,
    SearchStockItem,
    SearchStockResponse,
)
from app.modules.basic.service import (
    fetch_fund_kline,
    fetch_fund_top_holdings,
    fetch_stock_main_finance,
    load_kline_by_tx_cached,
    search_stocks,
)

router = APIRouter()


@router.get(
    "/kline",
    response_model=ResponseModel,
    summary="获取K线数据",
    description="按股票代码与周期返回K线列表",
)
async def get_kline(params: KlineParams = Depends(), context: Context = Depends(build_context)):
    df = await load_kline_by_tx_cached(params)
    records = df.to_dicts()
    bars = [KlineBar.model_validate(r) for r in records]
    data = KlineResponse(code=params.code, count=len(bars), lines=bars)
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/search",
    response_model=ResponseModel,
    summary="搜索股票",
    description="根据关键词匹配股票代码与名称",
)
def search(params: SearchStockParams = Depends(), context: Context = Depends(build_context)):
    records = search_stocks(params)
    items = [SearchStockItem.model_validate(r) for r in records]
    data = SearchStockResponse(count=len(items), items=items)
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/fund/top-holdings",
    response_model=ResponseModel,
    summary="获取ETF前十大持仓",
    description="按基金代码返回前十大持仓及持仓报告期",
)
def get_fund_top_holdings(params: FundTopHoldingsParams = Depends(), context: Context = Depends(build_context)):
    records, position_report = fetch_fund_top_holdings(params.code)
    items = [FundTopHoldingItem.model_validate(r) for r in records]
    data = FundTopHoldingsResponse(
        code=params.code,
        count=len(items),
        position_report=position_report,
        items=items,
    )
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/fund/kline",
    response_model=ResponseModel,
    summary="获取ETF基金K线",
    description="按基金代码返回指定条数的日K线数据",
)
def get_fund_kline(params: FundKlineParams = Depends(), context: Context = Depends(build_context)):
    records = fetch_fund_kline(params.code, params.limit)
    items = [FundKlineItem.model_validate(r) for r in records]
    data = FundKlineResponse(code=params.code, count=len(items), lines=items)
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/stock/main-finance",
    response_model=ResponseModel,
    summary="获取股票核心财务指标",
    description="按股票代码与报告类型返回单期核心财务指标",
)
def get_stock_main_finance(params: StockMainFinanceParams = Depends(), context: Context = Depends(build_context)):
    record = fetch_stock_main_finance(params.stockCode, params.reportType)
    data = QuarterFinanceItem.model_validate(record) if record else None
    return ResponseModel.success(data=data, request_id=context.request_id)
