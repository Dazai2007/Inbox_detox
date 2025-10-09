import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator

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
    # Comma-separated in .env: ALLOWED_HOSTS=localhost,127.0.0.1,app.example.com
    allowed_hosts: list[str] = ["localhost", "127.0.0.1"]
    
    # Rate Limiting
    rate_limit_per_minute: int = 10
    # Quotas
    free_monthly_analysis_limit: int = 20

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
    
    # Logging
    log_level: str = "INFO"  # e.g., DEBUG, INFO, WARNING, ERROR
    log_dir: str = "logs"

    # App base URL for building links in emails (verification etc.)
    app_base_url: str = "http://127.0.0.1:8000"

    # SMTP settings (optional in dev)
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: bool = True
    smtp_from: Optional[str] = None
    
    class Config:
        env_file = ".env"

    # Parse comma-separated env var into list
    @field_validator("allowed_hosts", mode="before")
    @classmethod
    def _parse_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [part.strip() for part in v.split(",") if part.strip()]
        return v

settings = Settings()