#!/bin/bash
# Supabase Migration Runner
# Usage: ./migrate.sh [local|remote]

set -e

MODE=${1:-local}

if [ "$MODE" = "local" ]; then
  echo "Running migrations on local Supabase..."
  supabase db reset
elif [ "$MODE" = "remote" ]; then
  echo "Running migrations on remote Supabase..."
  echo "Make sure you have linked your project: supabase link --project-ref <your-project-ref>"
  supabase db push
else
  echo "Usage: ./migrate.sh [local|remote]"
  exit 1
fi

echo "Migrations completed!"