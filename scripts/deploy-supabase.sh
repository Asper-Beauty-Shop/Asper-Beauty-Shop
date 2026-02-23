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

# Deploy Dr. Rose omnichannel gateway
echo "  → Deploying 'dr-rose-gateway' function..."
npx supabase functions deploy dr-rose-gateway --project-ref $PROJECT_REF

# Deploy Meta (IG/FB Messenger) webhook
echo "  → Deploying 'meta-webhook' function..."
npx supabase functions deploy meta-webhook --project-ref $PROJECT_REF

# Deploy WhatsApp webhook
echo "  → Deploying 'whatsapp-webhook' function..."
npx supabase functions deploy whatsapp-webhook --project-ref $PROJECT_REF

# Deploy tray function
echo "  → Deploying 'tray' function..."
npx supabase functions deploy tray --project-ref $PROJECT_REF

# Deploy beauty-assistant function
echo "  → Deploying 'beauty-assistant' function..."
npx supabase functions deploy beauty-assistant --project-ref $PROJECT_REF

# Deploy bulk-product-upload function
echo "  → Deploying 'bulk-product-upload' function..."
npx supabase functions deploy bulk-product-upload --project-ref $PROJECT_REF

echo ""
echo "✅ Edge Functions deployed successfully!"
echo ""
echo "📝 Database Migration"
echo "---------------------"
echo "To apply the database migration, run this SQL in the Supabase Dashboard:"
echo "  1. Go to: https://supabase.com/dashboard/project/$PROJECT_REF/sql"
echo "  2. Open: supabase/migrations/20260210000001_digital_tray_system.sql"
echo "  3. Copy and paste the SQL into the editor"
echo "  4. Click 'Run'"
echo ""
echo "🎉 Deployment complete!"
