from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.core.context import Context, build_context
from app.core.response import ResponseModel
from app.modules.skill.schema.request import FetchEtfBaseDataParams
from app.modules.skill.schema.response import FetchEtfBaseDataResponse
from app.modules.skill.service import fetch_etf_base_data_cached, fetch_sector_congestion

router = APIRouter()


@router.get(
    "/etf/base-data",
    response_model=ResponseModel,
    summary="一次性获取ETF基础数据",
    description="供 skill 调用，返回 ETF K线、前十大持仓及持仓股单期财务指标",
)
async def get_etf_base_data(params: FetchEtfBaseDataParams = Depends(), context: Context = Depends(build_context)):
    record = await fetch_etf_base_data_cached(params.code, params.klineLimit)
    data = FetchEtfBaseDataResponse.model_validate(record)
    return ResponseModel.success(data=data, request_id=context.request_id)


@router.get(
    "/sector/congestion",
    response_model=ResponseModel,
    summary="获取板块拥挤度",
    description="按主题 key 返回沪深两市成交额与对应板块/指数成交额占比，主题 key 参考 etfBaseList 的 key；不传 themeKeys 时只返回基础成交额字段",
)
async def get_sector_congestion(
    themeKeys: str | None = Query(
        default=None,
        description="主题 key 列表，逗号分隔，参考 frontend/src/data/etfBaseList.js 中的 key",
        examples=["ai,communication,robot,chip"],
    ),
    days: int = Query(default=90, ge=1, le=240, description="最近交易日数量", examples=[90]),
    context: Context = Depends(build_context),
):
    theme_key_list = [item.strip() for item in themeKeys.split(",")] if themeKeys else []
    theme_key_list = [item for item in theme_key_list if item]
    records = await fetch_sector_congestion(theme_key_list, days)
    return ResponseModel.success(data=records, request_id=context.request_id)
