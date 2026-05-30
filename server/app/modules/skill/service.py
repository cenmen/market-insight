from __future__ import annotations

from datetime import datetime
from typing import Any, Dict

from app.modules.basic.service import fetch_fund_kline, fetch_fund_top_holdings, fetch_stock_main_finance


def target_quarter_end(today: datetime) -> str:
    """根据当前日期推导目标季度末日期（YYYY-MM-DD）。"""
    year = today.year
    month = today.month
    day = today.day
    if month < 6 or (month == 6 and day < 30):
        return f"{year}-03-31"
    if month < 9 or (month == 9 and day < 30):
        return f"{year}-06-30"
    if month < 12 or (month == 12 and day < 31):
        return f"{year}-09-30"
    return f"{year}-12-31"


def report_type(quarter_end: str) -> str:
    """把季度末日期映射为东方财富财务报告类型。"""
    return {
        "03-31": "一季报",
        "06-30": "中报",
        "09-30": "三季报",
        "12-31": "年报",
    }.get(quarter_end[5:], "一季报")


def fetch_etf_base_data(code: str, kline_limit: int = 60) -> Dict[str, Any]:
    """一次性抓取 skill 所需 ETF 基础数据（K线、持仓、持仓股核心财务）。"""
    quarter_end = target_quarter_end(datetime.now())
    current_report_type = report_type(quarter_end)
    holdings, position_report = fetch_fund_top_holdings(code)
    k_line_data = fetch_fund_kline(code, kline_limit)

    for holding in holdings:
        try:
            quarter_data = fetch_stock_main_finance(holding["stock_code"], current_report_type)
        except Exception:
            continue
        if quarter_data and quarter_data["date"] == quarter_end:
            holding["quarter_data"] = [quarter_data]

    return {
        "code": code,
        "source": "eastmoney",
        "fetched_at": datetime.now().isoformat(timespec="seconds"),
        "target_quarter_end": quarter_end,
        "report_type": current_report_type,
        "position_report": position_report,
        "kLineData": k_line_data,
        "holdings": holdings,
    }
