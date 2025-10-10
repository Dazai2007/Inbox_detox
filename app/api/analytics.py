from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.core.config import settings
from app.database.database import get_db
from app.models.models import EmailAnalytics, User
from app.schemas.api_responses import DailyBucket, UsageTimeSeries, UsageTotals


router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/usage/summary", response_model=UsageTotals, summary="My usage summary")
def my_usage_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    total = (
        db.query(func.count(EmailAnalytics.id))
        .filter(EmailAnalytics.user_id == current_user.id)
        .scalar()
        or 0
    )
    month = (
        db.query(func.count(EmailAnalytics.id))
        .filter(EmailAnalytics.user_id == current_user.id, EmailAnalytics.created_at >= month_start)
        .scalar()
        or 0
    )
    return UsageTotals(
        user_id=current_user.id,
        total_analyses=total,
        month_analyses=month,
        quota_limit=settings.free_monthly_analysis_limit,
    )


@router.get("/usage/daily", response_model=UsageTimeSeries, summary="My last 30 days usage")
def my_usage_daily(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Build last 30 day window
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=29)
    # Query counts grouped by date
    rows = (
        db.query(func.date(EmailAnalytics.created_at), func.count(EmailAnalytics.id))
        .filter(EmailAnalytics.user_id == current_user.id, EmailAnalytics.created_at >= datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc))
        .group_by(func.date(EmailAnalytics.created_at))
        .order_by(func.date(EmailAnalytics.created_at))
        .all()
    )
    counts = {str(r[0]): int(r[1]) for r in rows}
    series: List[DailyBucket] = []
    for i in range(30):
        d = start_date + timedelta(days=i)
        key = d.isoformat()
        series.append(DailyBucket(date=key, count=counts.get(key, 0)))
    return UsageTimeSeries(data=series)
