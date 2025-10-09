from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from app.models.models import EmailCategory, SubscriptionTier

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    is_active: bool
    subscription_tier: SubscriptionTier
    created_at: datetime
    
    class Config:
        from_attributes = True

# Email Schemas
class EmailBase(BaseModel):
    subject: Optional[str] = None
    content: str

class EmailCreate(EmailBase):
    pass

class EmailResponse(EmailBase):
    id: int
    summary: Optional[str] = None
    category: Optional[EmailCategory] = None
    confidence_score: Optional[int] = None
    processing_time_ms: Optional[int] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

class EmailAnalysis(BaseModel):
    summary: str
    category: EmailCategory
    confidence_score: int

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None

class TokenData(BaseModel):
    email: Optional[str] = None
    type: Optional[str] = None
    jti: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = None

# Subscription Schemas
class SubscriptionResponse(BaseModel):
    id: int
    tier: SubscriptionTier
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    
    class Config:
        from_attributes = True