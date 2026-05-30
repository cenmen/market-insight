from __future__ import annotations

import sys
from pathlib import Path
from typing import Any

from loguru import logger as _logger
from app.config.settings import settings


def get_logger() -> Any:
    _logger.remove()
    env = settings.env.lower()
    _logger.add(sys.stdout, level="DEBUG" if settings.is_dev else "INFO", colorize=settings.is_dev)
    if settings.is_prod or env == "staging":
        log_dir = Path(settings.log_dir)
        log_dir.mkdir(parents=True, exist_ok=True)
        _logger.add(
            log_dir.joinpath("app.log").as_posix(),
            rotation="20 MB",
            retention="30 days",
            compression="zip",
            encoding="utf-8",
            level="INFO",
        )
    return _logger
