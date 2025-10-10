from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request
from jose import jwt, JWTError
from app.core.config import settings


def user_rate_limit_key(request: Request) -> str:
    """Key function for rate limiting based on authenticated user (email in JWT).
    Falls back to client IP if no/invalid token.
    """
    auth = request.headers.get("authorization") or request.headers.get("Authorization")
    if auth and auth.lower().startswith("bearer "):
        try:
            token = auth.split(" ", 1)[1].strip()
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            sub = payload.get("sub")
            if sub:
                return f"user:{sub.lower()}"
        except JWTError:
            pass
    return get_remote_address(request)


# Global limiter with default IP-based limits; endpoints can override key_func
# Enable headers so clients receive X-RateLimit-* and Retry-After
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{settings.rate_limit_per_minute}/minute"],
    headers_enabled=True,
)
