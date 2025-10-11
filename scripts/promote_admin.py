import argparse
import sys
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

# Ensure project root is on sys.path so `app` imports work when run from scripts/
PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Reuse app's DB session and models
from app.database.database import SessionLocal
from app.models.models import User
from app.services.auth_service import AuthService


def promote_admin(
    db: Session,
    *,
    email: Optional[str] = None,
    user_id: Optional[int] = None,
    create_if_missing: bool = False,
    password: Optional[str] = None,
    verify: bool = True,
) -> User:
    if not email and not user_id:
        raise ValueError("Provide either --email or --id to select the user to promote.")

    q = db.query(User)
    if email:
        q = q.filter(User.email == email)
    else:
        q = q.filter(User.id == user_id)

    user = q.one_or_none()
    if not user:
        if create_if_missing and email:
            if not password:
                # Generate a strong temporary password if not provided
                import secrets, string
                alphabet = string.ascii_letters + string.digits + string.punctuation
                password = ''.join(secrets.choice(alphabet) for _ in range(20))
                print(f"No password provided; generated temporary password: {password}")
            user = AuthService.create_user(db, email=email, password=password)
            print(f"Created user: {user.email} (id={user.id})")
        else:
            ident = email if email else f"id={user_id}"
            raise SystemExit(f"User not found: {ident}")

    if user.is_admin:
        print(f"User already admin: {user.email} (id={user.id})")
        return user

    user.is_admin = True
    if verify and hasattr(user, 'is_verified'):
        user.is_verified = True
    db.add(user)
    db.commit()
    db.refresh(user)
    print(f"Promoted to admin: {user.email} (id={user.id})")
    return user


def main(argv: list[str]) -> None:
    parser = argparse.ArgumentParser(description="Promote a user to admin (is_admin=True), optionally creating if missing")
    parser.add_argument("--email", help="User email to promote or create")
    parser.add_argument("--id", type=int, help="User id to promote")
    parser.add_argument("--create-if-missing", action="store_true", help="Create the user if it doesn't exist (requires --email)")
    parser.add_argument("--password", help="Password for newly created user (if omitted and creating, a strong password will be generated)")
    parser.add_argument("--no-verify", action="store_true", help="Do not mark the user as verified")
    args = parser.parse_args(argv)

    if not args.email and not args.id:
        parser.error("one of --email or --id is required")

    db = SessionLocal()
    try:
        promote_admin(
            db,
            email=args.email,
            user_id=args.id,
            create_if_missing=args.create_if_missing,
            password=args.password,
            verify=not args.no_verify,
        )
    finally:
        db.close()


if __name__ == "__main__":
    main(sys.argv[1:])
