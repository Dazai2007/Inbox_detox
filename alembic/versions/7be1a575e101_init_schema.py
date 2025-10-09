"""init schema

Revision ID: 7be1a575e101
Revises: 'None'
Create Date: 2025-10-09 23:11:31.218632

"""

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7be1a575e101'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    # Use batch_alter_table for SQLite compatibility when dropping/altering columns
    with op.batch_alter_table('subscriptions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('stripe_customer_id', sa.String(length=255), nullable=True))
        batch_op.add_column(sa.Column('plan_type', sa.String(length=50), nullable=True))
        batch_op.drop_column('tier')

    # Adding columns is fine, but altering NULLability requires batch in SQLite
    op.add_column('users', sa.Column('password_hash', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False))
    op.add_column('users', sa.Column('subscription_status', sa.Enum('FREE', 'PRO', 'BUSINESS', name='subscriptionstatus'), nullable=False))
    op.add_column('users', sa.Column('gmail_connected', sa.Boolean(), nullable=False))
    op.add_column('users', sa.Column('gmail_refresh_token', sa.String(length=1024), nullable=True))

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('hashed_password',
                              existing_type=sa.VARCHAR(length=255),
                              nullable=True)


def downgrade() -> None:
    # Recreate previous NOT NULL constraint via batch
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.alter_column('hashed_password',
                              existing_type=sa.VARCHAR(length=255),
                              nullable=False)

    op.drop_column('users', 'gmail_refresh_token')
    op.drop_column('users', 'gmail_connected')
    op.drop_column('users', 'subscription_status')
    op.drop_column('users', 'is_verified')
    op.drop_column('users', 'password_hash')

    with op.batch_alter_table('subscriptions', schema=None) as batch_op:
        batch_op.add_column(sa.Column('tier', sa.VARCHAR(length=7), nullable=False))
        batch_op.drop_column('plan_type')
        batch_op.drop_column('stripe_customer_id')
