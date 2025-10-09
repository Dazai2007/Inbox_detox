from fastapi import FastAPI, Request, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
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
from app.database.database import engine, get_db
from app.models import models
from app.api import auth, emails
from app.api import verification
from app.api import google as google_router

# Initialize logging
setup_logging(settings)

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="AI-powered email management SaaS platform",
    version="1.0.0",
    debug=settings.debug
)

# Create database tables on startup for SQLite dev environments
def _is_sqlite(url: str) -> bool:
    return url.startswith("sqlite")

@app.on_event("startup")
async def _init_db_if_needed():
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

# Rate limiting
app.state.limiter = limiter
app.add_middleware(SlowAPIMiddleware)

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
    return JSONResponse(status_code=429, content={"detail": "Rate limit exceeded"})

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
        content={
            "detail": "Internal server error",
            "request_id": req_id,
        },
    )

# CORS middleware
origins = settings.allowed_hosts if settings.environment == "production" else ["*"]
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
@app.get("/health")
async def health_check(db: Session = Depends(get_db)):
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "database": "connected"
    }

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