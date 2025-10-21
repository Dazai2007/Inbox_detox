"""add password reset tokens table

Revision ID: c3a1b2d4e5f6
Revises: 898d54edd068
Create Date: 2025-10-10 01:20:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c3a1b2d4e5f6'
down_revision = '898d54edd068'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'password_reset_tokens' not in tables:
        op.create_table(
            'password_reset_tokens',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('token', sa.String(length=128), nullable=False, unique=True, index=True),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('used', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade() -> None:
    # Drop table if it exists
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'password_reset_tokens' in inspector.get_table_names():
        op.drop_table('password_reset_tokens')
