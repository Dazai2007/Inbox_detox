"""ensure password_hash column exists on users table

Revision ID: b2c3d4e5f8a9
Revises: a1b2c3d4e5f7
Create Date: 2025-10-22 18:30:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = "b2c3d4e5f8a9"
down_revision: Union[str, None] = "a1b2c3d4e5f7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "users" not in inspector.get_table_names():
        return

    user_columns = {col["name"] for col in inspector.get_columns("users")}
    added_password_hash = False

    if "password_hash" not in user_columns:
        op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))
        added_password_hash = True

    if (added_password_hash or "password_hash" in user_columns) and "hashed_password" in user_columns:
        op.execute(
            text(
                "UPDATE users SET password_hash = hashed_password "
                "WHERE password_hash IS NULL AND hashed_password IS NOT NULL"
            )
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "users" not in inspector.get_table_names():
        return

    user_columns = {col["name"] for col in inspector.get_columns("users")}
    if "password_hash" in user_columns:
        op.drop_column("users", "password_hash")
