from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.database import Base
import enum

class SubscriptionTier(str, enum.Enum):
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"

class SubscriptionStatus(str, enum.Enum):
    FREE = "free"
    PRO = "pro"
    BUSINESS = "business"

class EmailCategory(str, enum.Enum):
    IMPORTANT = "important"
    INVOICE = "invoice"
    MEETING = "meeting"
    SPAM = "spam"
    NEWSLETTER = "newsletter"
    SOCIAL = "social"
    PROMOTION = "promotion"
    OTHER = "other"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    # New canonical field matching requested schema
    password_hash = Column(String(255), nullable=True)
    # Legacy field kept for backward compatibility (to be migrated/removed later)
    hashed_password = Column(String(255), nullable=True)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    subscription_tier = Column(Enum(SubscriptionTier), default=SubscriptionTier.FREE)
    # Requested schema fields
    subscription_status = Column(Enum(SubscriptionStatus), default=SubscriptionStatus.FREE, nullable=False)
    gmail_connected = Column(Boolean, default=False, nullable=False)
    gmail_refresh_token = Column(String(1024), nullable=True)
    stripe_customer_id = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    emails = relationship("Email", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")

class Email(Base):
    __tablename__ = "emails"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(500), nullable=True)
    content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    category = Column(Enum(EmailCategory), nullable=True)
    confidence_score = Column(Integer, nullable=True)  # 0-100
    processing_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="emails")

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    # Requested schema fields
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_subscription_id = Column(String(255), nullable=True)
    plan_type = Column(String(50), nullable=True)  # e.g., free/pro/business
    status = Column(String(50), nullable=False)  # active, cancelled, etc.
    current_period_start = Column(DateTime(timezone=True), nullable=True)
    current_period_end = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="subscriptions")


class EmailAnalytics(Base):
    __tablename__ = "email_analytics"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    sender = Column(String(255), nullable=True)
    subject = Column(String(500), nullable=True)
    received_date = Column(DateTime(timezone=True), nullable=True)
    priority = Column(String(50), nullable=True)
    category = Column(String(50), nullable=True)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User")