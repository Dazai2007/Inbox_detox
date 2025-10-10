import os
import sys
import shutil
from datetime import datetime
from pathlib import Path

from app.core.config import settings


def ensure_dir(p: Path):
    p.mkdir(parents=True, exist_ok=True)


def backup_sqlite(db_url: str, out_dir: Path):
    # sqlite:///./inbox_detox.db
    path = db_url.replace("sqlite:///", "")
    src = Path(path).resolve()
    if not src.exists():
        print(f"SQLite database file not found: {src}")
        sys.exit(1)
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    dst = out_dir / f"sqlite-{src.name}-{ts}.bak"
    shutil.copy2(src, dst)
    print(f"SQLite backup created: {dst}")


def backup_postgres(db_url: str, out_dir: Path):
    # Expect pg_dump in PATH
    ts = datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
    dump_path = out_dir / f"pg-dump-{ts}.sql"
    import subprocess
    try:
        subprocess.check_call(["pg_dump", db_url, "-F", "p", "-f", str(dump_path)])
        print(f"Postgres backup created: {dump_path}")
    except FileNotFoundError:
        print("pg_dump not found. Install PostgreSQL client tools and ensure pg_dump is in PATH.")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"pg_dump failed: {e}")
        sys.exit(1)


def prune_backups(out_dir: Path, retention: int):
    backups = sorted(out_dir.glob("*.bak")) + sorted(out_dir.glob("*.sql"))
    if len(backups) > retention:
        for p in backups[:-retention]:
            try:
                p.unlink()
            except Exception as e:
                print(f"Warning: failed to delete old backup {p}: {e}")


def main():
    out_dir = Path(settings.backup_dir)
    ensure_dir(out_dir)
    db_url = settings.database_url
    if db_url.startswith("sqlite"):
        backup_sqlite(db_url, out_dir)
    elif db_url.startswith("postgres"):  # postgres:// or postgresql://
        backup_postgres(db_url, out_dir)
    else:
        print(f"Unsupported DATABASE_URL scheme: {db_url}")
        sys.exit(2)
    prune_backups(out_dir, settings.backup_retention)


if __name__ == "__main__":
    main()
