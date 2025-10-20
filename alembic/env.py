import os
from logging.config import fileConfig
import logging
import sys
from sqlalchemy import engine_from_config, pool
from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config
logger = logging.getLogger("alembic.env")

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)
    # Diagnostics: which ini file and initial URL
    try:
        ini_path = os.path.abspath(config.config_file_name)
        ini_url = config.get_main_option("sqlalchemy.url", default="<unset>")
        logger.info(f"[diag] Loaded alembic.ini: {ini_path}")
        # Mask credentials in URL for logging
        masked = ini_url
        if isinstance(masked, str) and "://" in masked:
            try:
                # redact user:pass@
                prefix, rest = masked.split("://", 1)
                if "@" in rest and ":" in rest.split("@", 1)[0]:
                    auth, host = rest.split("@", 1)
                    masked = f"{prefix}://***:***@{host}"
            except Exception:
                pass
        logger.info(f"[diag] ini sqlalchemy.url: {masked}")
    except Exception:
        logger.info("[diag] Could not log ini diagnostics")

# Ensure project root is on sys.path so 'app' package can be imported when Alembic runs
try:
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if project_root not in sys.path:
        sys.path.insert(0, project_root)
    logger.info(f"[diag] sys.path[0]: {sys.path[0]}")
except Exception:
    pass

# Add your model's MetaData object here
# for 'autogenerate' support
from app.database.database import Base
from app import models as _models  # noqa: F401 - ensure model modules are imported
from app.models.models import *  # noqa: F401,F403

target_metadata = Base.metadata

# Override DB URL from env if provided
DB_URL = os.getenv("DATABASE_URL") or os.getenv("DB_URL")
if DB_URL:
    config.set_main_option("sqlalchemy.url", DB_URL)
    try:
        logger.info("[diag] sqlalchemy.url overridden from environment (DATABASE_URL/DB_URL)")
    except Exception:
        pass


def run_migrations_offline():
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
