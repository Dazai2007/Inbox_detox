import time
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from typing import List
from app.database.database import get_db
from app.api.auth import get_current_user
from app.services.email_service import EmailAnalysisService
from app.models.models import User, Email, EmailAnalytics
from app.schemas.schemas import EmailCreate, EmailResponse, EmailAnalysis
from slowapi.util import get_remote_address
from app.core.limits import limiter, user_rate_limit_key

router = APIRouter(prefix="/emails", tags=["emails"])

# Per-user rate limit on analyze (e.g., 10/min per user); fallback to IP when unauthenticated
@limiter.limit("10/minute", key_func=user_rate_limit_key)
@router.post("/analyze", response_model=EmailResponse)
async def analyze_email(
    request: Request,
    email_data: EmailCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Analyze an email and store the results."""
    start_time = time.time()
    
    # Initialize the email analysis service
    analysis_service = EmailAnalysisService()
    
    try:
        # Analyze the email
        analysis = analysis_service.analyze_email(
            content=email_data.content,
            subject=email_data.subject
        )
        
        processing_time = int((time.time() - start_time) * 1000)
        
        # Create email record in database
        email_record = Email(
            user_id=current_user.id,
            subject=email_data.subject,
            content=email_data.content,
            summary=analysis.summary,
            category=analysis.category,
            confidence_score=analysis.confidence_score,
            processing_time_ms=processing_time
        )

        # Also persist analytics history with raw content
        analytics_record = EmailAnalytics(
            user_id=current_user.id,
            sender=None,  # optional: populate if available in future
            subject=email_data.subject,
            email_content=email_data.content,
            received_date=None,  # optional: set if available
            priority=None,       # optional: set if available
            category=analysis.category,
            summary=analysis.summary,
        )

        db.add(email_record)
        db.add(analytics_record)
        db.commit()
        db.refresh(email_record)
        
        return email_record
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze email: {str(e)}"
        )

@router.get("/", response_model=List[EmailResponse])
async def get_user_emails(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's analyzed emails with pagination."""
    emails = db.query(Email).filter(
        Email.user_id == current_user.id
    ).offset(skip).limit(limit).all()
    
    return emails

@router.get("/{email_id}", response_model=EmailResponse)
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

@router.delete("/{email_id}")
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
@limiter.limit("5/minute")
@router.post("/demo-analyze", response_model=EmailAnalysis)
async def demo_analyze_email(request: Request, email_data: EmailCreate):
    """Demo endpoint for analyzing emails without authentication."""
    # Initialize the email analysis service
    analysis_service = EmailAnalysisService()
    
    try:
        # Analyze the email
        analysis = analysis_service.analyze_email(
            content=email_data.content,
            subject=email_data.subject
        )
        
        return analysis
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to analyze email: {str(e)}"
        )