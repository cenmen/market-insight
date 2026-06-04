from __future__ import annotations

from typing import Any, Dict, List, Optional, Tuple
from datetime import datetime
import json
import re
import time

import akshare as ak
import httpx
import polars as pl
import asyncio
from aiocache import SimpleMemoryCache

from app.utils.tool import get_stock_info_by_code
from app.modules.basic.schema.request import KlineParams, SearchStockParams

kline_cache = SimpleMemoryCache()


def safe_float(value: Any, default: float = 0.0) -> float:
    """统一把接口里的百分比、逗号数字、空值转换成 float。"""
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


def parse_jsonp_payload(text: str) -> Dict[str, Any]:
    """解析东方财富基金持仓接口返回的 JSONP 包装。"""
    payload = text.strip()
    if payload.endswith(";"):
        payload = payload[:-1]
    start = payload.find("(")
    end = payload.rfind(")")
    if start == -1 or end == -1 or end <= start:
        raise ValueError("响应不是合法 JSONP")
    return json.loads(payload[start + 1 : end])


def secucode(stock_code: str) -> str:
    """转换东方财富财务接口要求的证券代码格式，例如 688981 -> 688981.SH。"""
    code = str(stock_code).zfill(6)
    market = "SH" if code.startswith(("5", "6", "9")) else "SZ"
    return f"{code}.{market}"


def secid(code_value: str) -> str:
    """转换东方财富行情接口要求的证券代码格式，例如 588200 -> 1.588200。"""
    code = str(code_value).zfill(6)
    market = "1" if code.startswith(("5", "6", "9")) else "0"
    return f"{market}.{code}"


def ths_market(code_value: str) -> str:
    """转换同花顺 K 线接口要求的市场代码。"""
    code = str(code_value).zfill(6)
    return "20" if code.startswith(("5", "6", "9")) else "36"


def normalize_quarter_date(value: Any) -> str | None:
    """把接口可能返回的报告期格式统一成 YYYY-MM-DD。"""
    text = str(value or "").strip()
    if not text:
        return None

    match = re.match(r"^(\d{4})[-/](\d{2})[-/](\d{2})", text)
    if match:
        year, month, day = match.groups()
        return f"{year}-{month}-{day}"

    match = re.match(r"^(\d{4})Q([1-4])$", text, re.IGNORECASE)
    if match:
        year = int(match.group(1))
        quarter = int(match.group(2))
        return f'{year}-{["03-31", "06-30", "09-30", "12-31"][quarter - 1]}'

    match = re.match(r"^(\d{4})年([1-4])季报?$", text)
    if match:
        year = int(match.group(1))
        quarter = int(match.group(2))
        return f'{year}-{["03-31", "06-30", "09-30", "12-31"][quarter - 1]}'

    return None


def parse_kline_item(item: str) -> Dict[str, Any]:
    """解析东方财富 fields2=f51...f64 返回的单条 CSV K 线。"""
    values = str(item).split(",")
    return {
        "date": values[0] if len(values) > 0 else "",
        "open": safe_float(values[1] if len(values) > 1 else None),
        "close": safe_float(values[2] if len(values) > 2 else None),
        "high": safe_float(values[3] if len(values) > 3 else None),
        "low": safe_float(values[4] if len(values) > 4 else None),
        "volume": safe_float(values[5] if len(values) > 5 else None),
        "amount": safe_float(values[6] if len(values) > 6 else None),
        "amplitude": safe_float(values[7] if len(values) > 7 else None),
        "changePercent": safe_float(values[8] if len(values) > 8 else None),
        "changeAmount": safe_float(values[9] if len(values) > 9 else None),
        "turnoverRate": safe_float(values[10] if len(values) > 10 else None),
    }


def format_ths_timestamp(value: Any) -> str:
    """把同花顺毫秒时间戳转换成 YYYY-MM-DD。"""
    timestamp = safe_float(value)
    if timestamp <= 0:
        return ""
    return datetime.fromtimestamp(timestamp / 1000).strftime("%Y-%m-%d")


def parse_ths_fund_kline_value(item: List[Any], previous_close: float | None = None) -> Dict[str, Any]:
    """解析同花顺单条基金 K 线数组。字段顺序来自 data_fields: 1,7,8,9,11,13,19。"""
    open_price = safe_float(item[1] if len(item) > 1 else None)
    high = safe_float(item[2] if len(item) > 2 else None)
    low = safe_float(item[3] if len(item) > 3 else None)
    close = safe_float(item[4] if len(item) > 4 else None)
    volume = safe_float(item[5] if len(item) > 5 else None)
    amount = safe_float(item[6] if len(item) > 6 else None)
    change_amount = close - previous_close if previous_close else 0.0
    change_percent = (change_amount / previous_close * 100) if previous_close else 0.0
    amplitude = ((high - low) / open_price * 100) if open_price else 0.0
    max_drawdown = ((low - open_price) / open_price * 100) if open_price else 0.0

    return {
        "date": format_ths_timestamp(item[0] if item else None),
        "open": open_price,
        "close": close,
        "high": high,
        "low": low,
        "volume": volume,
        "amount": amount,
        "amplitude": round(amplitude, 2),
        "maxDrawdown": round(max_drawdown, 2),
        "changePercent": round(change_percent, 2),
        "changeAmount": round(change_amount, 3),
        "turnoverRate": 0.0,
    }


def load_kline_by_tx(params: KlineParams) -> pl.DataFrame:
    info = get_stock_info_by_code(params.code)
    prefix = "sh" if info.get("is_sh") else "sz"
    symbol = f"{prefix}{info.get('code')}"
    try:
        pdf = ak.stock_zh_a_hist_tx(
            symbol=symbol,
            start_date=params.startDate,
            end_date=params.endDate,
            adjust=(params.adjust or "qfq"),
            timeout=params.timeout,
        )
    except Exception as exc:
        raise RuntimeError(f"AkShare 数据拉取失败: {exc}")
    if pdf is None or len(pdf) == 0:
        return pl.DataFrame({
            "date": [],
            "open": [],
            "high": [],
            "low": [],
            "close": [],
            "amount": [],
            "amplitude": [],
            "change": [],
            "change_pct": [],
        })
    rename_map = {
        "日期": "date",
        "开盘": "open",
        "收盘": "close",
        "最高": "high",
        "最低": "low",
        "成交额": "amount",
    }
    pdf = pdf.rename(columns={k: v for k, v in rename_map.items() if k in pdf.columns})
    pl_df = pl.from_pandas(pdf)
    # 统一数值列类型为 Float64
    casts = []
    for key in ["open", "high", "low", "close", "amount"]:
        if key in pl_df.columns:
            casts.append(pl.col(key).cast(pl.Float64, strict=False))
    # 日期列统一为字符串
    if "date" in pl_df.columns:
        casts.append(pl.col("date").cast(pl.Utf8))
    # 批量应用类型转换
    if casts:
        pl_df = pl_df.with_columns(casts)
    # 计算振幅百分比 (high-low)/open*100，保护空值与除零
    amplitude_expr = pl.when(
        (pl.col("open").is_not_null())
        & (pl.col("high").is_not_null())
        & (pl.col("low").is_not_null())
        & (pl.col("open") != 0)
    ).then(((pl.col("high") - pl.col("low")) / pl.col("open")) * 100.0).otherwise(None)
    # 计算涨跌额 close - open（空值返回 None）
    change_expr = pl.when((pl.col("open").is_not_null()) & (pl.col("close").is_not_null())).then(pl.col("close") - pl.col("open")).otherwise(None)
    # 计算涨跌幅百分比 ((close-open)/open)*100（保护除零）
    change_pct_expr = pl.when(
        (pl.col("open").is_not_null()) & (pl.col("close").is_not_null()) & (pl.col("open") != 0)
    ).then(((pl.col("close") - pl.col("open")) / pl.col("open")) * 100.0).otherwise(None)
    # 写入派生列
    pl_df = pl_df.with_columns([
        amplitude_expr.alias("amplitude"),
        change_expr.alias("change"),
        change_pct_expr.alias("change_pct"),
    ])
    # 保留两位小数
    pl_df = pl_df.with_columns([
        pl.col("amplitude").round(2),
        pl.col("change").round(2),
        pl.col("change_pct").round(2),
    ])
    # 输出字段列表（按存在选择，避免缺列）
    out_cols = [
        c
        for c in ["date", "open", "high", "low", "close", "amount", "amplitude", "change", "change_pct"]
        if c in pl_df.columns
    ]
    return pl_df.select(out_cols)


async def load_kline_by_tx_cached(params: KlineParams) -> pl.DataFrame:
    adj = params.adjust or ""
    key = f"kline:{params.code}|{params.period.value}|{params.startDate}|{params.endDate}|{adj}"
    cached = await kline_cache.get(key)
    if cached is not None:
        return cached
    df = await asyncio.to_thread(load_kline_by_tx, params)
    await kline_cache.set(key, df, ttl=1800)
    return df


def search_stocks(params: SearchStockParams) -> List[dict]:
    kw = str(params.keyword or "").strip()
    if not kw:
        return []
    query = {
        "client": "web",
        "clientType": "webSuggest",
        "clientVersion": "lastest",
        "keyword": kw,
        "pageIndex": "1",
        "pageSize": "20",
        "securityFilter": "",
        "cb": "jQuery112400000000000000_0",
    }
    headers = {
        "accept": "*/*",
        "referer": "https://www.eastmoney.com/",
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
    }
    try:
        resp = httpx.get(
            "https://search-codetable.eastmoney.com/codetable/search/web",
            params=query,
            headers=headers,
            timeout=8.0,
            follow_redirects=True,
        )
        text = resp.text
    except Exception as exc:
        raise RuntimeError(f"Eastmoney 接口请求失败: {exc}")

    start = text.find("(")
    end = text.rfind(")")
    if start == -1 or end == -1 or end <= start:
        return []
    payload = text[start + 1 : end].strip()
    try:
        data = json.loads(payload)
    except Exception:
        return []

    items = data.get("result") or []
    records: List[dict] = []
    for it in items:
        marketText = str(it.get("securityTypeName") or "")
        code = it.get("code")
        name = it.get("shortName")
        if code and name:
            records.append({"code": str(code), "name": str(name), "marketText": marketText})
    return records


def fetch_fund_top_holdings(code: str) -> Tuple[List[Dict[str, Any]], str | None]:
    """抓取 ETF 前十大持仓，返回持仓列表和持仓报告期。"""
    ts = int(time.time() * 1000)
    callback = f"jQuery3510_{ts}"
    try:
        response = httpx.get(
            "https://fundwebapi.eastmoney.com//FundMEApi/FundPositionList",
            params={
                "callback": callback,
                "pageIndex": 1,
                "pageSize": 10,
                "deviceid": "1234567.py.service",
                "version": "4.3.0",
                "product": "Eastmoney",
                "plat": "Web",
                "FCODE": code,
                "_": ts + 1,
            },
            timeout=20.0,
            follow_redirects=True,
        )
        text = response.text
    except Exception as exc:
        raise RuntimeError(f"获取基金持仓失败: {exc}")

    data = parse_jsonp_payload(text)
    if not data.get("Success"):
        message = data.get("ErrMsg") or data.get("Message") or "未知错误"
        raise RuntimeError(f"获取基金持仓失败: {message}")

    holdings = [
        {
            "stock_code": str(item.get("ShareCode", "")).zfill(6),
            "stock_name": str(item.get("ShareName", "")),
            "hold_rate": safe_float(item.get("ShareProportion")),
            "quarter_data": [],
        }
        for item in data.get("Datas") or []
    ]
    holdings.sort(key=lambda item: item["hold_rate"], reverse=True)
    expansion = data.get("Expansion")
    return holdings[:10], str(expansion) if expansion else None


def fetch_stock_main_finance(stock_code: str, report_type: str) -> Dict[str, Any] | None:
    """抓取单只持仓股票的目标报告期核心财务指标。"""
    try:
        response = httpx.get(
            "https://datacenter.eastmoney.com/securities/api/data/get",
            params={
                "type": "RPT_F10_FINANCE_MAINFINADATA",
                "sty": "APP_F10_MAINFINADATA",
                "quoteColumns": "",
                "filter": f'(SECUCODE="{secucode(stock_code)}")(REPORT_TYPE="{report_type}")',
                "p": 1,
                "ps": 200,
                "sr": -1,
                "st": "REPORT_DATE",
                "source": "HSF10",
                "client": "PC",
                "v": str(int(time.time() * 1000)),
            },
            timeout=20.0,
            follow_redirects=True,
        )
        data = response.json()
    except Exception as exc:
        raise RuntimeError(f"获取股票财务数据失败: {exc}")

    rows = (data.get("result") or {}).get("data") or []
    if not rows:
        return None

    row = rows[0]
    date = normalize_quarter_date(row.get("REPORT_DATE"))
    if not date:
        return None

    return {
        "date": date,
        "roe": safe_float(row.get("ROEJQ")),
        "main_grow": safe_float(row.get("TOTALOPERATEREVETZ")),
        "net_rate": safe_float(row.get("XSJLL")),
        "gross_rate": safe_float(row.get("XSMLL")),
        "rev_grow": safe_float(row.get("TOTALOPERATEREVETZ")),
        "profit_grow": safe_float(row.get("KCFJCXSYJLRTZ")),
    }


def fetch_fund_kline(code: str, limit: int) -> List[Dict[str, Any]]:
    """抓取同花顺基金日 K 线数据，仅返回格式化 K 线列表。"""
    if limit <= 0:
        raise ValueError("limit 必须大于 0")

    normalized_code = str(code).zfill(6)
    request_body = {
        "code_list": [{"codes": [normalized_code], "market": ths_market(normalized_code)}],
        "trade_class": "intraday",
        "time_period": "day_1",
        "trade_date": -1,
        "begin_time": -limit,
        "end_time": 0,
        "adjust_type": "forward",
        "gpid": 1,
    }
    print(
        "[fetch_fund_kline] request params:",
        {
            "code": code,
            "limit": limit,
            "normalized_code": normalized_code,
            "market": ths_market(normalized_code),
            "body": request_body,
        },
    )
    try:
        response = httpx.post(
            "https://quota-h.10jqka.com.cn/fuyao/common_hq_aggr/quote/v1/single_kline",
            headers={
                "accept": "*/*",
                "content-type": "application/json",
                "origin": "https://stockpage.10jqka.com.cn",
                "platform": "hxkline",
                "referer": "https://stockpage.10jqka.com.cn/",
                "source-id": "hxkline-NEWS_appNewsFlowHome_Page",
                "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
                "x-auth-appname": "AINVEST",
                "x-auth-progid": "7047",
                "x-auth-type": "ths",
                "x-auth-version": "1.0",
                "x-fuyao-auth": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJhdXRob3JpemVyX25hbWVzcGFjZSI6ImNvbW1vbi1ocS1hZ2dyIiwibGljZW5zZWVfdHlwZSI6IkZST05UX0FQUCIsImxpY2Vuc2VlX25hbWVzcGFjZSI6Imh4a2xpbmUtTkVXU19hcHBOZXdzRmxvd0hvbWVfUGFnZSJ9.ldrvWTheNnGOa_rH_buA6OoUpLtW2bhcdr3fABrGHbk",
            },
            json=request_body,
            timeout=20.0,
            follow_redirects=True,
        )
        data = response.json()
    except Exception as exc:
        raise RuntimeError(f"获取基金K线失败: {exc}")

    if data.get("status_code") != 0:
        message = data.get("status_msg") or "未知错误"
        raise RuntimeError(f"获取基金K线失败: {message}")

    quote_data = ((data.get("data") or {}).get("quote_data") or [])
    if not quote_data:
        return []

    values = quote_data[0].get("value") or []

    records: List[Dict[str, Any]] = []
    previous_close: float | None = None
    for item in values:
        if not isinstance(item, list):
            continue
        record = parse_ths_fund_kline_value(item, previous_close)
        records.append(record)
        previous_close = record["close"]

    return records


def nullable_float(value: Any) -> float | None:
    """把行情快照字段转换成 float，空值保持 None。"""
    if value is None:
        return None
    if isinstance(value, str) and value.strip() in {"", "--", "nan", "None"}:
        return None
    return safe_float(value)


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
        "code_list": [{"codes": [normalized_code], "market": ths_market(normalized_code)}],
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

    quote_data = ((data.get("data") or {}).get("quote_data") or [])
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
        "previousClose": nullable_float(raw_fields.get("6")),
        "open": nullable_float(raw_fields.get("7")),
        "high": nullable_float(raw_fields.get("8")),
        "low": nullable_float(raw_fields.get("9")),
        "latest": nullable_float(raw_fields.get("10") if raw_fields.get("10") is not None else raw_fields.get("30")),
        "averagePrice": nullable_float(raw_fields.get("24")),
        "volume": nullable_float(raw_fields.get("13")),
        "amount": nullable_float(raw_fields.get("19")),
        "changeAmount": nullable_float(raw_fields.get("264648")),
        "changePercent": nullable_float(raw_fields.get("1771976")),
        "amplitude": nullable_float(raw_fields.get("1968584")),
        "turnoverRate": nullable_float(raw_fields.get("199112")),
        "totalMarketValue": nullable_float(raw_fields.get("3475914")),
        "circulatingMarketValue": nullable_float(raw_fields.get("3541450")),
    }
