import time
from datetime import datetime, timezone
from typing import List, Optional, Literal

from fastapi import APIRouter, Depends, HTTPException, Request, status
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.config import settings
from app.core.limits import limiter, user_rate_limit_key
from app.core.security import sanitize_text
from app.database.database import get_db
from app.models.models import (
    Email,
    EmailAnalytics,
    EmailCategory,
    SubscriptionStatus,
    User,
)
from app.schemas.api_responses import EmailsPageResponse, PaginationMeta
from app.schemas.schemas import EmailAnalysis, EmailCreate, EmailResponse

router = APIRouter(prefix="/emails", tags=["emails"])

# Per-user rate limit on analyze (e.g., 10/min per user); fallback to IP when unauthenticated
@limiter.limit("10/minute", key_func=user_rate_limit_key)
@router.post("/analyze", response_model=EmailResponse, summary="Analyze an email", description="Analyze email content with AI and persist the result and analytics.")
async def analyze_email(
    request: Request,
    email_data: EmailCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Enforce FREE plan monthly quota
    if current_user.subscription_status == SubscriptionStatus.FREE:
        now = datetime.now(timezone.utc)
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        used = (
            db.query(EmailAnalytics)
            .filter(
                EmailAnalytics.user_id == current_user.id,
                EmailAnalytics.created_at >= month_start,
            )
            .count()
        )
        if used >= settings.free_monthly_analysis_limit:
            raise HTTPException(
                status_code=402,
                detail=(
                    f"Monthly quota exceeded: {used}/{settings.free_monthly_analysis_limit}. "
                    "Upgrade to increase limits."
                ),
            )

    start_time = time.time()

    # Initialize the email analysis service
    from app.services.email_service import EmailAnalysisService
    analysis_service = EmailAnalysisService()

    # Sanitize inputs to prevent XSS persistence
    safe_subject = sanitize_text(email_data.subject) if email_data.subject else None
    safe_content = sanitize_text(email_data.content)

    try:
        analysis = analysis_service.analyze_email(content=safe_content, subject=safe_subject)
        processing_time = int((time.time() - start_time) * 1000)

        email_record = Email(
            user_id=current_user.id,
            subject=safe_subject,
            content=safe_content,
            summary=analysis.summary,
            category=analysis.category,
            confidence_score=analysis.confidence_score,
            processing_time_ms=processing_time,
        )

        analytics_record = EmailAnalytics(
            user_id=current_user.id,
            sender=None,  # optional: populate if available in future
            subject=safe_subject,
            email_content=safe_content,
            received_date=None,  # optional: set if available
            priority=None,  # optional: set if available
            category=analysis.category,
            summary=analysis.summary,
        )

        db.add(email_record)
        db.add(analytics_record)
        db.commit()
        db.refresh(email_record)
        return email_record
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze email",
        )

@router.get(
    "/",
    response_model=EmailsPageResponse,
    summary="List analyzed emails",
    description="Get paginated list of the current user's analyzed emails.",
)
async def get_user_emails(
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    page = max(1, page)
    page_size = max(1, min(100, page_size))
    q = db.query(Email).filter(Email.user_id == current_user.id)
    total = q.count()
    pages = (total + page_size - 1) // page_size if total else 1
    offset = (page - 1) * page_size
    items = q.order_by(Email.id.desc()).offset(offset).limit(page_size).all()
    meta = PaginationMeta(
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1,
    )
    return EmailsPageResponse(data=items, pagination=meta)

@limiter.limit("30/minute", key_func=user_rate_limit_key)
@router.get(
    "/search",
    response_model=EmailsPageResponse,
    summary="Search & filter analyzed emails",
    description="Filter by text, category, confidence, and date range with pagination and sorting.",
)
async def search_emails(
    request: Request,
    q: Optional[str] = None,
    category: Optional[EmailCategory] = None,
    categories: Optional[List[EmailCategory]] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    min_confidence: Optional[int] = None,
    max_confidence: Optional[int] = None,
    sort_by: Literal["created_at", "confidence"] = "created_at",
    sort_dir: Literal["asc", "desc"] = "desc",
    page: int = 1,
    page_size: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    from sqlalchemy import or_, func

    qbase = db.query(Email).filter(Email.user_id == current_user.id)
    if q:
        ql = q.strip().lower()
        pattern = f"%{ql}%"
        qbase = qbase.filter(
            or_(func.lower(Email.subject).like(pattern), func.lower(Email.summary).like(pattern))
        )
    cats: List[EmailCategory] = []
    if categories:
        cats.extend(categories)
    if category:
        cats.append(category)
    if cats:
        qbase = qbase.filter(Email.category.in_(cats))
    if isinstance(min_confidence, int):
        qbase = qbase.filter(Email.confidence_score >= min_confidence)
    if isinstance(max_confidence, int):
        qbase = qbase.filter(Email.confidence_score <= max_confidence)

    def _parse_dt(s: str, end: bool = False) -> Optional[datetime]:
        try:
            s = s.strip()
            if s.endswith("Z"):
                s = s[:-1] + "+00:00"
            try:
                dt = datetime.fromisoformat(s)
            except Exception:
                from datetime import datetime as _dt
                d = _dt.strptime(s, "%Y-%m-%d").date()
                if end:
                    dt = datetime(d.year, d.month, d.day, 23, 59, 59, 999999, tzinfo=timezone.utc)
                else:
                    dt = datetime(d.year, d.month, d.day, 0, 0, 0, 0, tzinfo=timezone.utc)
            if dt.tzinfo is None:
                dt = dt.replace(tzinfo=timezone.utc)
            return dt.astimezone(timezone.utc)
        except Exception:
            return None

    if date_from:
        dtf = _parse_dt(date_from, end=False)
        if dtf:
            qbase = qbase.filter(Email.created_at >= dtf)
    if date_to:
        dtt = _parse_dt(date_to, end=True)
        if dtt:
            qbase = qbase.filter(Email.created_at <= dtt)

    order_col = Email.confidence_score if sort_by == "confidence" else Email.created_at
    qbase = qbase.order_by(order_col.asc().nullslast()) if sort_dir == "asc" else qbase.order_by(order_col.desc().nullslast())

    page = max(1, page)
    page_size = max(1, min(100, page_size))
    total = qbase.count()
    pages = (total + page_size - 1) // page_size if total else 1
    items = qbase.offset((page - 1) * page_size).limit(page_size).all()
    meta = PaginationMeta(
        total=total,
        page=page,
        page_size=page_size,
        pages=pages,
        has_next=page < pages,
        has_prev=page > 1,
    )
    return EmailsPageResponse(data=items, pagination=meta)

@router.get("/{email_id}", response_model=EmailResponse, summary="Get email by ID", description="Get a specific analyzed email by ID.")
async def get_email(
    email_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific email by ID."""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.user_id == current_user.id
    ).first()
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    return email

@router.delete("/{email_id}", summary="Delete email", description="Delete an analyzed email record by ID.")
async def delete_email(
    email_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an email record."""
    email = db.query(Email).filter(
        Email.id == email_id,
        Email.user_id == current_user.id
    ).first()
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Email not found"
        )
    
    db.delete(email)
    db.commit()
    
    return {"message": "Email deleted successfully"}

# Keep demo-analyze open but still rate limit by IP to avoid abuse
@limiter.limit("5/minute", key_func=get_remote_address)
@router.post("/demo-analyze", response_model=EmailAnalysis, summary="Demo: analyze without auth", description="Public demo endpoint to analyze email content without authentication (rate limited).")
async def demo_analyze_email(request: Request, email_data: EmailCreate):
    """Demo endpoint for analyzing emails without authentication."""
    from app.services.email_service import EmailAnalysisService
    analysis_service = EmailAnalysisService()
    safe_subject = sanitize_text(email_data.subject) if email_data.subject else None
    safe_content = sanitize_text(email_data.content)
    
    try:
        # Analyze the email
        analysis = analysis_service.analyze_email(
            content=safe_content,
            subject=safe_subject
        )
        
        return analysis
        
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze email"
        )