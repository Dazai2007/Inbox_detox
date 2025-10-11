import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator

_VALID_ENVIRONMENTS = {"development", "staging", "production"}
_VALID_SAMESITE = {"lax", "strict", "none"}
_VALID_LOG_LEVELS = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}

class Settings(BaseSettings):
    # Database
    database_url: str = "sqlite:///./inbox_detox.db"  # Default to SQLite for development
    
    # Security
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_days: int = 30
    
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
    # CORS allowed origins (comma-separated). In production, must not be empty.
    cors_allowed_origins: list[str] = []
    
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

    # Frontend serving: disabled by default in API-only mode
    serve_frontend: bool = False
    frontend_dist_dir: str = "frontend/dist"

    # Development CORS convenience: explicit dev origins when environment != production
    dev_cors_allowed_origins: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # CAPTCHA / Human verification (Cloudflare Turnstile)
    # When enabled, login/register endpoints will require a valid CAPTCHA token
    captcha_enabled_login: bool = False
    captcha_enabled_register: bool = False
    turnstile_site_key: Optional[str] = None
    turnstile_secret_key: Optional[str] = None

    # SMTP settings (optional in dev)
    smtp_host: Optional[str] = None
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_use_tls: bool = True
    smtp_from: Optional[str] = None

    # Cookie settings for refresh tokens
    refresh_cookie_name: str = "rt"
    cookie_domain: str | None = None
    cookie_samesite: str = "lax"  # lax/strict/none

    # Backups
    backup_dir: str = "backups"
    backup_retention: int = 7  # keep last N backups per database

    # Development convenience: allow login for unverified users
    allow_unverified_login: bool = False
    
    class Config:
        env_file = ".env"

    # Parse comma-separated env var into list
    @field_validator("allowed_hosts", mode="before")
    @classmethod
    def _parse_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [part.strip() for part in v.split(",") if part.strip()]
        return v

    @field_validator("cors_allowed_origins", mode="before")
    @classmethod
    def _parse_cors_origins(cls, v):
        if isinstance(v, str):
            return [part.strip() for part in v.split(",") if part.strip()]
        return v

    @field_validator("dev_cors_allowed_origins", mode="before")
    @classmethod
    def _parse_dev_cors_origins(cls, v):
        if isinstance(v, str):
            return [part.strip() for part in v.split(",") if part.strip()]
        return v

    # Helper methods for runtime validation and normalization
    def _is_sqlite(self) -> bool:
        return isinstance(self.database_url, str) and self.database_url.startswith("sqlite")

    def validate(self) -> tuple[list[str], list[str]]:
        """Return (errors, warnings) for current settings.

        Errors: conditions that should fail fast in production.
        Warnings: useful but non-fatal notes.
        """
        errors: list[str] = []
        warnings: list[str] = []

        env = (self.environment or "").lower()
        if env not in _VALID_ENVIRONMENTS:
            errors.append(f"ENVIRONMENT must be one of {sorted(_VALID_ENVIRONMENTS)}, got: {self.environment!r}")

        # Normalize and validate cookie samesite
        samesite = (self.cookie_samesite or "").lower()
        if samesite not in _VALID_SAMESITE:
            errors.append(f"COOKIE_SAMESITE must be one of {sorted(_VALID_SAMESITE)}, got: {self.cookie_samesite!r}")

        # Validate log level
        if isinstance(self.log_level, str) and self.log_level.upper() not in _VALID_LOG_LEVELS:
            warnings.append(
                f"LOG_LEVEL {self.log_level!r} not recognized; expected one of {sorted(_VALID_LOG_LEVELS)}. Using INFO by default."
            )

        # Secret key sanity
        if not self.secret_key or self.secret_key == "change-this-in-production":
            if env == "production":
                errors.append("SECRET_KEY is missing or default. Set a strong, random SECRET_KEY in production.")
            else:
                warnings.append("SECRET_KEY is default. Use a strong key in production.")
        elif isinstance(self.secret_key, str) and len(self.secret_key) < 32:
            if env == "production":
                errors.append("SECRET_KEY is too short (<32). Use a longer, random key in production.")
            else:
                warnings.append("SECRET_KEY is short. Recommend >=32 characters.")

        # Production-only strict checks
        if env == "production":
            # Require explicit CORS origins
            if not self.cors_allowed_origins:
                errors.append("CORS_ALLOWED_ORIGINS is empty in production. Set comma-separated allowed origins.")
            # Avoid SQLite in prod
            if self._is_sqlite():
                errors.append("DATABASE_URL points to SQLite in production. Use Postgres or another production-grade DB.")
            # Cookies: if SameSite=None, ensure you're serving over HTTPS (we can't detect TLS here)
            if samesite == "none":
                warnings.append("COOKIE_SAMESITE=None requires Secure cookies over HTTPS. Ensure TLS is enabled.")

        # SMTP partial configuration warnings
        smtp_fields = [self.smtp_host, self.smtp_username, self.smtp_password]
        if any(smtp_fields) and not self.smtp_host:
            warnings.append("SMTP settings partially provided; SMTP_HOST is required to send emails.")

        # CAPTCHA sanity checks
        if self.captcha_enabled_login or self.captcha_enabled_register:
            if not self.turnstile_secret_key:
                if env == "production":
                    errors.append("CAPTCHA enabled but TURNSTILE_SECRET_KEY missing.")
                else:
                    warnings.append("CAPTCHA enabled but TURNSTILE_SECRET_KEY missing; verification will fail.")

        # Frontend serving folder existence check (warn only)
        # In API-only mode, we don't require a built frontend

        return errors, warnings

settings = Settings()