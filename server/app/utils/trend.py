from __future__ import annotations

import math
import polars as pl


def calc_trend(
    df: pl.DataFrame,
    ema_short: int = 20,
    ema_long: int = 60,
    slope_norm_scale: float = 100.0,
    score_smooth_span: int = 5,
    breakout_window: int = 40,
    score_up_thresh: float = 10.0,
    score_down_thresh: float = -10.0,
) -> pl.DataFrame:
    """
    计算 K 线趋势分类与强度（基于均线斜率 + 区间突破）。

    参数:
    - df: 包含 `close` 列的 `DataFrame`，建议也包含 `date` 便于调试与展示
    - ema_short: 短期 EMA 周期，默认 20
    - ema_long: 长期 EMA 周期，默认 60
    - slope_norm_scale: 斜率归一化缩放系数（百分化），默认 100.0
    - score_smooth_span: 趋势分数的 EMA 平滑窗口，默认 5
    - breakout_window: 区间突破的滚动窗口（高低点），默认 40
    - score_up_thresh: 判定上升趋势的分数阈值（平滑后），默认 10.0
    - score_down_thresh: 判定下降趋势的分数阈值（平滑后），默认 -10.0

    返回:
    - 与输入 `df.index` 对齐的 `DataFrame`，包含：
      - trend_state: `Up` | `Down` | `Sideways`
      - trend_score: 流水分数（未平滑）
      - trend_score_smooth: 平滑后的分数
      - turning_point: 是否拐点（趋势状态发生变化）
      - reason: 简要说明（斜率/突破）
    """
    # 校验输入列
    if "close" not in df.columns:
        n = df.height
        return pl.DataFrame(
            {
                "trend_state": ["Sideways"] * n,
                "trend_score": [0.0] * n,
                "trend_score_smooth": [0.0] * n,
                "turning_point": [False] * n,
                "reason": ["missing close"] * n,
            }
        )

    # 提取并转为浮点
    close_vals = []
    for v in df.get_column("close").to_list():
        try:
            close_vals.append(float(v))
        except Exception:
            close_vals.append(float("nan"))

    # 计算短长 EMA
    def _ema(values: list[float], span: int) -> list[float]:
        alpha = 2.0 / (span + 1.0)
        out: list[float | None] = []
        prev: float | None = None
        for x in values:
            if x is None or not math.isfinite(x):
                out.append(prev)
                continue
            prev = x if prev is None else (alpha * x + (1.0 - alpha) * prev)
            out.append(prev)
        return [float("nan") if v is None else float(v) for v in out]

    ema_s = _ema(close_vals, ema_short)
    ema_l = _ema(close_vals, ema_long)

    # 计算短期 EMA 的斜率并归一化为百分（相对价格水平）
    slope: list[float] = []
    for i in range(len(ema_s)):
        prev = ema_s[i - 1] if i > 0 else float("nan")
        val = ema_s[i] - prev if (math.isfinite(ema_s[i]) and math.isfinite(prev)) else float("nan")
        slope.append(val)
    denom: list[float | None] = [None if (not math.isfinite(v) or v == 0.0) else v for v in ema_l]
    slope_norm: list[float] = []
    for i in range(len(slope)):
        d = denom[i]
        if d is None:
            slope_norm.append(float("nan"))
        else:
            slope_norm.append((slope[i] / d) * float(slope_norm_scale))

    # 计算区间突破分数（近期最高/最低）
    roll_max: list[float] = []
    roll_min: list[float] = []
    win = int(breakout_window)
    for i in range(len(close_vals)):
        start = 0 if i + 1 - win < 0 else i + 1 - win
        window_vals = [v for v in close_vals[start : i + 1] if math.isfinite(v)]
        if window_vals:
            roll_max.append(max(window_vals))
            roll_min.append(min(window_vals))
        else:
            roll_max.append(float("nan"))
            roll_min.append(float("nan"))
    breakout_up = [math.isfinite(close_vals[i]) and math.isfinite(roll_max[i]) and close_vals[i] >= roll_max[i] for i in range(len(close_vals))]
    breakout_down = [math.isfinite(close_vals[i]) and math.isfinite(roll_min[i]) and close_vals[i] <= roll_min[i] for i in range(len(close_vals))]
    score_breakout: list[float] = []
    for i in range(len(close_vals)):
        if breakout_up[i]:
            score_breakout.append(10.0)
        elif breakout_down[i]:
            score_breakout.append(-10.0)
        else:
            score_breakout.append(0.0)

    # 组合分数：斜率为主体，突破为加成
    trend_score: list[float] = []
    for i in range(len(slope_norm)):
        base = 0.0 if not math.isfinite(slope_norm[i]) else slope_norm[i]
        trend_score.append(base * 0.8 + score_breakout[i] * 0.2)

    # 平滑分数，以减少抖动
    trend_score_smooth = _ema(trend_score, score_smooth_span)

    # 分类阈值
    state: list[str] = []
    up_t = float(score_up_thresh)
    down_t = float(score_down_thresh)
    for v in trend_score_smooth:
        if math.isfinite(v) and v >= up_t:
            state.append("Up")
        elif math.isfinite(v) and v <= down_t:
            state.append("Down")
        else:
            state.append("Sideways")

    # 拐点识别：趋势状态发生变化
    turning_point: list[bool] = []
    for i in range(len(state)):
        if i == 0:
            turning_point.append(False)
        else:
            turning_point.append(state[i] != state[i - 1])

    # 说明：简化为斜率与突破要素
    reason: list[str] = []
    for i in range(len(close_vals)):
        s = slope_norm[i]
        b = score_breakout[i]
        s_str = "nan" if not math.isfinite(s) else f"{round(s, 2)}"
        b_str = f"{round(b, 1)}"
        reason.append(f"slope={s_str}, breakout={b_str}")

    # 汇总输出
    return pl.DataFrame(
        {
            "trend_state": state,
            "trend_score": [round(v, 4) if math.isfinite(v) else 0.0 for v in trend_score],
            "trend_score_smooth": [round(v, 4) if math.isfinite(v) else 0.0 for v in trend_score_smooth],
            "turning_point": turning_point,
            "reason": reason,
        }
    )
