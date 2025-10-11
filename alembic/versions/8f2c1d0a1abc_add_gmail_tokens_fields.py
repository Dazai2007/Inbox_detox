"""add gmail access/expiry fields

Revision ID: 8f2c1d0a1abc
Revises: 2a1f3b7c9d01
Create Date: 2025-10-10 16:40:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '8f2c1d0a1abc'
down_revision: Union[str, None] = '2a1f3b7c9d01'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.add_column(sa.Column('gmail_access_token', sa.String(length=2048), nullable=True))
        batch_op.add_column(sa.Column('gmail_token_expiry', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    with op.batch_alter_table('users') as batch_op:
        batch_op.drop_column('gmail_token_expiry')
        batch_op.drop_column('gmail_access_token')
