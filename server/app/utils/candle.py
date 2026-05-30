from __future__ import annotations

from app.core.logger import get_logger

def validate_candle_proportions(
    date: str | None,
    open: float,
    close: float,
    high: float,
    low: float,
    min_upper_shadow_ratio: float | None = None,
    max_upper_shadow_ratio: float | None = None,
    min_lower_shadow_ratio: float | None = None,
    max_lower_shadow_ratio: float | None = None,
    min_body_ratio: float | None = None,
    max_body_ratio: float | None = None,
) -> bool:
    """
    倒锤子线形态识别（长上影、极短下影、小实体）。

    参数:
    - date: 当前 K 线日期（字符串），用于日志标记
    - open: 开盘价
    - close: 收盘价
    - high: 最高价
    - low: 最低价
    - min_upper_shadow_ratio: 上影线占振幅最小比例（≥），可选
    - max_upper_shadow_ratio: 上影线占振幅最大比例（≤），可选
    - min_lower_shadow_ratio: 下影线占振幅最小比例（≥），可选
    - max_lower_shadow_ratio: 下影线占振幅最大比例（≤），可选
    - min_body_ratio: 实体占振幅最小比例（≥），可选
    - max_body_ratio: 实体占振幅最大比例（≤），可选

    说明：所有阈值参数默认 None；仅当传入具体数值时，才启用对应条件判断。
    """
    try:
        o = float(open)
        h = float(high)
        l = float(low)
        c = float(close)
    except Exception:
        return False

    rng = h - l
    if rng <= 0.0:
        return False

    # 实体长度（|收-开|）
    body = abs(c - o)
    # 上影线长度（高 - 实体上缘）
    upper = h - max(o, c)
    # 下影线长度（实体下缘 - 低）
    lower = min(o, c) - l

    # 上影线占振幅比例（保留三位小数）
    upper_ratio = round(upper / rng, 3)
    # 下影线占振幅比例（保留三位小数）
    lower_ratio = round(lower / rng, 3)
    # 实体占振幅比例（保留三位小数）
    body_ratio = round(body / rng, 3)

    # 当日振幅必须大于 0
    cond_range_pos = rng > 0.0
    # 上影线最小阈值（≥），未传则视为通过
    cond_upper_min = True if min_upper_shadow_ratio is None else upper_ratio >= float(min_upper_shadow_ratio)
    # 上影线最大阈值（≤），未传则视为通过
    cond_upper_max = True if max_upper_shadow_ratio is None else upper_ratio <= float(max_upper_shadow_ratio)
    # 下影线最小阈值（≥），未传则视为通过
    cond_lower_min = True if min_lower_shadow_ratio is None else lower_ratio >= float(min_lower_shadow_ratio)
    # 下影线最大阈值（≤），未传则视为通过
    cond_lower_max = True if max_lower_shadow_ratio is None else lower_ratio <= float(max_lower_shadow_ratio)
    # 实体最小阈值（≥），未传则视为通过
    cond_body_min = True if min_body_ratio is None else body_ratio >= float(min_body_ratio)
    # 实体最大阈值（≤），未传则视为通过
    cond_body_max = True if max_body_ratio is None else body_ratio <= float(max_body_ratio)

    logger = get_logger()
    logger.info(
        {
            "event": "candle.inverted_hammer.single_eval",
            "date": None if date is None else str(date),
            "open": o,
            "high": h,
            "low": l,
            "close": c,
            "rng": round(rng, 3),
            "upper_ratio": upper_ratio,
            "lower_ratio": lower_ratio,
            "body_ratio": body_ratio,
            "min_upper_shadow_ratio": min_upper_shadow_ratio,
            "max_upper_shadow_ratio": max_upper_shadow_ratio,
            "min_lower_shadow_ratio": min_lower_shadow_ratio,
            "max_lower_shadow_ratio": max_lower_shadow_ratio,
            "min_body_ratio": min_body_ratio,
            "max_body_ratio": max_body_ratio,
            "cond_range_pos": cond_range_pos,
            "cond_upper_min": cond_upper_min,
            "cond_upper_max": cond_upper_max,
            "cond_lower_min": cond_lower_min,
            "cond_lower_max": cond_lower_max,
            "cond_body_min": cond_body_min,
            "cond_body_max": cond_body_max,
        }
    )

    if not cond_range_pos:
        return False
    if not cond_upper_min:
        return False
    if not cond_upper_max:
        return False
    if not cond_lower_min:
        return False
    if not cond_lower_max:
        return False
    if not cond_body_min:
        return False
    if not cond_body_max:
        return False
    return True

def is_inverted_hammer(
    date: str | None,
    open: float,
    close: float,
    high: float,
    low: float,
) -> bool:
    """
    倒锤子线封装函数：仅接受 `date, open, close, high, low`。
    内部调用基础形态函数，所有阈值参数默认不启用（None）。
    """
    return validate_candle_proportions(
        date,
        open,
        close,
        high,
        low,
        max_upper_shadow_ratio=0.2,
        min_lower_shadow_ratio=0.7,
        min_body_ratio=0.1,
    )
