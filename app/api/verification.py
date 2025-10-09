from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
from datetime import datetime, timedelta, timezone

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.models import User, VerificationToken

router = APIRouter(prefix="/api/auth", tags=["authentication"])
_ttl_seconds = 60 * 60 * 24  # 24h

@router.post("/send-verification")
async def send_verification(current_user = Depends(get_current_user), db: Session = Depends(get_db)):
    token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=_ttl_seconds)
    vt = VerificationToken(user_id=current_user.id, token=token, expires_at=expires_at)
    db.add(vt)
    db.commit()
    # TODO: send email with link /api/auth/verify-email?token=<token>
    return {"message": "Verification email sent", "dev_token": token}

@router.get("/verify-email")
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
    return {"message": "Email verified"}
