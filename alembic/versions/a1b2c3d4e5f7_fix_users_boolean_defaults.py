"""ensure boolean defaults on users table align with application expectations

Revision ID: a1b2c3d4e5f7
Revises: 9abcde123456
Create Date: 2025-10-22 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f7'
down_revision: Union[str, None] = '9abcde123456'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


BOOLEAN_COLUMNS = (
    ('is_active', sa.text('true')),
    ('is_verified', sa.text('false')),
    ('gmail_connected', sa.text('false')),
)


def _users_table_exists(bind) -> bool:
    inspector = sa.inspect(bind)
    return 'users' in inspector.get_table_names()


def upgrade() -> None:
    bind = op.get_bind()
    if not _users_table_exists(bind):
        return

    with op.batch_alter_table('users', schema=None) as batch_op:
        for column_name, default_expr in BOOLEAN_COLUMNS:
            batch_op.alter_column(
                column_name,
                existing_type=sa.Boolean(),
                server_default=default_expr,
            )


def downgrade() -> None:
    bind = op.get_bind()
    if not _users_table_exists(bind):
        return

    with op.batch_alter_table('users', schema=None) as batch_op:
        for column_name, _ in BOOLEAN_COLUMNS:
            batch_op.alter_column(
                column_name,
                existing_type=sa.Boolean(),
                server_default=None,
            )
