from fastapi import FastAPI, Request, Depends
from fastapi import HTTPException as FastAPIHTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import time
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from fastapi.responses import JSONResponse
import uuid
import traceback

from app.core.config import settings
from app.core.logging_config import setup_logging
import os
import subprocess
from app.core.limits import limiter
from app.schemas.api_responses import ErrorEnvelope, ApiError, HealthStatus
from app.database.database import engine, get_db
from app.models import models
from app.api import auth, emails
from app.api import verification
from app.api import google as google_router
from app.api import admin as admin_router
from app.api import analytics as analytics_router

# Initialize logging
setup_logging(settings)

# OpenAPI/Docs metadata
tags_metadata = [
    {
        "name": "authentication",
        "description": "User registration, login, tokens, email verification, and password reset.",
    },
    {
        "name": "emails",
        "description": "Analyze emails with AI and manage analyzed email records.",
    },
]

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="AI-powered email management SaaS platform",
    version="1.0.0",
    debug=settings.debug,
    openapi_tags=tags_metadata,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    contact={
        "name": "Inbox Detox Support",
        "url": "https://example.com/support",
        "email": "support@example.com",
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
)

# Create database tables on startup for SQLite dev environments
def _is_sqlite(url: str) -> bool:
    return url.startswith("sqlite")

@app.on_event("startup")
async def _init_db_if_needed():
    import logging
    logger = logging.getLogger("app")

    # Validate environment configuration early
    errors, warnings = settings.validate()
    for w in warnings:
        logger.warning(f"[startup] {w}")
    if errors:
        # Fail fast in production; warn in development
        if settings.environment == "production":
            raise RuntimeError("Configuration errors: " + "; ".join(errors))
        else:
            for e in errors:
                logger.error(f"[startup] {e}")
    # Only auto-create in SQLite/dev to avoid bypassing migrations in Postgres
    if _is_sqlite(settings.database_url):
        models.Base.metadata.create_all(bind=engine)

    # Optional: auto-run Alembic migrations if explicitly enabled
    if os.getenv("AUTO_MIGRATE_ON_STARTUP", "false").lower() in ("1", "true", "yes"): 
        try:
            # Use python -m alembic upgrade head so it works in venv
            subprocess.check_call([
                os.getenv("PYTHON_EXECUTABLE", "python"), "-m", "alembic", "upgrade", "head"
            ])
            print("[startup] Alembic migrations applied (upgrade head)")
        except subprocess.CalledProcessError as e:
            if settings.environment == "production":
                # Fail fast in production if migrations cannot be applied
                raise RuntimeError(f"Failed to apply Alembic migrations: {e}")
            else:
                print(f"[startup] Warning: failed to apply Alembic migrations: {e}")

    # Warn if in production without explicit CORS allowed origins
    if settings.environment == "production" and not settings.cors_allowed_origins:
        logger.warning(
            "CORS: Running in production with empty CORS_ALLOWED_ORIGINS; no origins will be allowed. "
            "Set CORS_ALLOWED_ORIGINS in your environment (comma-separated)."
        )

# Rate limiting
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    # Build a standard error envelope and include headers via slowapi's injector
    from app.schemas.api_responses import ErrorEnvelope, ApiError
    # Prepare base response
    response = JSONResponse(
        status_code=429,
        content=ErrorEnvelope(success=False, error=ApiError(code=429, message="Rate limit exceeded")).model_dump(),
    )
    # Inject X-RateLimit-* and Retry-After headers
    try:
        limiter = request.app.state.limiter
        response = limiter._inject_headers(response, request.state.view_rate_limit)  # type: ignore[attr-defined]
    except Exception:
        # If anything goes wrong, still return the envelope without extra headers
        pass
    return response

# Global error handler for unhandled exceptions (500)
@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    req_id = str(uuid.uuid4())
    # Log stack trace server-side for debugging
    import logging
    logger = logging.getLogger("app")
    logger.exception(f"{req_id} {request.method} {request.url} -> {exc}")
    return JSONResponse(
        status_code=500,
        content=ErrorEnvelope(success=False, error=ApiError(code=500, message="Internal server error"), request_id=req_id).model_dump(),
    )

# Standardize HTTPException responses
@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    req_id = str(uuid.uuid4())
    import logging
    logger = logging.getLogger("app")
    # Log at warning level for 4xx, error for 5xx
    level = logger.error if exc.status_code >= 500 else logger.warning
    level(f"{req_id} {request.method} {request.url} -> {exc.status_code} {exc.detail}")
    # Normalize detail to string
    message = exc.detail if isinstance(exc.detail, str) else str(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content=ErrorEnvelope(success=False, error=ApiError(code=exc.status_code, message=message), request_id=req_id).model_dump(),
    )

# CORS middleware
if settings.environment == "production":
    origins = settings.cors_allowed_origins
    # If not set, keep it empty (no wildcard). We can warn on startup.
else:
    origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add basic security headers
@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    # Minimal safe set; adjust CSP if you serve inline scripts/styles
    response.headers.setdefault("X-Content-Type-Options", "nosniff")
    response.headers.setdefault("X-Frame-Options", "DENY")
    response.headers.setdefault("Referrer-Policy", "no-referrer")
    # Conservative CSP; relax if needed for frontend assets
    response.headers.setdefault("Content-Security-Policy", "default-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
    return response

# Static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# Include API routers
app.include_router(auth.router)
app.include_router(emails.router)
app.include_router(verification.router)
app.include_router(google_router.router)
app.include_router(admin_router.router)
app.include_router(analytics_router.router)

# Simple request logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    duration = (time.time() - start) * 1000
    path = request.url.path
    method = request.method
    client = request.client.host if request.client else "?"
    import logging
    logger = logging.getLogger("app")
    logger.info(f"{method} {path} from {client} -> {response.status_code} ({duration:.1f} ms)")
    return response

# Root endpoint
@app.get("/", response_class=HTMLResponse)
async def root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

# Health check
@app.get("/health", summary="Health check", description="Returns service health, DB, OpenAI, and Redis status.", response_model=HealthStatus)
async def health_check(db: Session = Depends(get_db)):
    now_utc = datetime.now(timezone.utc)
    result: dict = {
        "status": "healthy",
        "timestamp": now_utc.timestamp(),
        "version": "1.0.0",
        "database": None,
        "openai": None,
        "redis": None,
    }

    # DB connection check
    try:
        db.execute("SELECT 1")
        result["database"] = "connected"
    except Exception as e:
        result["database"] = f"error: {type(e).__name__}: {e}"

    # OpenAI API key check
    from app.core.config import settings
    if settings.openai_api_key:
        try:
            import openai
            openai_client = openai.OpenAI(api_key=settings.openai_api_key)
            # Use a cheap endpoint to check key validity
            openai_client.models.list()
            result["openai"] = "ok"
        except Exception as e:
            result["openai"] = f"error: {type(e).__name__}: {e}"
    else:
        result["openai"] = "not configured"

    # Redis check (optional)
    try:
        import importlib.util, importlib
        spec = importlib.util.find_spec("redis")
        if not spec:
            result["redis"] = "not installed"
        else:
            redis = importlib.import_module("redis")
            redis_url = getattr(settings, "redis_url", None)
            if redis_url:
                r = redis.Redis.from_url(redis_url)
                pong = r.ping()
                result["redis"] = "ok" if pong else "no response"
            else:
                result["redis"] = "not configured"
    except Exception as e:
        result["redis"] = f"error: {type(e).__name__}: {e}"

    return HealthStatus(**result)

# API info
@app.get("/api/info")
async def api_info():
    return {
        "app_name": settings.app_name,
        "version": "1.0.0",
        "environment": settings.environment,
        "features": [
            "Email Analysis",
            "AI Summarization", 
            "Category Classification",
            "User Authentication",
            "Subscription Management"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=settings.debug
    )