"""migrate subscriptionstatus enum to lowercase values on Postgres

Revision ID: 9abcde123456
Revises: 8f2c1d0a1abc
Create Date: 2025-10-21 14:45:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '9abcde123456'
down_revision: Union[str, None] = '8f2c1d0a1abc'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != 'postgresql':
        # Only needed for Postgres enum semantics
        return

    inspector = sa.inspect(bind)
    if 'users' not in inspector.get_table_names():
        return
    user_cols = {col['name'] for col in inspector.get_columns('users')}
    if 'subscription_status' not in user_cols:
        # Nothing to migrate if the column never existed
        return

    # 1) Create new enum type with lowercase labels if missing
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_type t WHERE t.typname = 'subscriptionstatus_new'
            ) THEN
                CREATE TYPE subscriptionstatus_new AS ENUM ('free','pro','business');
            END IF;
        END
        $$;
        """
    )

    # 2) Cast users.subscription_status to the new enum via lower(text)
    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN subscription_status
        TYPE subscriptionstatus_new
        USING lower(subscription_status::text)::subscriptionstatus_new;
        """
    )

    # 3) Drop old enum type and rename new to original name
    op.execute("DROP TYPE IF EXISTS subscriptionstatus;")
    op.execute("ALTER TYPE subscriptionstatus_new RENAME TO subscriptionstatus;")


def downgrade() -> None:
    bind = op.get_bind()
    if bind.dialect.name != 'postgresql':
        return

    inspector = sa.inspect(bind)
    if 'users' not in inspector.get_table_names():
        return
    user_cols = {col['name'] for col in inspector.get_columns('users')}
    if 'subscription_status' not in user_cols:
        return

    # Reverse: create uppercase enum, cast up, drop lowercase, rename back
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_type t WHERE t.typname = 'subscriptionstatus_old'
            ) THEN
                CREATE TYPE subscriptionstatus_old AS ENUM ('FREE','PRO','BUSINESS');
            END IF;
        END
        $$;
        """
    )

    op.execute(
        """
        ALTER TABLE users
        ALTER COLUMN subscription_status
        TYPE subscriptionstatus_old
        USING upper(subscription_status::text)::subscriptionstatus_old;
        """
    )

    op.execute("DROP TYPE IF EXISTS subscriptionstatus;")
    op.execute("ALTER TYPE subscriptionstatus_old RENAME TO subscriptionstatus;")
