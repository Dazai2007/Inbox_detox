Alembic migrations
===================

Commands (PowerShell):

1) Set database URL (Postgres example):

    $env:DATABASE_URL = "postgresql+psycopg2://inbox:inbox@localhost:5432/inbox_detox"

2) Initialize first migration (autogenerate):

    python -m alembic revision --autogenerate -m "init schema"

3) Apply migrations:

    python -m alembic upgrade head

4) Downgrade (optional):

    python -m alembic downgrade -1

Note: env.py reads DATABASE_URL/DB_URL if set, otherwise falls back to alembic.ini.
