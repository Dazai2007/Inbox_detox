"""add refresh tokens table

Revision ID: d4f7a9c1b2e3
Revises: c3a1b2d4e5f6
Create Date: 2025-10-10 01:32:00.000000

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'd4f7a9c1b2e3'
down_revision = 'c3a1b2d4e5f6'
branch_labels = None
depends_on = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'refresh_tokens' not in inspector.get_table_names():
        op.create_table(
            'refresh_tokens',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('jti', sa.String(length=64), nullable=False, unique=True, index=True),
            sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('revoked', sa.Boolean(), nullable=False, server_default=sa.text('0')),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'refresh_tokens' in inspector.get_table_names():
        op.drop_table('refresh_tokens')
