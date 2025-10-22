"""ensure boolean defaults on users table align with application expectations

Revision ID: a1b2c3d4e5f7
Revises: 9abcde123456
Create Date: 2025-10-22 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f7'
down_revision: Union[str, None] = '9abcde123456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


BOOLEAN_COLUMNS = (
    ('is_active', 'TRUE'),
    ('is_verified', 'FALSE'),
    ('gmail_connected', 'FALSE'),
)


def _users_table_exists(bind) -> bool:
    inspector = sa.inspect(bind)
    return 'users' in inspector.get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _users_table_exists(bind):
        return

    if bind.dialect.name != 'postgresql':
        # Other dialects either lack ALTER DEFAULT support or do not need this fix
        return

    inspector = sa.inspect(bind)
    user_columns = {col['name'] for col in inspector.get_columns('users')}

    for column_name, default_literal in BOOLEAN_COLUMNS:
        if column_name not in user_columns:
            continue
        op.execute(
            text(
                f"ALTER TABLE users ALTER COLUMN {column_name} SET DEFAULT {default_literal}"
            )
        )


def downgrade() -> None:
    bind = op.get_bind()
    if not _users_table_exists(bind):
        return

    if bind.dialect.name != 'postgresql':
        return

    inspector = sa.inspect(bind)
    user_columns = {col['name'] for col in inspector.get_columns('users')}

    for column_name, _ in BOOLEAN_COLUMNS:
        if column_name not in user_columns:
            continue
        op.execute(
            text(f"ALTER TABLE users ALTER COLUMN {column_name} DROP DEFAULT")
        )
