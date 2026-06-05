from __future__ import annotations

from typing import Any, Dict

import httpx


def _safe_float(value: Any, default: float = 0.0) -> float:
    """把接口数值统一转换成 float。"""
    if value is None:
        return default
    if isinstance(value, (int, float)):
        return float(value)
    text = str(value).strip().replace("%", "").replace(",", "")
    if not text or text in {"--", "nan", "None"}:
        return default
    try:
        return float(text)
    except ValueError:
        return default


def _nullable_float(value: Any) -> float | None:
    """把行情快照字段转换成 float，空值保持 None。"""
    if value is None:
        return None
    if isinstance(value, str) and value.strip() in {"", "--", "nan", "None"}:
        return None
    return _safe_float(value)


def _ths_market(code_value: str) -> str:
    """转换同花顺基金接口要求的市场代码。"""
    code = str(code_value).zfill(6)
    return "20" if code.startswith(("5", "6", "9")) else "36"


def fetch_fund_snapshot(code: str) -> Dict[str, Any] | None:
    """抓取同花顺基金最新快照，返回可读字段并保留原始字段映射。"""
    normalized_code = str(code).zfill(6)
    data_fields = [
        "7",
        "8",
        "9",
        "10",
        "11",
        "13",
        "19",
        "24",
        "30",
        "6",
        "264648",
        "199112",
        "1968584",
        "3153",
        "3541450",
        "3475914",
        "1771976",
        "65551",
    ]
    request_body = {
        "code_list": [{"codes": [normalized_code], "market": _ths_market(normalized_code)}],
        "trade_class": "post_market",
        "data_fields": data_fields,
        "lang": "zh_hans",
        "gpid": 1,
    }

    try:
        response = httpx.post(
            "https://quota-h.10jqka.com.cn/fuyao/common_hq_aggr/quote/v1/multi_last_snapshot",
            json=request_body,
            timeout=20.0,
            follow_redirects=True,
        )
        data = response.json()
    except Exception as exc:
        raise RuntimeError(f"获取基金快照失败: {exc}")

    if data.get("status_code") != 0:
        message = data.get("status_msg") or "未知错误"
        raise RuntimeError(f"获取基金快照失败: {message}")

    quote_data = (data.get("data") or {}).get("quote_data") or []
    if not quote_data:
        return None

    quote = quote_data[0]
    fields = quote.get("data_fields") or []
    values_list = quote.get("value") or []
    values = values_list[0] if values_list and isinstance(values_list[0], list) else []
    raw_fields = {str(field): values[index] if index < len(values) else None for index, field in enumerate(fields)}
    return {
        "code": quote.get("code") or normalized_code,
        "market": quote.get("market"),
        "tradeClass": quote.get("65541"),
        "previousClose": _nullable_float(raw_fields.get("6")),
        "open": _nullable_float(raw_fields.get("7")),
        "high": _nullable_float(raw_fields.get("8")),
        "low": _nullable_float(raw_fields.get("9")),
        "latest": _nullable_float(raw_fields.get("10") if raw_fields.get("10") is not None else raw_fields.get("30")),
        "averagePrice": _nullable_float(raw_fields.get("24")),
        "volume": _nullable_float(raw_fields.get("13")),
        "amount": _nullable_float(raw_fields.get("19")),
        "changeAmount": _nullable_float(raw_fields.get("264648")),
        "changePercent": _nullable_float(raw_fields.get("1771976")),
        "amplitude": _nullable_float(raw_fields.get("1968584")),
        "turnoverRate": _nullable_float(raw_fields.get("199112")),
        "totalMarketValue": _nullable_float(raw_fields.get("3475914")),
        "circulatingMarketValue": _nullable_float(raw_fields.get("3541450")),
    }
