from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from app.models.models import EmailCategory  # Sadece EmailCategory kalsın

class ForgotPasswordRequest(BaseModel):
    email: EmailStr
from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
from app.models.models import EmailCategory  # Sadece EmailCategory kalsın
from pydantic import BaseModel

class LogoutRequest(BaseModel):
    refresh_token: str
# class SubscriptionTier(str, Enum):
#     FREE = "free"
#     BASIC = "basic" 
#     PREMIUM = "premium"
#
# class SubscriptionStatus(str, Enum):
#     FREE = "free"
#     PRO = "pro"
#     BUSINESS = "business"

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False
    is_verified: Optional[bool] = False

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    timezone: Optional[str] = "UTC"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    is_verified: bool
    timezone: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenData(BaseModel):
    email: str
    type: str
    jti: Optional[str] = None

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class EmailBase(BaseModel):
    subject: Optional[str] = None
    content: str
    category: Optional[EmailCategory] = None

class EmailCreate(EmailBase):
    pass

class EmailResponse(EmailBase):
    id: int
    user_id: int
    summary: Optional[str] = None
    confidence_score: Optional[int] = None
    processing_time_ms: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

class EmailAnalyticsBase(BaseModel):
    sender: Optional[str] = None
    subject: Optional[str] = None
    email_content: Optional[str] = None
    received_date: Optional[datetime] = None
    priority: Optional[str] = None
    category: Optional[str] = None
    summary: Optional[str] = None

class EmailAnalyticsResponse(EmailAnalyticsBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    token: str
    new_password: str

class RefreshTokenRequest(BaseModel):
    refresh_token: str