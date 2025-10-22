"""ensure all expected users columns exist

Revision ID: d5e6f7a8b9c0
Revises: c4d5e6f7a8b9
Create Date: 2025-10-22 20:35:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision: str = "d5e6f7a8b9c0"
down_revision: Union[str, None] = "c4d5e6f7a8b9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


BOOLEAN_DEFAULT_TRUE = sa.Boolean()
BOOLEAN_DEFAULT_FALSE = sa.Boolean()


def _ensure_enum(bind, type_name: str, labels: tuple[str, ...]) -> None:
    if bind.dialect.name != "postgresql":
        return
    labels_literal = ", ".join(f"'{label}'" for label in labels)
    op.execute(
        f"""
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1 FROM pg_type t WHERE t.typname = '{type_name}'
            ) THEN
                CREATE TYPE {type_name} AS ENUM ({labels_literal});
            END IF;
        END
        $$;
        """
    )


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {col["name"] for col in inspector.get_columns("users")}

    if "hashed_password" not in existing_columns:
        op.add_column("users", sa.Column("hashed_password", sa.String(length=255), nullable=True))

    if "full_name" not in existing_columns:
        op.add_column("users", sa.Column("full_name", sa.String(length=255), nullable=True))

    if "is_active" not in existing_columns:
        op.add_column(
            "users",
            sa.Column("is_active", BOOLEAN_DEFAULT_TRUE, nullable=False, server_default=sa.true()),
        )

    if "is_admin" not in existing_columns:
        op.add_column(
            "users",
            sa.Column("is_admin", BOOLEAN_DEFAULT_FALSE, nullable=False, server_default=sa.false()),
        )

    if "is_verified" not in existing_columns:
        op.add_column(
            "users",
            sa.Column("is_verified", BOOLEAN_DEFAULT_FALSE, nullable=False, server_default=sa.false()),
        )

    if "subscription_tier" not in existing_columns:
        _ensure_enum(bind, "subscriptiontier", ("free", "basic", "premium"))
        op.add_column(
            "users",
            sa.Column(
                "subscription_tier",
                sa.Enum("free", "basic", "premium", name="subscriptiontier", create_type=False),
                nullable=True,
                server_default="free",
            ),
        )

    if "subscription_status" not in existing_columns:
        _ensure_enum(bind, "subscriptionstatus", ("free", "pro", "business"))
        op.add_column(
            "users",
            sa.Column(
                "subscription_status",
                sa.Enum("free", "pro", "business", name="subscriptionstatus", create_type=False),
                nullable=False,
                server_default="free",
            ),
        )

    if "gmail_connected" not in existing_columns:
        op.add_column(
            "users",
            sa.Column("gmail_connected", BOOLEAN_DEFAULT_FALSE, nullable=False, server_default=sa.false()),
        )

    if "gmail_refresh_token" not in existing_columns:
        op.add_column("users", sa.Column("gmail_refresh_token", sa.String(length=1024), nullable=True))

    if "gmail_access_token" not in existing_columns:
        op.add_column("users", sa.Column("gmail_access_token", sa.String(length=2048), nullable=True))

    if "gmail_token_expiry" not in existing_columns:
        op.add_column(
            "users",
            sa.Column("gmail_token_expiry", sa.DateTime(timezone=True), nullable=True),
        )

    if "stripe_customer_id" not in existing_columns:
        op.add_column("users", sa.Column("stripe_customer_id", sa.String(length=255), nullable=True))

    if "timezone" not in existing_columns:
        op.add_column(
            "users",
            sa.Column("timezone", sa.String(length=64), nullable=False, server_default="UTC"),
        )

    if "created_at" not in existing_columns:
        op.add_column(
            "users",
            sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        )

    if "updated_at" not in existing_columns:
        op.add_column(
            "users",
            sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        )

    # Backfill sensible defaults where nulls might exist after column creation
    op.execute(text("UPDATE users SET is_active = TRUE WHERE is_active IS NULL"))
    op.execute(text("UPDATE users SET is_admin = FALSE WHERE is_admin IS NULL"))
    op.execute(text("UPDATE users SET is_verified = FALSE WHERE is_verified IS NULL"))
    op.execute(text("UPDATE users SET subscription_tier = 'free' WHERE subscription_tier IS NULL"))
    op.execute(text("UPDATE users SET subscription_status = 'free' WHERE subscription_status IS NULL"))
    op.execute(text("UPDATE users SET gmail_connected = FALSE WHERE gmail_connected IS NULL"))
    op.execute(text("UPDATE users SET timezone = 'UTC' WHERE timezone IS NULL"))
    op.execute(
        text(
            "UPDATE users SET created_at = timezone('utc', now()) "
            "WHERE created_at IS NULL"
        )
    )


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if "users" not in inspector.get_table_names():
        return

    existing_columns = {col["name"] for col in inspector.get_columns("users")}

    drop_order = [
        "updated_at",
        "created_at",
        "timezone",
        "stripe_customer_id",
        "gmail_token_expiry",
        "gmail_access_token",
        "gmail_refresh_token",
        "gmail_connected",
        "subscription_status",
        "subscription_tier",
        "is_verified",
        "is_admin",
        "is_active",
        "full_name",
    ]

    with op.batch_alter_table("users") as batch_op:
        for column_name in drop_order:
            if column_name in existing_columns:
                batch_op.drop_column(column_name)
