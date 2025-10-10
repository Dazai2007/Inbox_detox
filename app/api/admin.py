from datetime import datetime, timezone, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.auth import get_current_user
from app.database.database import get_db
from app.models.models import User, Subscription
from sqlalchemy import func
from app.schemas.api_responses import ApiMessage, AdminOverview, DailyBucket, UsageTimeSeries
from app.schemas.schemas import AdminSetSubscription, AdminUpdateUser, UserResponse

router = APIRouter(prefix="/admin", tags=["admin"])


def _ensure_admin(user: User):
    if not getattr(user, "is_admin", False):
        raise HTTPException(status_code=403, detail="Admin privileges required")


@router.get("/users", response_model=list[UserResponse], summary="List users")
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_admin(current_user)
    return db.query(User).order_by(User.id.asc()).all()


@router.get("/users/{user_id}", response_model=UserResponse, summary="Get user")
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.patch("/users/{user_id}", response_model=UserResponse, summary="Update user fields")
def update_user(
    user_id: int,
    payload: AdminUpdateUser,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(user, field, value)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/users/{user_id}/subscriptions", summary="Create or update subscription")
def set_subscription(
    user_id: int,
    payload: AdminSetSubscription,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    # Find latest subscription for the user
    sub = (
        db.query(Subscription)
        .filter(Subscription.user_id == user.id)
        .order_by(Subscription.id.desc())
        .first()
    )
    if not sub:
        sub = Subscription(user_id=user.id, status="active")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(sub, field, value)
    # Default dates to now if provided partially
    now = datetime.now(timezone.utc)
    if payload.current_period_start and not payload.current_period_end:
        sub.current_period_end = now
    db.add(sub)
    db.commit()
    return ApiMessage(message="Subscription updated")


@router.delete("/users/{user_id}", summary="Delete user")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_admin(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return ApiMessage(message="User deleted")

@router.get("/overview", response_model=AdminOverview, summary="Platform overview metrics")
def platform_overview(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_admin(current_user)
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_analyses = db.query(func.count()).select_from(Subscription).session.query(func.count()).scalar() if False else None  # placeholder
    # Prefer counting from EmailAnalytics for usage
    from app.models.models import EmailAnalytics
    total_analyses = db.query(func.count(EmailAnalytics.id)).scalar() or 0
    active_users_last_30 = (
        db.query(func.count(func.distinct(EmailAnalytics.user_id)))
        .filter(EmailAnalytics.created_at >= datetime.now(timezone.utc) - timedelta(days=30))
        .scalar()
        or 0
    )
    data = {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "active_users_last_30d": active_users_last_30,
    }
    return AdminOverview(data=data)

@router.get("/usage/daily", response_model=UsageTimeSeries, summary="Global last 30 days usage")
def global_usage_daily(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _ensure_admin(current_user)
    from app.models.models import EmailAnalytics
    today = datetime.now(timezone.utc).date()
    start_date = today - timedelta(days=29)
    rows = (
        db.query(func.date(EmailAnalytics.created_at), func.count(EmailAnalytics.id))
        .filter(EmailAnalytics.created_at >= datetime.combine(start_date, datetime.min.time(), tzinfo=timezone.utc))
        .group_by(func.date(EmailAnalytics.created_at))
        .order_by(func.date(EmailAnalytics.created_at))
        .all()
    )
    counts = {str(r[0]): int(r[1]) for r in rows}
    series = [DailyBucket(date=(start_date + timedelta(days=i)).isoformat(), count=counts.get((start_date + timedelta(days=i)).isoformat(), 0)) for i in range(30)]
    return UsageTimeSeries(data=series)
