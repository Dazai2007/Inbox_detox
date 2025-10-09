from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from app.database.database import get_db
from app.services.auth_service import AuthService
from app.schemas.schemas import UserCreate, UserResponse, Token, RefreshTokenRequest, LogoutRequest
from app.core.config import settings
from app.core.jwt_blacklist import blacklist_jti, blacklist_jti_db
from jose import jwt, JWTError

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
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = AuthService.create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    
    refresh_token = AuthService.create_refresh_token(data={"sub": user.email})
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
async def logout(body: LogoutRequest = None, token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
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
    return {"message": "Logged out"}

@router.post("/refresh-token", response_model=Token)
async def refresh_token(body: RefreshTokenRequest):
    data = AuthService.verify_token(body.refresh_token, expected_type="refresh")
    if not data or not data.email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    access_token = AuthService.create_access_token(data={"sub": data.email})
    # Optionally rotate refresh tokens here
    return {"access_token": access_token, "token_type": "bearer"}