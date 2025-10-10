from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta, timezone

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.models import User, VerificationToken
from app.core.config import settings
from app.services.email_sender import send_email
from app.schemas.api_responses import ApiMessage

router = APIRouter(prefix="/api/auth", tags=["authentication"])
_ttl_seconds = 60 * 60 * 24  # 24h

@router.post("/send-verification", summary="Send verification email", description="Generate a verification token and send a verification email to the current user.", response_model=ApiMessage)
async def send_verification(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=_ttl_seconds)
    vt = VerificationToken(user_id=current_user.id, token=token, expires_at=expires_at)
    db.add(vt)
    db.commit()
    # Build verification URL
    verify_url = f"{settings.app_base_url}/api/auth/verify-email?token={token}"
    subject = "Verify your Inbox Detox email"
    body = (
        f"Hi,\n\nPlease verify your email by clicking the link below:\n{verify_url}\n\n"
        f"This link will expire in 24 hours.\n\nIf you didn't create an account, you can ignore this message."
    )
    sent = send_email(current_user.email, subject, body)
    if sent:
        # In dev without SMTP configured, also return token to ease testing
        if not settings.smtp_host or not settings.smtp_from:
            return ApiMessage(message="Verification email sent (dev)")
        return ApiMessage(message="Verification email sent")
    else:
        # If email fails, keep token in DB but report failure
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to send verification email")

@router.get("/verify-email", summary="Verify email", description="Verify the user's email address using a token.", response_model=ApiMessage)
async def verify_email(token: str, db: Session = Depends(get_db)):
    vt = db.query(VerificationToken).filter(VerificationToken.token == token, VerificationToken.used == False).first()  # noqa: E712
    if not vt:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    if vt.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")
    user: User | None = db.query(User).filter(User.id == vt.user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_verified = True
    vt.used = True
    db.commit()
    return ApiMessage(message="Email verified")
