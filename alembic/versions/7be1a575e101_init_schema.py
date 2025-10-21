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
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    # Ensure 'users' table exists on fresh databases
    if 'users' not in tables:
        op.create_table(
            'users',
            sa.Column('id', sa.Integer(), primary_key=True, index=True),
            sa.Column('email', sa.String(length=255), nullable=False, unique=True, index=True),
            # Legacy password field; canonical password_hash will be added below if missing
            sa.Column('hashed_password', sa.String(length=255), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=False, server_default=sa.text('1')),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now()),
        )

    # subscriptions table adjustments
    if 'subscriptions' in inspector.get_table_names():
        subs_cols = {c['name'] for c in inspector.get_columns('subscriptions')}
        with op.batch_alter_table('subscriptions', schema=None) as batch_op:
            if 'stripe_customer_id' not in subs_cols:
                batch_op.add_column(sa.Column('stripe_customer_id', sa.String(length=255), nullable=True))
            if 'plan_type' not in subs_cols:
                batch_op.add_column(sa.Column('plan_type', sa.String(length=50), nullable=True))
            if 'tier' in subs_cols:
                batch_op.drop_column('tier')

    # users table adjustments
    if 'users' in inspector.get_table_names():
        user_cols = {c['name'] for c in inspector.get_columns('users')}
        # Add columns if they don't exist
        if 'password_hash' not in user_cols:
            op.add_column('users', sa.Column('password_hash', sa.String(length=255), nullable=True))
        if 'is_verified' not in user_cols:
            op.add_column('users', sa.Column('is_verified', sa.Boolean(), nullable=False, server_default=sa.text('0')))
            # Drop server_default after backfilling existing rows as needed
            with op.batch_alter_table('users', schema=None) as batch_op:
                batch_op.alter_column('is_verified', server_default=None)
        if 'subscription_status' not in user_cols:
            # Ensure enum type exists on Postgres with lowercase labels matching models
            bind = op.get_bind()
            if bind.dialect.name == 'postgresql':
                op.execute(
                    """
                    DO $$
                    BEGIN
                        IF NOT EXISTS (
                            SELECT 1 FROM pg_type t WHERE t.typname = 'subscriptionstatus'
                        ) THEN
                            CREATE TYPE subscriptionstatus AS ENUM ('free','pro','business');
                        END IF;
                    END
                    $$;
                    """
                )
            # Add column using existing enum (or string on other dialects)
            enum_type = sa.Enum('free', 'pro', 'business', name='subscriptionstatus', create_type=False)
            op.add_column('users', sa.Column('subscription_status', enum_type, nullable=False, server_default='free'))
            with op.batch_alter_table('users', schema=None) as batch_op:
                batch_op.alter_column('subscription_status', server_default=None)
        if 'gmail_connected' not in user_cols:
            op.add_column('users', sa.Column('gmail_connected', sa.Boolean(), nullable=False, server_default=sa.text('0')))
            with op.batch_alter_table('users', schema=None) as batch_op:
                batch_op.alter_column('gmail_connected', server_default=None)
        if 'gmail_refresh_token' not in user_cols:
            op.add_column('users', sa.Column('gmail_refresh_token', sa.String(length=1024), nullable=True))

        # Make hashed_password nullable if column exists and currently NOT NULL
        if 'hashed_password' in user_cols:
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
