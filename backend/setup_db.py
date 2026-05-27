"""
A comprehensive script for setting up PostgreSQL database with pgvector support.

Usage:
    python setup_db.py
"""

import subprocess
import sys
from typing import Optional
import os


# Database configuration
DB_NAME = "tendersafi"
DB_USER = "app"
DB_PASSWORD = "app"
DB_HOST = "localhost"
DB_PORT = 5432


def run_command(cmd: list) -> tuple[str, str, int]:
    """Execute a shell command and return output.

    Args:
        cmd: List of command arguments

    Returns:
        Tuple of (stdout, stderr, return_code)
    """
    try:
        result = subprocess.run(
            cmd,
            check=False,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
        )
        return result.stdout, result.stderr, result.returncode
    except Exception as e:
        print(f"Error executing command: {e}", file=sys.stderr)  # noqa: T201
        return "", str(e), 1


def run_psql_command(command: str, dbname: Optional[str] = None, user: str = "postgres") -> bool:
    """Execute PostgreSQL commands.

    Args:
        command: The SQL command to execute
        dbname: Optional database name to connect to
        user: PostgreSQL user to connect as (default: postgres)

    Returns:
        True if successful, False otherwise
    """
    cmd = ["sudo", "-u", "postgres", "psql", "-U", user]

    if dbname:
        cmd.extend(["-d", dbname])

    cmd.extend(["-c", command])

    stdout, stderr, returncode = run_command(cmd)

    if returncode != 0:
        print(f"Error executing command: {stderr.strip()}", file=sys.stderr)  # noqa: T201
        return False

    return True


def database_exists(dbname: str) -> bool:
    """Check if a database exists.

    Args:
        dbname: Database name to check

    Returns:
        True if database exists, False otherwise
    """
    stdout, stderr, returncode = run_command(
        ["sudo", "-u", "postgres", "psql", "-U", "postgres", "-lqt"]
    )

    if returncode != 0:
        print(f"Error checking database: {stderr.strip()}", file=sys.stderr)  # noqa: T201
        return False

    databases = [line.split("|")[0].strip() for line in stdout.splitlines() if line.strip()]
    return dbname in databases


def drop_database(dbname: str) -> bool:
    """Drop the database, terminating active connections first.
    
    Args:
        dbname: Database name to drop
        
    Returns:
        True if successful, False otherwise
    """
    print(f"   Terminating active connections to '{dbname}'...")  # noqa: T201
    # Terminate all active connections to the database so we can drop it safely
    terminate_cmd = f"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '{dbname}';"
    run_psql_command(terminate_cmd)

    print(f"   Dropping database '{dbname}'...")  # noqa: T201
    return run_psql_command(f"DROP DATABASE IF EXISTS {dbname};")


def user_exists(username: str) -> bool:
    """Check if a PostgreSQL user/role exists.

    Args:
        username: Username to check

    Returns:
        True if user exists, False otherwise
    """
    stdout, stderr, returncode = run_command(
        ["sudo", "-u", "postgres", "psql", "-U", "postgres", "-tAc",
         f"SELECT 1 FROM pg_roles WHERE rolname='{username}'"]
    )

    if returncode != 0:
        return False

    return "1" in stdout


def extension_exists(dbname: str, extension: str) -> bool:
    """Check if a PostgreSQL extension exists.

    Args:
        dbname: Database name
        extension: Extension name to check

    Returns:
        True if extension exists, False otherwise
    """
    stdout, stderr, returncode = run_command(
        ["sudo", "-u", "postgres", "psql", "-U", "postgres", "-d", dbname,
         "-tAc", f"SELECT 1 FROM pg_extension WHERE extname='{extension}'"]
    )

    if returncode != 0:
        return False

    return "1" in stdout


def check_postgresql_installed() -> bool:
    """Check if PostgreSQL is installed.

    Returns:
        True if PostgreSQL is installed, False otherwise
    """
    _, _, returncode = run_command(["which", "psql"])
    return returncode == 0


def main() -> None:
    """Set up the PostgreSQL database with pgvector support."""
    print("\n" + "="*70)  # noqa: T201
    print("PostgreSQL Database Setup Script")  # noqa: T201
    print("="*70 + "\n")  # noqa: T201

    # ─────────────────────────────────────────────────────────────
    # STEP 1: Check PostgreSQL Installation
    # ─────────────────────────────────────────────────────────────
    print("📋 Step 1: Checking PostgreSQL installation...")  # noqa: T201

    if not check_postgresql_installed():
        print("❌ PostgreSQL is not installed. Please install it first.", file=sys.stderr)  # noqa: T201
        print("   Ubuntu: sudo apt-get install postgresql postgresql-contrib")  # noqa: T201
        sys.exit(1)

    print("✅ PostgreSQL is installed\n")  # noqa: T201

    # ─────────────────────────────────────────────────────────────
    # STEP 2: Create or Update User
    # ─────────────────────────────────────────────────────────────
    print(f"👤 Step 2: Setting up database user '{DB_USER}'...")  # noqa: T201

    if user_exists(DB_USER):
        print(f"   User '{DB_USER}' already exists, updating privileges...")  # noqa: T201
        if run_psql_command(
            f"ALTER USER {DB_USER} WITH SUPERUSER CREATEDB CREATEROLE LOGIN PASSWORD '{DB_PASSWORD}';"
        ):
            print(f"✅ User '{DB_USER}' privileges updated\n")  # noqa: T201
        else:
            print(f"❌ Failed to update user '{DB_USER}'", file=sys.stderr)  # noqa: T201
            sys.exit(1)
    else:
        print(f"   Creating new user '{DB_USER}'...")  # noqa: T201
        if run_psql_command(
            f"CREATE USER {DB_USER} WITH SUPERUSER CREATEDB CREATEROLE LOGIN PASSWORD '{DB_PASSWORD}';"
        ):
            print(f"✅ User '{DB_USER}' created successfully\n")  # noqa: T201
        else:
            print(f"❌ Failed to create user '{DB_USER}'", file=sys.stderr)  # noqa: T201
            sys.exit(1)

    # ─────────────────────────────────────────────────────────────
    # STEP 3: Create Database
    # ─────────────────────────────────────────────────────────────
    print(f"🗄️  Step 3: Setting up database '{DB_NAME}'...")  # noqa: T201

    create_db = True
    if database_exists(DB_NAME):
        print(f"\n   ⚠️  Database '{DB_NAME}' already exists.")  # noqa: T201
        choice = input("   Do you want to delete it and start fresh? [y/N]: ").strip().lower()
        
        if choice == 'y':
            if drop_database(DB_NAME):
                print(f"   ✅ Database '{DB_NAME}' dropped successfully")  # noqa: T201
            else:
                print(f"   ❌ Failed to drop database '{DB_NAME}'", file=sys.stderr)  # noqa: T201
                sys.exit(1)
        else:
            print(f"   Keeping existing database '{DB_NAME}'")  # noqa: T201
            create_db = False

    if create_db:
        print(f"   Creating database '{DB_NAME}'...")  # noqa: T201
        if run_psql_command(f"CREATE DATABASE {DB_NAME} OWNER {DB_USER};"):
            print(f"✅ Database '{DB_NAME}' created successfully")  # noqa: T201
        else:
            print(f"❌ Failed to create database '{DB_NAME}'", file=sys.stderr)  # noqa: T201
            sys.exit(1)

    # Set timezone to UTC
    if run_psql_command(f"ALTER DATABASE {DB_NAME} SET timezone TO 'UTC';", dbname=DB_NAME):
        print("✅ Timezone set to UTC")  # noqa: T201
    else:
        print("⚠️  Warning: Could not set timezone")  # noqa: T201

    # Grant privileges
    if run_psql_command(f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER};"):
        print("✅ Privileges granted\n")  # noqa: T201
    else:
        print("⚠️  Warning: Could not grant privileges\n")  # noqa: T201

    # ─────────────────────────────────────────────────────────────
    # STEP 4: Setup Schemas
    # ─────────────────────────────────────────────────────────────
    print("📦 Step 4: Setting up schemas...")  # noqa: T201

    schemas = ["public"]  # Add more schemas as needed

    for schema in schemas:
        if run_psql_command(f"CREATE SCHEMA IF NOT EXISTS {schema};", dbname=DB_NAME):
            print(f"   ✅ Schema '{schema}' ready")  # noqa: T201
        else:
            print(f"   ⚠️  Could not create schema '{schema}'")  # noqa: T201

    print()  # noqa: T201

    # ─────────────────────────────────────────────────────────────
    # STEP 5: Verify Setup
    # ─────────────────────────────────────────────────────────────
    print("✅ Step 5: Verifying setup...")  # noqa: T201

    # Test connection
    stdout, stderr, returncode = run_command(
        ["psql", "-U", DB_USER, "-d", DB_NAME, "-h", DB_HOST, "-c", "SELECT version();"]
    )

    if returncode == 0:
        print("✅ Connection test successful\n")  # noqa: T201
    else:
        print("⚠️  Could not verify connection")  # noqa: T201
        print(f"   Error: {stderr}")  # noqa: T201

    # ─────────────────────────────────────────────────────────────
    # Summary
    # ─────────────────────────────────────────────────────────────
    print("="*70)  # noqa: T201
    print("Database Setup Summary")  # noqa: T201
    print("="*70)  # noqa: T201
    print(f"Database Name: {DB_NAME}")  # noqa: T201
    print(f"Database User: {DB_USER}")  # noqa: T201
    print(f"Database Host: {DB_HOST}")  # noqa: T201
    print(f"Database Port: {DB_PORT}")  # noqa: T201
    print("\n📝 Environment Variables (.env):")  # noqa: T201
    print(f"   DATABASE_NAME={DB_NAME}")  # noqa: T201
    print(f"   DATABASE_USER={DB_USER}")  # noqa: T201
    print(f"   DATABASE_PASSWORD={DB_PASSWORD}")  # noqa: T201
    print(f"   DATABASE_HOST={DB_HOST}")  # noqa: T201
    print(f"   DATABASE_PORT={DB_PORT}")  # noqa: T201
    print("\n" + "="*70 + "\n")  # noqa: T201


if __name__ == "__main__":
    main()