#!/bin/bash
# Supabase Deployment Script
# Run this script to deploy Edge Functions and apply migrations

set -e

echo "🚀 Supabase Deployment Script"
echo "=============================="

# Check for required environment variable
if [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
    echo "❌ SUPABASE_ACCESS_TOKEN is required"
    echo ""
    echo "Get your token from: https://supabase.com/dashboard/account/tokens"
    echo "Then run: export SUPABASE_ACCESS_TOKEN=your-token"
    exit 1
fi

PROJECT_REF="rgehleqcubtmcwyipyvi"

echo ""
echo "📦 Deploying Edge Functions..."
echo "------------------------------"

# Deploy tray function
echo "  → Deploying 'tray' function..."
npx supabase functions deploy tray --project-ref $PROJECT_REF

# Deploy beauty-assistant function
echo "  → Deploying 'beauty-assistant' function..."
npx supabase functions deploy beauty-assistant --project-ref $PROJECT_REF

# Deploy bulk-product-upload function
echo "  → Deploying 'bulk-product-upload' function..."
npx supabase functions deploy bulk-product-upload --project-ref $PROJECT_REF

# Deploy capture-lead function
echo "  → Deploying 'capture-lead' function..."
npx supabase functions deploy capture-lead --project-ref $PROJECT_REF

echo ""
echo "✅ Edge Functions deployed successfully!"
echo ""
echo "📝 Database Migrations"
echo "----------------------"
echo "To apply the database migrations, run this SQL in the Supabase Dashboard:"
echo ""
echo "  1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo ""
echo "  2. Digital Tray System:"
echo "     Open: supabase/migrations/20260210000001_digital_tray_system.sql"
echo ""
echo "  3. Customer Leads CRM:"
echo "     Open: supabase/migrations/20260210000002_customer_leads.sql"
echo ""
echo "  4. Copy and paste each SQL file into the editor and click 'Run'"
echo ""
echo "🎉 Deployment complete!"
