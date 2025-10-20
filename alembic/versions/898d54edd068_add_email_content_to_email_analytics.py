"""add email_content to email_analytics

Revision ID: 898d54edd068
Revises: '7be1a575e101'
Create Date: 2025-10-10 00:26:14.118069

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '898d54edd068'
down_revision = '7be1a575e101'
branch_labels = None
depends_on = None

def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # Create table if it doesn't exist (safe for fresh databases)
    if 'email_analytics' not in tables:
        op.create_table(
            'email_analytics',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('user_id', sa.Integer(), sa.ForeignKey('users.id'), nullable=False),
            sa.Column('sender', sa.String(length=255), nullable=True),
            sa.Column('subject', sa.String(length=500), nullable=True),
            sa.Column('email_content', sa.Text(), nullable=True),
            sa.Column('received_date', sa.DateTime(timezone=True), nullable=True),
            sa.Column('priority', sa.String(length=50), nullable=True),
            sa.Column('category', sa.String(length=50), nullable=True),
            sa.Column('summary', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )
    else:
        # Add column only if missing
        cols = {c['name'] for c in inspector.get_columns('email_analytics')}
        if 'email_content' not in cols:
            op.add_column('email_analytics', sa.Column('email_content', sa.Text(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()
    if 'email_analytics' in tables:
        cols = {c['name'] for c in inspector.get_columns('email_analytics')}
        if 'email_content' in cols:
            op.drop_column('email_analytics', 'email_content')
