from __future__ import annotations

from dataclasses import dataclass
import logging
from typing import Any, Optional

from fastapi import Request


@dataclass
class Context:
    logger: logging.Logger
    current_user: Optional[str]
    db: Optional[Any]
    request_id: Optional[str]


def build_context(request: Request) -> Context:
    logger = logging.getLogger("app")
    user = request.headers.get("X-User-Id")
    rid = getattr(getattr(request, "state", None), "request_id", None)
    return Context(logger=logger, current_user=user, db=None, request_id=rid)
