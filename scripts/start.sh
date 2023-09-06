#!/usr/bin/env bash
set -e

export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}"

echo $DATABASE_URL

ls -la

yarn prisma migrate deploy || yarn prisma migrate reset --force
yarn start
