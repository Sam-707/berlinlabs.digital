#!/bin/bash

# Apply the trigger guard fix to allow owners to edit menu items
# Usage: ./apply-migration.sh YOUR_DATABASE_PASSWORD

PROJECT_REF="xsrgevikbianpzgopcio"
DB_PASSWORD="$1"
MIGRATION_FILE="migrations/rls-menu-items/005_allow_owner_full_menu_edit.sql"

if [ -z "$DB_PASSWORD" ]; then
    echo "Usage: $0 YOUR_DATABASE_PASSWORD"
    echo ""
    echo "Get your password from: https://supabase.com/dashboard/project/$PROJECT_REF/settings/database"
    echo ""
    echo "Or run the SQL manually in: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
    echo ""
    echo "SQL to run:"
    echo "----------------------------------------"
    cat "$MIGRATION_FILE"
    echo "----------------------------------------"
    exit 1
fi

echo "Applying migration to fix menu item edit permissions..."
echo ""

psql "postgresql://postgres.$PROJECT_REF:$DB_PASSWORD@db.$PROJECT_REF.supabase.co:5432/postgres" < "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo "Now try adding/editing menu items in the owner interface."
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    echo "You can also run the SQL manually in the Supabase SQL Editor:"
    echo "https://supabase.com/dashboard/project/$PROJECT_REF/sql"
fi
