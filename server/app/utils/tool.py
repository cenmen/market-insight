from __future__ import annotations

import re
from typing import Dict


def get_stock_info_by_code(code: str) -> Dict[str, bool | str]:
    """
    根据股票代码判断所属市场并返回信息对象。

    参数:
    - code: 纯数字或带前缀的股票代码（如 "600000", "sh600519", "sh688001"）。

    返回:
    - dict: {
        "is_sh": 是否上证,
        "is_sz": 是否深证,
        "code": 规范化后的 6 位数字代码
      }
    """

    normalized = re.sub(r"\D", "", code or "")
    if len(normalized) >= 6:
        normalized = normalized[:6]

    prefix3 = normalized[:3]

    is_shangzheng = (
        prefix3 in {"600", "601", "603", "605"} or normalized.startswith("688")
    )
    is_shenzhen = (
        prefix3 in {"000", "001", "002", "003", "200", "300", "301"}
    )

    return {
        "is_sh": is_shangzheng,
        "is_sz": is_shenzhen,
        "code": normalized,
    }