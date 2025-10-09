from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
import time

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.models import User

router = APIRouter(prefix="/api/auth", tags=["authentication"])

_verification_tokens = {}
_ttl_seconds = 60 * 60 * 24  # 24h

@router.post("/send-verification")
async def send_verification(current_user = Depends(get_current_user)):
    token = str(uuid.uuid4())
    _verification_tokens[token] = {"email": current_user.email, "exp": time.time() + _ttl_seconds}
    # TODO: integrate with email provider to send link containing token
    return {"message": "Verification email sent", "dev_token": token}

@router.get("/verify-email")
async def verify_email(token: str, db: Session = Depends(get_db)):
    item = _verification_tokens.pop(token, None)
    if not item:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid token")
    if item["exp"] < time.time():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token expired")
    email = item["email"]
    user: User | None = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": "Email verified"}
