from __future__ import annotations

import logging
import random
import time
import warnings
from datetime import datetime
from pathlib import Path
from typing import Any

import pandas as pd

LOGGER = logging.getLogger(__name__)

CSV_COLUMNS = ["date", "sse_amount", "szse_amount", "total_amount", "unit", "source", "updated_at"]
CSV_DEFAULT_PATH = Path(__file__).resolve().parents[3] / "data" / "csv" / "market_turnover.csv"


def _empty_turnover_frame() -> pd.DataFrame:
    """返回符合缓存字段结构的空 DataFrame。"""
    return pd.DataFrame(columns=CSV_COLUMNS)


def _import_akshare() -> Any:
    """延迟导入 AKShare，避免服务启动阶段因依赖缺失直接失败。"""
    try:
        import akshare as ak  # type: ignore
    except Exception as exc:  # pragma: no cover - 仅用于运行时缺依赖的兜底
        raise RuntimeError("akshare 未安装，请先安装依赖后再调用成交额接口") from exc
    return ak


def _normalize_date(value: Any) -> str:
    """把任意日期值规范成 YYYYMMDD。"""
    if value is None:
        return ""
    text = str(value).strip()
    if not text:
        return ""
    parsed = pd.to_datetime(text, errors="coerce")
    if pd.isna(parsed):
        text = text.replace("-", "").replace("/", "")
        if len(text) == 8 and text.isdigit():
            return text
        return ""
    return parsed.strftime("%Y%m%d")


def _safe_float(value: Any) -> float | None:
    """把任意标量安全转成 float。"""
    if value is None:
        return None
    if isinstance(value, bool):
        return None
    if isinstance(value, (int, float)):
        if pd.isna(value):
            return None
        return float(value)
    text = str(value).strip().replace(",", "").replace("%", "")
    if not text or text in {"--", "None", "nan", "NaN"}:
        return None
    try:
        parsed = float(text)
    except ValueError:
        return None
    if pd.isna(parsed):
        return None
    return parsed


def _normalize_amount_to_yi_yuan(value: Any) -> float | None:
    """把 AKShare 返回的成交额统一成亿元。"""
    amount = _safe_float(value)
    if amount is None:
        return None
    if abs(amount) >= 100000000:
        amount = amount / 100000000
    return round(amount, 2)


def _find_column(frame: pd.DataFrame, candidates: list[str]) -> str | None:
    """在 DataFrame 中按候选名寻找列。"""
    normalized = {str(column).strip(): column for column in frame.columns}
    for candidate in candidates:
        if candidate in normalized:
            return normalized[candidate]
    return None


def _extract_amount(frame: pd.DataFrame, row_candidates: list[str], value_candidates: list[str]) -> float | None:
    """从 AKShare 表格中提取目标成交额。"""
    if frame.empty:
        return None
    row_column = _find_column(frame, ["单日情况", "证券类别", "项目名称", "item"])
    value_column = _find_column(frame, value_candidates)
    if row_column is None or value_column is None:
        return None

    rows = frame.copy()
    rows[row_column] = rows[row_column].astype(str).str.strip()
    target_row = None
    for candidate in row_candidates:
        matched = rows[rows[row_column] == candidate]
        if not matched.empty:
            target_row = matched.iloc[0]
            break
    if target_row is None:
        return None
    return _normalize_amount_to_yi_yuan(target_row.get(value_column))


def _sum_row_amount(frame: pd.DataFrame, row_candidates: list[str]) -> float | None:
    """把指定行的数值列求和后转成亿元。"""
    if frame.empty:
        return None
    row_column = _find_column(frame, ["单日情况", "证券类别", "项目名称", "item"])
    if row_column is None:
        return None

    rows = frame.copy()
    rows[row_column] = rows[row_column].astype(str).str.strip()
    target_row = None
    for candidate in row_candidates:
        matched = rows[rows[row_column] == candidate]
        if not matched.empty:
            target_row = matched.iloc[0]
            break
    if target_row is None:
        return None

    total = 0.0
    has_value = False
    for column in frame.columns:
        if column == row_column:
            continue
        value = _safe_float(target_row.get(column))
        if value is None:
            continue
        total += value
        has_value = True
    if not has_value:
        return None
    return _normalize_amount_to_yi_yuan(total)


def fetch_trade_dates(days: int = 90) -> list[str]:
    """获取最近 N 个 A 股交易日，返回 YYYYMMDD 格式日期列表。"""
    if days <= 0:
        raise ValueError("days 必须大于 0")

    ak = _import_akshare()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=pd.errors.SettingWithCopyWarning)
        calendar = ak.tool_trade_date_hist_sina()
    if not isinstance(calendar, pd.DataFrame) or calendar.empty:
        return []

    date_column = _find_column(calendar, ["trade_date", "date"])
    if date_column is None:
        date_column = str(calendar.columns[0])

    trade_dates = (
        pd.to_datetime(calendar[date_column].astype(str), errors="coerce")
        .dropna()
        .dt.strftime("%Y%m%d")
        .tolist()
    )
    today = datetime.now().strftime("%Y%m%d")
    recent_dates = [item for item in trade_dates if item <= today]
    return recent_dates[-days:]


def read_market_turnover_csv(csv_path: str) -> pd.DataFrame:
    """读取本地成交额缓存文件，不存在则返回空表。"""
    path = Path(csv_path)
    if not path.exists():
        return _empty_turnover_frame()

    try:
        frame = pd.read_csv(path, dtype=str)
    except Exception as exc:
        LOGGER.warning("读取成交额 CSV 失败: %s", exc)
        return _empty_turnover_frame()

    if frame.empty:
        return _empty_turnover_frame()

    for column in CSV_COLUMNS:
        if column not in frame.columns:
            frame[column] = None

    frame = frame[CSV_COLUMNS].copy()
    frame["date"] = frame["date"].map(_normalize_date)
    frame = frame[frame["date"] != ""]

    for column in ["sse_amount", "szse_amount", "total_amount"]:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")

    frame["unit"] = frame["unit"].fillna("亿元")
    frame["source"] = frame["source"].fillna("AKShare")
    frame["updated_at"] = frame["updated_at"].fillna("")
    frame = frame.dropna(subset=["sse_amount", "szse_amount", "total_amount"])
    frame = frame.drop_duplicates(subset=["date"], keep="last")
    frame = frame.sort_values("date", ascending=True).reset_index(drop=True)
    return frame


def write_market_turnover_csv(df: pd.DataFrame, csv_path: str) -> None:
    """写入成交额缓存文件，自动去重并按日期升序排序。"""
    path = Path(csv_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    if df.empty:
        _empty_turnover_frame().to_csv(path, index=False, encoding="utf-8-sig")
        return

    frame = df.copy()
    for column in CSV_COLUMNS:
        if column not in frame.columns:
            frame[column] = None

    frame = frame[CSV_COLUMNS].copy()
    frame["date"] = frame["date"].map(_normalize_date)
    frame = frame[frame["date"] != ""]
    for column in ["sse_amount", "szse_amount", "total_amount"]:
        frame[column] = pd.to_numeric(frame[column], errors="coerce")
    frame["unit"] = frame["unit"].fillna("亿元")
    frame["source"] = frame["source"].fillna("AKShare")
    frame["updated_at"] = frame["updated_at"].fillna("")
    frame = frame.dropna(subset=["sse_amount", "szse_amount", "total_amount"])
    frame = frame.drop_duplicates(subset=["date"], keep="last")
    frame = frame.sort_values("date", ascending=True).reset_index(drop=True)
    frame.to_csv(path, index=False, encoding="utf-8-sig")


def fetch_sse_turnover(date: str) -> float:
    """获取指定日期上交所股票成交额，单位为亿元。"""
    ak = _import_akshare()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=pd.errors.SettingWithCopyWarning)
        frame = ak.stock_sse_deal_daily(date=date)
    amount = _extract_amount(frame, ["成交金额"], ["股票"])
    if amount is None:
        raise RuntimeError(f"上交所成交额缺失，日期: {date}")
    return amount


def fetch_szse_turnover(date: str) -> float:
    """获取指定日期深交所股票成交额，单位为亿元。"""
    ak = _import_akshare()
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", category=pd.errors.SettingWithCopyWarning)
        frame = ak.stock_szse_summary(date=date)
    amount = _extract_amount(frame, ["股票"], ["成交金额"])
    if amount is None:
        raise RuntimeError(f"深交所成交额缺失，日期: {date}")
    return amount


def fetch_market_turnover_by_date(date: str) -> dict[str, Any] | None:
    """获取指定交易日沪深两市成交额，任何一侧缺失则返回 None。"""
    normalized_date = _normalize_date(date)
    if normalized_date == "":
        return None

    try:
        sse_amount = fetch_sse_turnover(date=normalized_date)
        time.sleep(random.uniform(0.5, 1.5))
        szse_amount = fetch_szse_turnover(date=normalized_date)
    except Exception as exc:
        LOGGER.warning("获取成交额失败，日期=%s，原因=%s", normalized_date, exc)
        return None

    total_amount = round(sse_amount + szse_amount, 2)
    return {
        "date": normalized_date,
        "sse_amount": round(sse_amount, 2),
        "szse_amount": round(szse_amount, 2),
        "total_amount": total_amount,
        "unit": "亿元",
        "source": "AKShare",
        "updated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
    }


def sync_market_turnover_csv(days: int = 90, csv_path: str = str(CSV_DEFAULT_PATH)) -> list[dict[str, Any]]:
    """同步最近 N 个交易日成交额缓存，仅补齐 CSV 中缺失的日期。"""
    trade_dates = fetch_trade_dates(days=days)
    if not trade_dates:
        return []

    cached = read_market_turnover_csv(csv_path)
    cached = cached[cached["date"].isin(trade_dates)].copy()
    existing_dates = set(cached["date"].tolist())
    missing_dates = [trade_date for trade_date in trade_dates if trade_date not in existing_dates]

    if missing_dates:
        new_records: list[dict[str, Any]] = []
        for trade_date in missing_dates:
            record = fetch_market_turnover_by_date(trade_date)
            if record is not None:
                new_records.append(record)

        if new_records:
            combined = pd.concat([cached, pd.DataFrame(new_records)], ignore_index=True)
            write_market_turnover_csv(combined, csv_path)
            cached = read_market_turnover_csv(csv_path)
            cached = cached[cached["date"].isin(trade_dates)].copy()

    cached = cached.sort_values("date", ascending=True).reset_index(drop=True)
    if cached.empty:
        return []

    result = cached[["date", "sse_amount", "szse_amount", "total_amount", "unit", "source"]].copy()
    result["sse_amount"] = result["sse_amount"].round(2)
    result["szse_amount"] = result["szse_amount"].round(2)
    result["total_amount"] = result["total_amount"].round(2)
    return result.to_dict(orient="records")


if __name__ == "__main__":
    sample = sync_market_turnover_csv()
    print(sample[:3])
