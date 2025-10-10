from __future__ import annotations

from datetime import datetime, timezone


def utcnow() -> datetime:
    """Return a timezone-aware UTC datetime.

    Prefer this over datetime.utcnow() to avoid naive datetimes.
    """
    return datetime.now(timezone.utc)


def isoformat_z(dt: datetime | None = None) -> str:
    """Return ISO-8601 string with trailing 'Z' for UTC.

    If dt is None, use current UTC time. If dt is naive, assume UTC.
    """
    if dt is None:
        dt = utcnow()
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc).isoformat().replace('+00:00', 'Z')
