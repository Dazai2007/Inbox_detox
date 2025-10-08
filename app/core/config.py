import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./inbox_detox.db"  # Default to SQLite for development
    
    # Security
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # OpenAI
    openai_api_key: str
    
    # Stripe
    stripe_secret_key: Optional[str] = None
    stripe_publishable_key: Optional[str] = None
    stripe_webhook_secret: Optional[str] = None
    
    # App Settings
    app_name: str = "Inbox Detox"
    environment: str = "development"
    debug: bool = True
    allowed_hosts: list = ["localhost", "127.0.0.1"]
    
    # Rate Limiting
    rate_limit_per_minute: int = 10
    
    class Config:
        env_file = ".env"

settings = Settings()