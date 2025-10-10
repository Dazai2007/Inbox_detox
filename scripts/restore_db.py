import os
import sys
import shutil
from pathlib import Path

from app.core.config import settings


def restore_sqlite(backup_file: Path, db_url: str):
    dest_path = Path(db_url.replace("sqlite:///", "")).resolve()
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(backup_file, dest_path)
    print(f"SQLite restore completed: {backup_file} -> {dest_path}")


def restore_postgres(backup_file: Path, db_url: str):
    import subprocess
    try:
        subprocess.check_call(["psql", db_url, "-f", str(backup_file)])
        print("Postgres restore completed.")
    except FileNotFoundError:
        print("psql not found. Install PostgreSQL client tools and ensure psql is in PATH.")
        sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"psql failed: {e}")
        sys.exit(1)


def main():
    if len(sys.argv) < 2:
        print("Usage: restore_db.py <backup_file>")
        sys.exit(2)
    backup_file = Path(sys.argv[1]).resolve()
    if not backup_file.exists():
        print(f"Backup file not found: {backup_file}")
        sys.exit(2)
    db_url = settings.database_url
    if backup_file.suffix == ".bak" and db_url.startswith("sqlite"):
        restore_sqlite(backup_file, db_url)
    elif backup_file.suffix == ".sql" and db_url.startswith("postgres"):
        restore_postgres(backup_file, db_url)
    else:
        print("Backup/database mismatch or unsupported format.")
        sys.exit(2)


if __name__ == "__main__":
    main()
