from __future__ import annotations

import re
from typing import Any, Dict
import time

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


def _secucode(stock_code: str) -> str:
    """把股票代码转换成东方财富财务接口需要的证券格式。"""
    code = str(stock_code).zfill(6)
    market = "SH" if code.startswith(("5", "6", "9")) else "SZ"
    return f"{code}.{market}"


def _normalize_quarter_date(value: Any) -> str | None:
    """把报告期统一成 YYYY-MM-DD。"""
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


def fetch_stock_main_finance(stock_code: str, report_type: str) -> Dict[str, Any] | None:
    """抓取单只持仓股票的目标报告期核心财务指标。"""
    try:
        response = httpx.get(
            "https://datacenter.eastmoney.com/securities/api/data/get",
            params={
                "type": "RPT_F10_FINANCE_MAINFINADATA",
                "sty": "APP_F10_MAINFINADATA",
                "quoteColumns": "",
                "filter": f'(SECUCODE="{_secucode(stock_code)}")(REPORT_TYPE="{report_type}")',
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
    date = _normalize_quarter_date(row.get("REPORT_DATE"))
    if not date:
        return None

    return {
        "date": date,
        "roe": _safe_float(row.get("ROEJQ")),
        "main_grow": _safe_float(row.get("TOTALOPERATEREVETZ")),
        "net_rate": _safe_float(row.get("XSJLL")),
        "gross_rate": _safe_float(row.get("XSMLL")),
        "rev_grow": _safe_float(row.get("TOTALOPERATEREVETZ")),
        "profit_grow": _safe_float(row.get("KCFJCXSYJLRTZ")),
    }
