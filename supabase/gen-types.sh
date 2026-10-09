#!/bin/bash
# Generate TypeScript types from Supabase schema
# Run this after schema changes to keep types in sync

set -e

echo "Generating TypeScript types from Supabase..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI not found. Installing..."
    npm i -g supabase
fi

# Generate types
supabase gen types typescript --project-id ${SUPABASE_PROJECT_REF:-your-project-ref} > src/types/database.generated.ts

echo "Types generated at src/types/database.generated.ts"

# Optional: Also generate local types if using local Supabase
# supabase gen types typescript --local > src/types/database.local.ts