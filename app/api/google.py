from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from urllib.parse import urlencode
import secrets
import time
import httpx

from app.core.config import settings
from app.database.database import get_db
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/google", tags=["google"])

OAUTH_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
OAUTH_TOKEN_URL = "https://oauth2.googleapis.com/token"
GMAIL_PROFILE_URL = "https://www.googleapis.com/gmail/v1/users/me/profile"
GMAIL_THREADS_URL = "https://www.googleapis.com/gmail/v1/users/me/threads"

def _oauth_state() -> str:
    return secrets.token_urlsafe(16)

@router.get("/oauth2/start")
def google_oauth_start(request: Request):
    if not settings.google_client_id or not settings.google_redirect_uri:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    state = _oauth_state()
    # Store state in server-side cookie to validate on callback (simple dev-safe approach)
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": settings.google_scopes,
        "access_type": "offline",
        "include_granted_scopes": "true",
        "prompt": "consent",
        "state": state,
    }
    url = f"{OAUTH_AUTH_URL}?{urlencode(params)}"
    response = RedirectResponse(url)
    response.set_cookie(key="google_oauth_state", value=state, httponly=True, max_age=600)
    return response

@router.get("/oauth2/callback")
async def google_oauth_callback(request: Request, code: str | None = None, state: str | None = None):
    saved_state = request.cookies.get("google_oauth_state")
    if not state or not saved_state or state != saved_state:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")

    data = {
        "code": code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": settings.google_redirect_uri,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient(timeout=20) as client:
        token_res = await client.post(OAUTH_TOKEN_URL, data=data)
        if token_res.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Token exchange failed: {token_res.text}")
        tokens = token_res.json()

    # In a full impl, persist tokens per user; for now, set cookies for demo/dashboard fetch
    resp = RedirectResponse(url="/")
    resp.delete_cookie("google_oauth_state")
    resp.set_cookie("google_access_token", tokens.get("access_token"), httponly=True, max_age=3600)
    if refresh := tokens.get("refresh_token"):
        resp.set_cookie("google_refresh_token", refresh, httponly=True, max_age=60*60*24*30)
    return resp

async def _bearer(request: Request) -> str:
    token = request.cookies.get("google_access_token")
    if not token:
        raise HTTPException(status_code=401, detail="Google not connected")
    return token

@router.get("/gmail/summary")
async def gmail_summary(access_token: str = Depends(_bearer)):
    async with httpx.AsyncClient(timeout=20, headers={"Authorization": f"Bearer {access_token}"}) as client:
        prof = await client.get(GMAIL_PROFILE_URL)
        if prof.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Gmail profile failed: {prof.text}")
        # Fetch last N threads for quick daily stats
        threads_res = await client.get(GMAIL_THREADS_URL, params={"maxResults": 50})
        if threads_res.status_code != 200:
            raise HTTPException(status_code=400, detail=f"Gmail threads failed: {threads_res.text}")
        threads = threads_res.json().get("threads", [])

    return {
        "profile": prof.json(),
        "counts": {
            "recent_threads": len(threads),
        },
    }
