#!/bin/bash

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "Supabase CLI is not installed. Please install it first:"
    echo "https://supabase.com/docs/guides/cli/getting-started"
    exit 1
fi

# Check if .env.local exists
if [ ! -f ../.env.local ]; then
    echo "Error: .env.local file not found in the parent directory."
    echo "Please create a .env.local file with your Supabase credentials."
    exit 1
fi

# Load environment variables
source ../.env.local

# Check if required environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set in .env.local"
    exit 1
fi

# Extract project reference from URL
PROJECT_REF=$(echo $NEXT_PUBLIC_SUPABASE_URL | sed -E 's/.*\/([^\/]+)$/\1/')

echo "Applying migration to Supabase project: $PROJECT_REF"

# Apply the migration using Supabase CLI
supabase db push --db-url "postgresql://postgres:postgres@db.$PROJECT_REF.supabase.co:5432/postgres" --linked

echo "Migration applied successfully!" 