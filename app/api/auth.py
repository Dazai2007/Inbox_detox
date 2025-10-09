from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, Cookie
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database.database import get_db
from app.services.auth_service import AuthService
from app.schemas.schemas import (
    UserCreate,
    UserResponse,
    Token,
    RefreshTokenRequest,
    LogoutRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
)
from app.core.config import settings
from app.core.jwt_blacklist import blacklist_jti, blacklist_jti_db
from jose import jwt, JWTError
from app.services.email_sender import send_email
from app.core.security import sanitize_text
from app.models.models import PasswordResetToken, User
from datetime import datetime, timedelta, timezone
import uuid
from app.core.cookies import set_refresh_cookie, clear_refresh_cookie

router = APIRouter(prefix="/api/auth", tags=["authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    if AuthService.get_user_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user
    user = AuthService.create_user(
        db=db,
        email=user_data.email,
        password=user_data.password,
        full_name=user_data.full_name
    )
    
    return user

@router.post("/login", response_model=Token)
async def login(response: Response, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Require verified email to login (prevents fake/spam accounts usage)
    if not user.is_verified:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Email not verified. Please verify your email.")
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = AuthService.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    refresh_token = AuthService.create_refresh_token(data={"sub": user.email})
    # Also set httpOnly cookie for refresh token for browser clients
    set_refresh_cookie(response, refresh_token, max_age_seconds=settings.refresh_token_expire_days * 24 * 3600)
    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = AuthService.verify_token(token, expected_type="access")
    if token_data is None:
        raise credentials_exception
    
    user = AuthService.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise credentials_exception
    
    return user

@router.get("/me", response_model=UserResponse)
async def read_users_me(current_user = Depends(get_current_user)):
    return current_user

@router.post("/logout")
async def logout(response: Response, body: LogoutRequest = None, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    # Blacklist current access token jti and optional refresh token jti
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        jti = payload.get("jti")
        if jti:
            blacklist_jti(jti)
            blacklist_jti_db(db, jti)
    except JWTError:
        pass
    if body and body.refresh_token:
        try:
            payload = jwt.decode(body.refresh_token, settings.secret_key, algorithms=[settings.algorithm])
            rjti = payload.get("jti")
            if rjti:
                blacklist_jti(rjti)
                blacklist_jti_db(db, rjti)
        except JWTError:
            pass
    clear_refresh_cookie(response)
    return {"message": "Logged out"}

@router.post("/refresh-token", response_model=Token)
async def refresh_token(body: RefreshTokenRequest | None = None, rt: str | None = Cookie(default=None, alias=settings.refresh_cookie_name)):
    raw_refresh = body.refresh_token if body else rt
    data = AuthService.verify_token(raw_refresh or "", expected_type="refresh")
    if not data or not data.email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    access_token = AuthService.create_access_token(data={"sub": data.email})
    # Optionally rotate refresh tokens here
    return {"access_token": access_token, "token_type": "bearer"}


# Password reset: request
@router.post("/forgot-password")
async def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    email = body.email
    user = AuthService.get_user_by_email(db, email=email)
    # Always return 200 to prevent user enumeration
    if not user:
        return {"message": "If an account exists, a reset email has been sent"}

    token = str(uuid.uuid4())
    expires_at = datetime.now(timezone.utc) + timedelta(hours=1)
    prt = PasswordResetToken(user_id=user.id, token=token, expires_at=expires_at)
    db.add(prt)
    db.commit()

    reset_url = f"{settings.app_base_url}/api/auth/reset-password?token={token}"
    subject = "Reset your Inbox Detox password"
    body_text = (
        f"Hi,\n\nYou requested to reset your password. Use the link below to set a new password:\n"
        f"{reset_url}\n\nThis link will expire in 1 hour. If you didn't request a reset, you can ignore this message."
    )
    send_email(user.email, subject, body_text)
    return {"message": "If an account exists, a reset email has been sent"}


# Password reset: confirm
@router.post("/reset-password")
async def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    token = body.token
    prt = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token,
        PasswordResetToken.used == False,
    ).first()  # noqa: E712
    if not prt or prt.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Invalid or expired token")
    user: User | None = db.query(User).filter(User.id == prt.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Reuse password hashing policy
    hashed = AuthService.get_password_hash(body.new_password)
    user.password_hash = hashed
    prt.used = True
    db.commit()
    return {"message": "Password has been reset"}