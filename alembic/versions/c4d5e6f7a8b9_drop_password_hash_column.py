"""drop password_hash column now that hashed_password is canonical

Revision ID: c4d5e6f7a8b9
Revises: b2c3d4e5f8a9
Create Date: 2025-10-22 20:20:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = "c4d5e6f7a8b9"
down_revision: Union[str, None] = "b2c3d4e5f8a9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "users" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("users")}
    if "password_hash" not in columns:
        return

    if "hashed_password" in columns:
        op.execute(
            text(
                "UPDATE users SET hashed_password = password_hash "
                "WHERE hashed_password IS NULL AND password_hash IS NOT NULL"
            )
        )

    op.drop_column("users", "password_hash")


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "users" not in inspector.get_table_names():
        return

    columns = {col["name"] for col in inspector.get_columns("users")}
    if "password_hash" in columns:
        return

    op.add_column("users", sa.Column("password_hash", sa.String(length=255), nullable=True))

    if "hashed_password" in columns:
        op.execute(
            text(
                "UPDATE users SET password_hash = hashed_password "
                "WHERE hashed_password IS NOT NULL"
            )
        )
