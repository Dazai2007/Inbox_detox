from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Annotated
from pydantic.types import StringConstraints
from typing import Optional
from datetime import datetime
from app.models.models import EmailCategory, SubscriptionTier, SubscriptionStatus

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None
    timezone: Optional[str] = "UTC"

class UserCreate(UserBase):
    # Enforce strong password via validator (lookaheads unsupported by pydantic-core regex)
    password: Annotated[
        str,
        StringConstraints(
            min_length=8,
            max_length=128,
        ),
    ] = Field(
        ...,
        description="8-128 chars, include upper, lower, digit, and special",
    )

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        has_lower = any(c.islower() for c in v)
        has_upper = any(c.isupper() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(not c.isalnum() for c in v)
        if not (has_lower and has_upper and has_digit and has_special):
            raise ValueError("Password must include upper, lower, digit, and special character")
        return v

class UserResponse(UserBase):
    id: int
    is_active: bool
    subscription_tier: SubscriptionTier
    is_verified: bool
    # Expose only for admin views; normal user endpoints can filter
    is_admin: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Email Schemas
class EmailBase(BaseModel):
    subject: Optional[Annotated[str, StringConstraints(max_length=500)]] = None
    content: Annotated[str, StringConstraints(min_length=1)]

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

# Password reset schemas
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: Annotated[
        str,
        StringConstraints(
            min_length=8,
            max_length=128,
        ),
    ] = Field(..., description="8-128 chars, include upper, lower, digit, and special")

    @field_validator("new_password")
    @classmethod
    def new_password_strength(cls, v: str) -> str:
        has_lower = any(c.islower() for c in v)
        has_upper = any(c.isupper() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(not c.isalnum() for c in v)
        if not (has_lower and has_upper and has_digit and has_special):
            raise ValueError("Password must include upper, lower, digit, and special character")
        return v

# Subscription Schemas
class SubscriptionResponse(BaseModel):
    id: int
    tier: SubscriptionTier
    status: str
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Admin Schemas
class AdminUpdateUser(BaseModel):
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    is_admin: Optional[bool] = None
    subscription_tier: Optional[SubscriptionTier] = None
    subscription_status: Optional[SubscriptionStatus] = None
    timezone: Optional[str] = None

class AdminSetSubscription(BaseModel):
    plan_type: Optional[str] = None
    status: Optional[str] = None
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None