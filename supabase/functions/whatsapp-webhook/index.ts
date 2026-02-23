import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildDrRoseSystemPrompt } from "../_shared/drRoseBrain.ts";
import { parseMetaVerifyQuery, verifyMetaSignature } from "../_shared/metaWebhooks.ts";

type WhatsAppWebhookPayload = {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          from?: string;
          type?: string;
          text?: { body?: string };
        }>;
      };
    }>;
  }>;
};

function text(status: number, body: string): Response {
  return new Response(body, { status, headers: { "Content-Type": "text/plain" } });
}

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function clampOutboundText(input: string): string {
  const s = input.trim();
  if (s.length <= 1400) return s;
  return `${s.slice(0, 1390).trimEnd()}…`;
}

async function callDrRose(textIn: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const systemPrompt = buildDrRoseSystemPrompt({
    channel: "whatsapp",
    language: "auto",
  });

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: textIn },
        ],
        stream: false,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("[whatsapp-webhook] AI gateway error:", response.status, err);
    throw new Error("AI gateway failed");
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("No assistant reply returned");
  }

  return clampOutboundText(reply);
}

async function sendWhatsAppText(opts: { to: string; text: string }): Promise<void> {
  const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
  const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
  if (!token) throw new Error("WHATSAPP_ACCESS_TOKEN is not configured");
  if (!phoneNumberId) throw new Error("WHATSAPP_PHONE_NUMBER_ID is not configured");

  const version = Deno.env.get("WHATSAPP_GRAPH_API_VERSION") ||
    Deno.env.get("META_GRAPH_API_VERSION") || "v20.0";
  const url = `https://graph.facebook.com/${version}/${phoneNumberId}/messages`;

  const resp = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: opts.to,
      type: "text",
      text: { body: opts.text },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error("[whatsapp-webhook] Send API error:", resp.status, err);
    throw new Error("Failed to send WhatsApp message");
  }
}

serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "GET") {
    const { mode, verifyToken, challenge } = parseMetaVerifyQuery(url);
    const expected = Deno.env.get("WHATSAPP_VERIFY_TOKEN") ||
      Deno.env.get("WEBHOOK_VERIFY_TOKEN");
    if (!expected) return text(500, "WHATSAPP_VERIFY_TOKEN not configured");

    if (mode === "subscribe" && verifyToken === expected && challenge) {
      return text(200, challenge);
    }
    return text(403, "Forbidden");
  }

  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const rawBody = await req.arrayBuffer();
  const appSecret = Deno.env.get("META_APP_SECRET") || Deno.env.get("WHATSAPP_APP_SECRET");
  if (appSecret) {
    const signature = req.headers.get("x-hub-signature-256");
    const ok = await verifyMetaSignature({
      appSecret,
      rawBody,
      signatureHeader: signature,
    });
    if (!ok) return text(401, "Invalid signature");
  }

  let body: WhatsAppWebhookPayload;
  try {
    body = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  try {
    const entries = Array.isArray(body.entry) ? body.entry : [];
    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change.value;
        const messages = Array.isArray(value?.messages) ? value.messages : [];

        for (const msg of messages) {
          const from = msg.from;
          const type = msg.type;
          const textIn = msg.text?.body;

          if (typeof from !== "string" || !from) continue;
          if (type !== "text") continue;
          if (typeof textIn !== "string" || !textIn.trim()) continue;

          const reply = await callDrRose(textIn);
          await sendWhatsAppText({ to: from, text: reply });
        }
      }
    }

    return json(200, { ok: true });
  } catch (error) {
    console.error("[whatsapp-webhook] error:", error);
    return json(200, { ok: true }); // prevent retries loop
  }
});

