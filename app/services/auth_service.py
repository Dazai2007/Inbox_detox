from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import User
from app.schemas.schemas import TokenData
import uuid
from app.core.jwt_blacklist import is_blacklisted

# Password hashing: prefer pbkdf2_sha256 (Py 3.13 friendly) but still accept bcrypt for legacy hashes
pwd_context = CryptContext(schemes=["pbkdf2_sha256", "bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        return pwd_context.hash(password)
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
        )
        to_encode.update({"exp": expire, "type": "access", "jti": str(uuid.uuid4())})
        return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)

    @staticmethod
    def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None):
        # Default 30 days for refresh
        to_encode = data.copy()
        expire = datetime.utcnow() + (
            expires_delta or timedelta(days=30)
        )
        to_encode.update({"exp": expire, "type": "refresh", "jti": str(uuid.uuid4())})
        return jwt.encode(to_encode, settings.secret_key, algorithm=settings.algorithm)
    
    @staticmethod
    def verify_token(token: str, expected_type: str = "access") -> Optional[TokenData]:
        try:
            payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
            email: str = payload.get("sub")
            ttype = payload.get("type")
            jti = payload.get("jti")
            if jti and is_blacklisted(jti):
                return None
            if email is None or (expected_type and ttype != expected_type):
                return None
            return TokenData(email=email, type=ttype, jti=jti)
        except JWTError:
            return None
    
    @staticmethod
    def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            return None
        # Try new field first, fallback to legacy
        stored_hash = user.password_hash or user.hashed_password
        if not stored_hash:
            return None
        if not AuthService.verify_password(password, stored_hash):
            return None
        return user
    
    @staticmethod
    def create_user(db: Session, email: str, password: str, full_name: str = None) -> User:
        hashed_password = AuthService.get_password_hash(password)
        user = User(
            email=email,
            password_hash=hashed_password,
            full_name=full_name
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()