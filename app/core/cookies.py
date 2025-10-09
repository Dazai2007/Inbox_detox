from fastapi import Response
from app.core.config import settings


def _is_secure() -> bool:
    # Secure cookies in production
    return settings.environment.lower() == "production"


def set_refresh_cookie(response: Response, token: str, max_age_seconds: int | None = None) -> None:
    response.set_cookie(
        key=settings.refresh_cookie_name,
        value=token,
        httponly=True,
        secure=_is_secure(),
        samesite=settings.cookie_samesite,
        domain=settings.cookie_domain,
        max_age=max_age_seconds,
        path="/",
    )


def clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(
        key=settings.refresh_cookie_name,
        domain=settings.cookie_domain,
        path="/",
    )
