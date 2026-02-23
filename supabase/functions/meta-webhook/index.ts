import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildDrRoseSystemPrompt } from "../_shared/drRoseBrain.ts";
import { parseMetaVerifyQuery, verifyMetaSignature } from "../_shared/metaWebhooks.ts";

type MetaWebhookPayload = {
  object?: string;
  entry?: Array<{
    messaging?: Array<{
      sender?: { id?: string };
      message?: { text?: string; is_echo?: boolean };
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
  if (s.length <= 1500) return s;
  return `${s.slice(0, 1490).trimEnd()}…`;
}

async function callDrRose(opts: {
  text: string;
  channel: string;
  language?: string;
}): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

  const systemPrompt = buildDrRoseSystemPrompt({
    channel: opts.channel,
    language: opts.language ?? "auto",
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
          { role: "user", content: opts.text },
        ],
        stream: false,
      }),
    },
  );

  if (!response.ok) {
    const err = await response.text();
    console.error("[meta-webhook] AI gateway error:", response.status, err);
    throw new Error("AI gateway failed");
  }

  const data = await response.json();
  const reply = data?.choices?.[0]?.message?.content;
  if (typeof reply !== "string" || !reply.trim()) {
    throw new Error("No assistant reply returned");
  }

  return clampOutboundText(reply);
}

async function sendMetaTextMessage(opts: {
  recipientId: string;
  text: string;
}): Promise<void> {
  const token = Deno.env.get("META_PAGE_ACCESS_TOKEN");
  if (!token) throw new Error("META_PAGE_ACCESS_TOKEN is not configured");

  const version = Deno.env.get("META_GRAPH_API_VERSION") || "v20.0";
  const url =
    `https://graph.facebook.com/${version}/me/messages?access_token=${
      encodeURIComponent(token)
    }`;

  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_type: "RESPONSE",
      recipient: { id: opts.recipientId },
      message: { text: opts.text },
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    console.error("[meta-webhook] Send API error:", resp.status, err);
    throw new Error("Failed to send Meta message");
  }
}

serve(async (req) => {
  const url = new URL(req.url);

  if (req.method === "GET") {
    const { mode, verifyToken, challenge } = parseMetaVerifyQuery(url);
    const expected = Deno.env.get("META_VERIFY_TOKEN") ||
      Deno.env.get("WEBHOOK_VERIFY_TOKEN");

    if (!expected) return text(500, "META_VERIFY_TOKEN not configured");
    if (mode === "subscribe" && verifyToken === expected && challenge) {
      return text(200, challenge);
    }
    return text(403, "Forbidden");
  }

  if (req.method !== "POST") return json(405, { error: "Method not allowed" });

  const rawBody = await req.arrayBuffer();
  const appSecret = Deno.env.get("META_APP_SECRET");
  if (appSecret) {
    const signature = req.headers.get("x-hub-signature-256");
    const ok = await verifyMetaSignature({
      appSecret,
      rawBody,
      signatureHeader: signature,
    });
    if (!ok) return text(401, "Invalid signature");
  }

  let body: MetaWebhookPayload;
  try {
    body = JSON.parse(new TextDecoder().decode(rawBody));
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  const objectType = typeof body.object === "string" ? body.object : "unknown";
  const channel = objectType === "instagram" ? "instagram" : "messenger";

  try {
    const entries = Array.isArray(body.entry) ? body.entry : [];
    for (const entry of entries) {
      const messagingEvents = Array.isArray(entry.messaging) ? entry.messaging : [];

      for (const ev of messagingEvents) {
        const msg = ev.message;
        const isEcho = msg?.is_echo === true;
        const textIn = msg?.text;
        const senderId = ev.sender?.id;

        if (isEcho) continue;
        if (typeof senderId !== "string" || !senderId) continue;
        if (typeof textIn !== "string" || !textIn.trim()) continue;

        const reply = await callDrRose({ text: textIn, channel });
        await sendMetaTextMessage({ recipientId: senderId, text: reply });
      }
    }

    return json(200, { ok: true });
  } catch (error) {
    console.error("[meta-webhook] error:", error);
    return json(200, { ok: true }); // Always 200 to avoid webhook retries loops
  }
});

