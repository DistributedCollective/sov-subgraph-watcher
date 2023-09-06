#!/usr/bin/env bash
set -e

cleanup() {
    docker-compose -f docker-compose.dev.yml stop
    trap '' EXIT INT TERM
    exit $err
}

trap cleanup SIGINT EXIT

# Make sure docker-compose is installed
if ! hash docker-compose 2>/dev/null; then
  echo -e '\033[0;31mPlease install docker-compose\033[0m'
  exit 1
fi

if [ -z "$(docker network ls -qf name=^entropic$)" ]; then
  echo "Creating network"
  docker network create entropic >/dev/null
fi

COMPOSE_HTTP_TIMEOUT=120 docker-compose -f docker-compose.dev.yml up -d

if [[ ! -f .env && -f .env.example ]]
then
  cp .env.example .env
fi

if [[ -f .env ]]
then
  set -o allexport; source .env; set +o allexport
else
  echo -e '\033[0;31mPlease create a .env file\033[0m'
  exit 1
fi

export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

npx prisma db push --accept-data-loss
yarn start:dev
