from __future__ import annotations

import asyncio

from fastapi import APIRouter, Depends

from app.core.context import Context, build_context
from app.core.response import ResponseModel
from app.modules.basic.schema.request import (
    FundKlineParams,
    FundSnapshotParams,
    FundTopHoldingsParams,
    MarketTurnoverParams,
    KlineParams,
    SearchStockParams,
    StockMainFinanceParams,
    IndexKlineByTxParams,
)
from app.modules.basic.schema.response import (
    FundKlineItem,
    FundKlineResponse,
    FundSnapshotItem,
    FundTopHoldingItem,
    FundTopHoldingsResponse,
    MarketTurnoverItem,
    MarketTurnoverResponse,
    KlineBar,
    KlineResponse,
    QuarterFinanceItem,
    SearchStockItem,
    SearchStockResponse,
    IndexKlineByTxResponse,
)
from app.modules.basic.api.fetch_market_turnover import sync_market_turnover_csv
from app.modules.basic.service import (
    fetch_fund_kline_cached,
    fetch_fund_snapshot_cached,
    fetch_fund_top_holdings_cached,
    fetch_kline_by_tx_cached,
    fetch_search_stocks_cached,
    fetch_index_kline_by_tx_cached,
    fetch_stock_main_finance_cached,
)

router = APIRouter()


@router.get(
    "/kline",
    response_model=ResponseModel,
    summary="获取K线数据（腾讯证券）",
    description="按股票代码与周期返回 K 线列表，数据来自腾讯证券行情源（通过 AkShare 适配）",
)
async def get_kline(params: KlineParams = Depends(), context: Context = Depends(build_context)):
    df = await fetch_kline_by_tx_cached(params)
    records = df.to_dicts()
    bars = [KlineBar.model_validate(r) for r in records]
    data = KlineResponse(code=params.code, count=len(bars), lines=bars)
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/search",
    response_model=ResponseModel,
    summary="搜索股票（东方财富）",
    description="根据关键词匹配股票代码与名称，数据来自东方财富搜索接口",
)
async def search(params: SearchStockParams = Depends(), context: Context = Depends(build_context)):
    records = await fetch_search_stocks_cached(params)
    items = [SearchStockItem.model_validate(r) for r in records]
    data = SearchStockResponse(count=len(items), items=items)
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/fund/top-holdings",
    response_model=ResponseModel,
    summary="获取ETF前十大持仓（东方财富）",
    description="按基金代码返回前十大持仓及持仓报告期，数据来自东方财富基金持仓接口",
)
async def get_fund_top_holdings(params: FundTopHoldingsParams = Depends(), context: Context = Depends(build_context)):
    records, position_report = await fetch_fund_top_holdings_cached(params.code)
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
    summary="获取ETF基金K线（同花顺）",
    description="按基金代码返回指定条数的日 K 线数据，数据来自同花顺基金行情接口",
)
async def get_fund_kline(params: FundKlineParams = Depends(), context: Context = Depends(build_context)):
    records = await fetch_fund_kline_cached(params.code, params.limit)
    items = [FundKlineItem.model_validate(r) for r in records]
    data = FundKlineResponse(code=params.code, count=len(items), lines=items)
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/fund/snapshot",
    response_model=ResponseModel,
    summary="获取ETF基金最新快照（同花顺）",
    description="按基金代码返回最新行情快照信息，数据来自同花顺基金快照接口",
)
async def get_fund_snapshot(params: FundSnapshotParams = Depends(), context: Context = Depends(build_context)):
    record = await fetch_fund_snapshot_cached(params.code)
    data = FundSnapshotItem.model_validate(record) if record else None
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/stock/main-finance",
    response_model=ResponseModel,
    summary="获取股票核心财务指标（东方财富）",
    description="按股票代码与报告类型返回单期核心财务指标，数据来自东方财富财务接口",
)
async def get_stock_main_finance(params: StockMainFinanceParams = Depends(), context: Context = Depends(build_context)):
    record = await fetch_stock_main_finance_cached(params.stockCode, params.reportType)
    data = QuarterFinanceItem.model_validate(record) if record else None
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/market/turnover",
    response_model=ResponseModel,
    summary="获取最近90个交易日沪深两市成交额（AKShare）",
    description="使用 AKShare + 本地 CSV 缓存同步最近交易日成交额数据，缺失日期才补抓。",
)
async def get_market_turnover(params: MarketTurnoverParams = Depends(), context: Context = Depends(build_context)):
    """返回最近 N 个交易日沪深两市成交额。"""
    records = await asyncio.to_thread(sync_market_turnover_csv, params.days)
    items = [MarketTurnoverItem.model_validate(record) for record in records]
    data = MarketTurnoverResponse(count=len(items), items=items)
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/index/kline",
    response_model=ResponseModel,
    summary="获取指数历史K线数据（腾讯证券）",
    description="按腾讯指数代码返回历史 K 线对象数组，仅保留 klines 数据",
)
async def get_index_kline_by_tx(params: IndexKlineByTxParams = Depends(), context: Context = Depends(build_context)):
    klines = await fetch_index_kline_by_tx_cached(params)
    data = IndexKlineByTxResponse(code=params.code, count=len(klines), klines=klines)
    return ResponseModel.success(data=data, request_id=context.request_id)
