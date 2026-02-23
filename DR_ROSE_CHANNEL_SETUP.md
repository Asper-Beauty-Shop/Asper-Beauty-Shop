# Dr. Rose Omnichannel Setup Guide

This guide ensures Dr. Rose is connected across web and social channels with one shared AI brain.

## 1) Deployed Functions

- `beauty-assistant`  
  Web chat endpoint used by `src/components/BeautyAssistant.tsx`.
- `dr-rose-channel-router`  
  Webhook + omnichannel router that accepts inbound messages and returns/generated routed replies.
- `tray`  
  Digital Tray regimen endpoint for concern-specific routines.

## 2) Environment Variables (Supabase Edge Functions)

Required:

- `LOVABLE_API_KEY`
- `DR_ROSE_WEBHOOK_VERIFY_TOKEN`

Optional (recommended for production routing):

- `DR_ROSE_CHANNEL_CALLBACK_URL`
- `DR_ROSE_CHANNEL_CALLBACK_TOKEN`
- `DR_ROSE_CHANNEL_CALLBACK_SECRET`

## 3) Deploy

```bash
./scripts/deploy-supabase.sh
```

This deploys:

- `tray`
- `beauty-assistant`
- `dr-rose-channel-router`
- `bulk-product-upload`

## 4) Health Check

```bash
curl "https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/dr-rose-channel-router?health=1"
```

Check:

- `status` is `ok`
- `configured.lovable_api_key` is `true`
- `configured.webhook_verify_token` is `true`

## 5) Webhook Verification (Meta)

Use the function URL as webhook:

`https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/dr-rose-channel-router`

Meta sends `hub.mode`, `hub.verify_token`, and `hub.challenge`.  
Set `DR_ROSE_WEBHOOK_VERIFY_TOKEN` to the same value configured in Meta Developer settings.

## 6) Channel Payload Examples

### Generic Channel Test (dry run)

```bash
curl -X POST "https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/dr-rose-channel-router" \
  -H "Content-Type: application/json" \
  -d '{
    "dryRun": true,
    "channel": "instagram",
    "userId": "test-user-1",
    "locale": "en",
    "text": "I need help with acne and oil control."
  }'
```

### WhatsApp-style inbound test (dry run)

```bash
curl -X POST "https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/dr-rose-channel-router" \
  -H "Content-Type: application/json" \
  -d '{
    "dryRun": true,
    "object": "whatsapp_business_account",
    "entry": [{
      "changes": [{
        "value": {
          "contacts": [{ "profile": { "name": "Maya" } }],
          "messages": [{ "from": "962790000000", "text": { "body": "I want a retinol routine" } }]
        }
      }]
    }]
  }'
```

## 7) Callback Routing

If `DR_ROSE_CHANNEL_CALLBACK_URL` is set, the router forwards each generated reply as:

```json
{
  "channel": "whatsapp",
  "userId": "962790000000",
  "userName": "Maya",
  "input": "I want a retinol routine",
  "reply": "Dr. Rose generated reply...",
  "timestamp": "2026-02-23T00:00:00.000Z"
}
```

Use your callback service (Meta/Twilio/automation layer) to send the final outbound message on the channel.

## 8) Brain Consistency

Both `beauty-assistant` and `dr-rose-channel-router` use:

- `supabase/functions/_shared/drRosePrompt.ts`

This guarantees the same Dr. Rose rules for:

- Brand routing
- SPF upsell logic
- Makeup prep logic
- Store policy statements
- Off-topic rejection guardrails
