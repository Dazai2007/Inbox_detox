from __future__ import annotations

import httpx
from typing import Optional
from app.core.config import settings

TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify"

async def verify_turnstile_token(token: str, remoteip: Optional[str] = None) -> bool:
    """Verify a Cloudflare Turnstile token.

    Returns True if valid, False otherwise. If TURNSTILE secret is not configured,
    this will return False (treat as invalid) when captcha flags are enabled.
    """
    secret = settings.turnstile_secret_key
    if not secret:
        return False
    data = {"secret": secret, "response": token}
    if remoteip:
        data["remoteip"] = remoteip
    timeout = httpx.Timeout(5.0, connect=5.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        try:
            resp = await client.post(TURNSTILE_VERIFY_URL, data=data)
            resp.raise_for_status()
            payload = resp.json()
            return bool(payload.get("success"))
        except Exception:
            return False
