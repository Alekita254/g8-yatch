"""
Prepare the Django PostgreSQL database configured in backend/.env.

Usage:
    python setup_db.py

This script does not create the Docker container. Start Postgres first with:
    docker compose up -d app-postgres
"""

import os
import subprocess
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

import psycopg2
from psycopg2 import OperationalError, errors


BASE_DIR = Path(__file__).resolve().parent
ENV_FILE = BASE_DIR / ".env"
DEFAULT_DATABASE_URL = "postgres://g8_yacht:g8_yacht_dev_password@127.0.0.1:5434/g8_yacht"


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


def database_url() -> str:
    load_env_file(ENV_FILE)
    return os.environ.get("DATABASE_URL", DEFAULT_DATABASE_URL)


def parse_database_url(url: str) -> dict:
    parsed = urlparse(url)
    return {
        "dbname": parsed.path.lstrip("/"),
        "user": parsed.username,
        "password": parsed.password,
        "host": parsed.hostname or "127.0.0.1",
        "port": parsed.port or 5432,
    }


def connect_with_retry(config: dict, attempts: int = 20, delay: float = 1.0):
    last_error = None

    for attempt in range(1, attempts + 1):
        try:
            return psycopg2.connect(**config)
        except OperationalError as exc:
            last_error = exc
            print(f"Waiting for PostgreSQL... attempt {attempt}/{attempts}")  # noqa: T201
            time.sleep(delay)

    raise last_error


def run_manage_py(*args: str) -> None:
    command = [sys.executable, "manage.py", *args]
    result = subprocess.run(command, cwd=BASE_DIR, check=False)
    if result.returncode != 0:
        raise SystemExit(result.returncode)


def enable_optional_extension(connection, extension: str) -> None:
    try:
        with connection.cursor() as cursor:
            cursor.execute(f'CREATE EXTENSION IF NOT EXISTS "{extension}";')
        connection.commit()
        print(f"Extension ready: {extension}")  # noqa: T201
    except errors.FeatureNotSupported:
        connection.rollback()
        print(f"Extension skipped, not supported by this Postgres image: {extension}")  # noqa: T201
    except errors.UndefinedFile:
        connection.rollback()
        print(f"Extension skipped, not installed in this Postgres image: {extension}")  # noqa: T201


def main() -> None:
    url = database_url()
    config = parse_database_url(url)

    print("PostgreSQL setup for Django")  # noqa: T201
    print(f"Database: {config['dbname']}")  # noqa: T201
    print(f"User: {config['user']}")  # noqa: T201
    print(f"Host: {config['host']}")  # noqa: T201
    print(f"Port: {config['port']}")  # noqa: T201

    connection = connect_with_retry(config)
    try:
        print("Connection OK")  # noqa: T201
        enable_optional_extension(connection, "vector")
    finally:
        connection.close()

    print("Running Django migrations...")  # noqa: T201
    run_manage_py("migrate")

    print("Database setup complete")  # noqa: T201
    print("Run the backend with: python manage.py runserver 8000")  # noqa: T201


if __name__ == "__main__":
    main()
