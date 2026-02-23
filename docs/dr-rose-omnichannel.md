# Dr. Rose — Omnichannel Deployment (Web + Social)

This repo deploys Dr. Rose as a single shared “brain” across:
- Website widget (`beauty-assistant`)
- Omnichannel JSON gateway (`dr-rose-gateway`)
- Meta webhooks for Instagram/FB Messenger (`meta-webhook`)
- WhatsApp Cloud API webhook (`whatsapp-webhook`)

The canonical prompt lives in `supabase/functions/_shared/drRoseBrain.ts` and is imported by every channel so behavior stays consistent.

---

## 1) Edge Function URLs

Supabase project ref: `rgehleqcubtmcwyipyvi`

- Website streaming chat (SSE):  
  `https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/beauty-assistant`

- Omnichannel gateway (JSON by default, can stream if `stream: true`):  
  `https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/dr-rose-gateway`

- Instagram / Facebook Messenger webhook (Meta Webhooks):  
  `https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/meta-webhook`

- WhatsApp Cloud API webhook (Meta Webhooks):  
  `https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/whatsapp-webhook`

---

## 2) Required Secrets (Supabase → Edge Function Secrets)

### Required (all channels)
- `LOVABLE_API_KEY` — used to call Lovable AI Gateway (`google/gemini-2.5-flash`)

### Meta (Instagram + Facebook Messenger)
- `META_VERIFY_TOKEN` (or `WEBHOOK_VERIFY_TOKEN`) — any random string you set in Meta webhook config
- `META_PAGE_ACCESS_TOKEN` — must have messaging permissions for your Page/IG integration
- `META_APP_SECRET` — optional but strongly recommended (enables `x-hub-signature-256` verification)
- `META_GRAPH_API_VERSION` — optional, default: `v20.0`

### WhatsApp Cloud API
- `WHATSAPP_VERIFY_TOKEN` (or `WEBHOOK_VERIFY_TOKEN`) — random string for webhook verification
- `WHATSAPP_ACCESS_TOKEN` — permanent/system-user token recommended
- `WHATSAPP_PHONE_NUMBER_ID` — the Cloud API phone number ID used for sending messages
- `WHATSAPP_APP_SECRET` — optional (if different from `META_APP_SECRET`)
- `WHATSAPP_GRAPH_API_VERSION` — optional, default: `v20.0`

---

## 3) Meta Setup (Instagram DMs + Facebook Messenger)

High-level checklist:
1. Create a Meta App (Business).
2. Add **Webhooks** product, and configure a webhook subscription.
3. Add **Messenger** and/or **Instagram** products (depending on your setup).
4. Subscribe to message events (e.g. `messages`, `messaging_postbacks` as needed).
5. Set callback URL to:
   - `.../functions/v1/meta-webhook`
6. Set verify token to match your `META_VERIFY_TOKEN`.
7. Generate a Page access token and save it as `META_PAGE_ACCESS_TOKEN`.
8. (Recommended) Add `META_APP_SECRET` so the webhook signature can be verified.

Notes:
- The handler ignores echo messages to avoid loops.
- Replies are clamped to ~1500 chars for DM safety.

---

## 4) WhatsApp Cloud API Setup

1. In the same Meta App, add **WhatsApp** product and create/configure a phone number.
2. Set webhook callback URL to:
   - `.../functions/v1/whatsapp-webhook`
3. Set verify token to match `WHATSAPP_VERIFY_TOKEN`.
4. Store:
   - `WHATSAPP_ACCESS_TOKEN`
   - `WHATSAPP_PHONE_NUMBER_ID`
5. (Recommended) set `META_APP_SECRET` or `WHATSAPP_APP_SECRET` for signature verification.

Notes:
- Only inbound text messages are handled right now (`type === "text"`).
- Replies are clamped to ~1400 chars for WhatsApp safety.

---

## 5) Quick Test (without social platforms)

Call the gateway directly:

```bash
curl -sS \
  -X POST "https://rgehleqcubtmcwyipyvi.supabase.co/functions/v1/dr-rose-gateway" \
  -H "Content-Type: application/json" \
  -d '{"text":"I have oily acne-prone skin. Build me a routine.","channel":"instagram","language":"en"}'
```

Expected response:
```json
{ "reply": "..." }
```

