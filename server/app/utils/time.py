from __future__ import annotations

from datetime import datetime
from typing import Optional

import pendulum

from app.config.settings import settings


def format_dt(dt: Optional[str | datetime], fmt: str = "YYYY-MM-DD HH:mm:ss") -> Optional[str]:
    if dt is None:
        return None
    tz = settings.timezone
    if isinstance(dt, datetime):
        p = pendulum.instance(dt)
        p = p.in_timezone(tz)
        return p.format(fmt)
    try:
        p = pendulum.parse(dt).in_timezone(tz)
        return p.format(fmt)
    except Exception:
        return None
