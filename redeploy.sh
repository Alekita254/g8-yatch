#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
cd "$SCRIPT_DIR"

if docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="docker compose"
elif sudo docker compose version >/dev/null 2>&1; then
  DOCKER_COMPOSE="sudo docker compose"
else
  echo "ERROR: docker compose is not available. Install Docker or run this as a user with docker access." >&2
  exit 1
fi

ENV_FILE=".env.production"
COMPOSE_FILE="docker-compose.prod.yml"

echo "==> Rebuilding and restarting services"
$DOCKER_COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build

echo "==> Running backend migrations"
$DOCKER_COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T backend python manage.py migrate

echo "==> Collecting static files"
$DOCKER_COMPOSE --env-file "$ENV_FILE" -f "$COMPOSE_FILE" exec -T backend python manage.py collectstatic --noinput

echo "==> Deployment complete. Services are online."
