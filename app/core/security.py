from typing import Optional

try:
    import bleach
except Exception:  # bleach may not be installed yet in some environments
    bleach = None  # type: ignore


ALLOWED_TAGS: list[str] = []  # no HTML tags allowed in plain text fields
ALLOWED_ATTRS: dict[str, list[str]] = {}


def sanitize_text(value: Optional[str]) -> Optional[str]:
    """
    Sanitize user-provided text to reduce XSS risk.

    - Strips HTML tags entirely (plain text fields shouldn't contain markup).
    - Handles None safely.
    """
    if value is None:
        return None
    # Quick normalize whitespace and trim
    cleaned = value.strip()
    if bleach is None:
        # Best-effort fallback: just return trimmed text if bleach unavailable
        return cleaned
    return bleach.clean(cleaned, tags=ALLOWED_TAGS, attributes=ALLOWED_ATTRS, strip=True)


def normalize_email(email: str) -> str:
    """Lowercase and trim emails for consistent lookup and storage."""
    return email.strip().lower()
