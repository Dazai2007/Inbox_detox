from typing import Set, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.models import BlacklistedToken

# Fallback in-memory set (used only if DB not provided)
blacklisted_jti: Set[str] = set()

def blacklist_jti(jti: str):
    blacklisted_jti.add(jti)

def is_blacklisted(jti: str) -> bool:
    return jti in blacklisted_jti

def blacklist_jti_db(db: Session, jti: str, expires_at: Optional[datetime] = None):
    if not jti:
        return
    if expires_at is None:
        # default to now+30d to be safe
        expires_at = datetime.now(timezone.utc)
    exists = db.query(BlacklistedToken).filter(BlacklistedToken.jti == jti).first()
    if not exists:
        db.add(BlacklistedToken(jti=jti, expires_at=expires_at))
        db.commit()

def is_blacklisted_db(db: Session, jti: str) -> bool:
    if not jti:
        return False
    rec = db.query(BlacklistedToken).filter(BlacklistedToken.jti == jti).first()
    if not rec:
        return False
    # Optionally prune expired
    if rec.expires_at and rec.expires_at < datetime.now(timezone.utc):
        return False
    return True