from fastapi import APIRouter, Depends, HTTPException, Request, Response
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from urllib.parse import urlencode
import google.oauth2.credentials as google_credentials
from google_auth_oauthlib.flow import Flow
import secrets

from app.core.config import settings
from app.database.database import get_db
from app.api.auth import get_current_user
from app.models.models import User
from jose import jwt

router = APIRouter(prefix="/api/gmail", tags=["gmail"])


def _build_client_config() -> dict:
    if not settings.google_client_id or not settings.google_client_secret or not settings.google_redirect_uri:
        raise HTTPException(status_code=500, detail="Google OAuth not configured")
    return {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uris": [settings.google_redirect_uri],
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }


@router.get("/connect")
def connect_gmail(request: Request, current_user: User = Depends(get_current_user)):
    # Initialize OAuth flow and redirect user to Google consent screen
    client_config = _build_client_config()
    flow = Flow.from_client_config(
        client_config=client_config,
        scopes=settings.google_scopes.split(),
        redirect_uri=settings.google_redirect_uri,
    )
    # Encode user id into state as a signed JWT so we can identify user in callback
    state_payload = {"uid": current_user.id, "nonce": secrets.token_urlsafe(8)}
    state = jwt.encode(state_payload, settings.secret_key, algorithm=settings.algorithm)
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    return RedirectResponse(authorization_url)


@router.get("/connect_url")
def connect_gmail_url(current_user: User = Depends(get_current_user)):
    client_config = _build_client_config()
    flow = Flow.from_client_config(
        client_config=client_config,
        scopes=settings.google_scopes.split(),
        redirect_uri=settings.google_redirect_uri,
    )
    state_payload = {"uid": current_user.id, "nonce": secrets.token_urlsafe(8)}
    state = jwt.encode(state_payload, settings.secret_key, algorithm=settings.algorithm)
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=state,
    )
    return {"url": authorization_url}


@router.get("/callback")
def gmail_callback(request: Request, db: Session = Depends(get_db)):
    # Validate and decode state
    state = request.query_params.get("state")
    code = request.query_params.get("code")
    if not state:
        raise HTTPException(status_code=400, detail="Missing state")
    if not code:
        raise HTTPException(status_code=400, detail="Missing code")
    try:
        decoded = jwt.decode(state, settings.secret_key, algorithms=[settings.algorithm])
        uid = decoded.get("uid")
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")
    if not uid:
        raise HTTPException(status_code=400, detail="Invalid OAuth state")

    # Exchange code for tokens
    client_config = _build_client_config()
    flow = Flow.from_client_config(
        client_config=client_config,
        scopes=settings.google_scopes.split(),
        redirect_uri=settings.google_redirect_uri,
        state=state,
    )
    flow.fetch_token(code=code)
    creds = flow.credentials

    # Persist tokens on the user record
    user = db.query(User).filter(User.id == uid).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.gmail_connected = True
    user.gmail_access_token = creds.token
    user.gmail_refresh_token = getattr(creds, "refresh_token", None)
    user.gmail_token_expiry = creds.expiry if creds.expiry else None
    db.add(user)
    db.commit()

    return RedirectResponse(url="/")


@router.get("/status")
def gmail_status(current_user: User = Depends(get_current_user)):
    return {
        "connected": bool(current_user.gmail_connected and current_user.gmail_refresh_token),
        "token_expires_at": current_user.gmail_token_expiry.isoformat() if current_user.gmail_token_expiry else None,
    }


@router.post("/disconnect")
def gmail_disconnect(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.gmail_connected = False
    current_user.gmail_access_token = None
    current_user.gmail_refresh_token = None
    current_user.gmail_token_expiry = None
    db.add(current_user)
    db.commit()
    return {"success": True}
