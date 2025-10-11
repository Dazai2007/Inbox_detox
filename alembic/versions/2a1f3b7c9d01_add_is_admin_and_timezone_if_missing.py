"""add is_admin to users and ensure timezone column exists

Revision ID: 2a1f3b7c9d01
Revises: d4f7a9c1b2e3
Create Date: 2025-10-10 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '2a1f3b7c9d01'
down_revision: Union[str, None] = 'd4f7a9c1b2e3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def has_column(table: str, column: str) -> bool:
    bind = op.get_bind()
    insp = sa.inspect(bind)
    cols = [c['name'] for c in insp.get_columns(table)]
    return column in cols


def upgrade() -> None:
    # Add is_admin boolean if missing
    if not has_column('users', 'is_admin'):
        op.add_column('users', sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.false()))
        op.execute("UPDATE users SET is_admin = 0 WHERE is_admin IS NULL")
        # Drop default on supported dialects (SQLite lacks ALTER COLUMN DROP DEFAULT)
        bind = op.get_bind()
        if bind.dialect.name != 'sqlite':
            op.alter_column('users', 'is_admin', server_default=None)

    # Add timezone column if missing (default 'UTC')
    if not has_column('users', 'timezone'):
        op.add_column('users', sa.Column('timezone', sa.String(length=64), nullable=False, server_default='UTC'))
        op.execute("UPDATE users SET timezone = 'UTC' WHERE timezone IS NULL")
        # Drop default on supported dialects (SQLite lacks ALTER COLUMN DROP DEFAULT)
        bind = op.get_bind()
        if bind.dialect.name != 'sqlite':
            op.alter_column('users', 'timezone', server_default=None)


def downgrade() -> None:
    # Safe down - drop columns if exist
    if has_column('users', 'timezone'):
        op.drop_column('users', 'timezone')
    if has_column('users', 'is_admin'):
        op.drop_column('users', 'is_admin')
