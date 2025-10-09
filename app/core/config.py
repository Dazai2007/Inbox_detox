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
    
    # OpenAI (optional in dev; features will fallback if not set)
    openai_api_key: Optional[str] = None
    
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

    # Google OAuth (Gmail)
    google_client_id: Optional[str] = None
    google_client_secret: Optional[str] = None
    # Default redirect in dev; override in .env for prod
    google_redirect_uri: str = "http://127.0.0.1:8000/google/oauth2/callback"
    # Space-separated scopes string expected by Google
    google_scopes: str = (
        "https://www.googleapis.com/auth/gmail.readonly "
        "https://www.googleapis.com/auth/userinfo.email "
        "https://www.googleapis.com/auth/userinfo.profile "
        "openid"
    )
    
    class Config:
        env_file = ".env"

settings = Settings()