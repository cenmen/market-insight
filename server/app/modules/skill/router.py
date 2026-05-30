from __future__ import annotations

from fastapi import APIRouter, Depends

from app.core.context import Context, build_context
from app.core.response import ResponseModel
from app.modules.skill.schema.request import FetchEtfBaseDataParams
from app.modules.skill.schema.response import FetchEtfBaseDataResponse
from app.modules.skill.service import fetch_etf_base_data

router = APIRouter()


@router.get(
    "/etf/base-data",
    response_model=ResponseModel,
    summary="一次性获取ETF基础数据",
    description="供 skill 调用，返回 ETF K线、前十大持仓及持仓股单期财务指标",
)
def get_etf_base_data(params: FetchEtfBaseDataParams = Depends(), context: Context = Depends(build_context)):
    record = fetch_etf_base_data(params.code, params.klineLimit)
    data = FetchEtfBaseDataResponse.model_validate(record)
    return ResponseModel.success(data=data, request_id=context.request_id)
