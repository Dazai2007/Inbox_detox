import argparse
import sys
from pathlib import Path

# Ensure project root on sys.path
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from sqlalchemy.orm import Session
from app.database.database import SessionLocal
from app.models.models import User


def verify_user(db: Session, email: str) -> User:
    user = db.query(User).filter(User.email == email).one_or_none()
    if not user:
        raise SystemExit(f"User not found: {email}")
    user.is_verified = True
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"User verified: {user.email} (id={user.id})")
    return user


def main(argv: list[str]) -> None:
    parser = argparse.ArgumentParser(description="Mark a user as verified (is_verified=True)")
    parser.add_argument("--email", required=True, help="User email to verify")
    args = parser.parse_args(argv)

    db = SessionLocal()
    try:
        verify_user(db, args.email)
    finally:
        db.close()


if __name__ == "__main__":
    main(sys.argv[1:])
