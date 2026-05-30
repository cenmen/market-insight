from __future__ import annotations

from fastapi import APIRouter, Depends
import asyncio
from aiocache import SimpleMemoryCache

from app.core.context import Context, build_context
from app.core.response import ResponseModel
from app.modules.basic.schema.request import KlineParams, SearchStockParams
from app.modules.basic.schema.response import KlineBar, KlineResponse, SearchStockItem, SearchStockResponse
from app.modules.basic.service import load_kline_by_tx_cached, search_stocks

router = APIRouter()


kline_cache = SimpleMemoryCache()


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
