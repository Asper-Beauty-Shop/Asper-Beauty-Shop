import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildDrRoseSystemPrompt,
  normalizeDrRoseChannel,
  type DrRoseChannel,
} from "../_shared/drRosePrompt.ts";

const LOVABLE_GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const SUPPORTED_CHANNELS: DrRoseChannel[] = [
  "web",
  "whatsapp",
  "instagram",
  "facebook",
  "tiktok",
  "unknown",
];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

type InboundMessage = {
  channel: DrRoseChannel;
  userId: string;
  userName?: string;
  text: string;
  locale: "en" | "ar";
  history: ChatMessage[];
};

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function readString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function hasArabicCharacters(text: string): boolean {
  return /[\u0600-\u06FF]/.test(text);
}

function parseLocale(
  explicitLocale: unknown,
  fallbackText: string,
): "en" | "ar" {
  if (explicitLocale === "ar" || explicitLocale === "en") {
    return explicitLocale;
  }
  return hasArabicCharacters(fallbackText) ? "ar" : "en";
}

function parseHistory(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!isRecord(item)) return null;
      const role = item.role;
      const content = readString(item.content);
      if ((role === "user" || role === "assistant") && content) {
        return { role, content };
      }
      return null;
    })
    .filter((item): item is ChatMessage => item !== null)
    .slice(-10);
}

function extractGenericMessages(payload: Record<string, unknown>): InboundMessage[] {
  const events: InboundMessage[] = [];
  const topLevelChannel = normalizeDrRoseChannel(payload.channel);
  const topLevelUserId = readString(payload.userId) ?? "unknown-user";
  const topLevelUserName = readString(payload.userName) ?? undefined;
  const topLevelHistory = parseHistory(payload.history);

  const topLevelText = readString(payload.text);
  if (topLevelText) {
    events.push({
      channel: topLevelChannel,
      userId: topLevelUserId,
      userName: topLevelUserName,
      text: topLevelText,
      locale: parseLocale(payload.locale, topLevelText),
      history: topLevelHistory,
    });
  }

  if (!Array.isArray(payload.messages)) {
    return events;
  }

  for (const message of payload.messages) {
    if (!isRecord(message)) continue;
    const text = readString(message.text) ?? readString(message.content);
    if (!text) continue;

    const channel = normalizeDrRoseChannel(message.channel ?? payload.channel);
    const userId = readString(message.userId) ?? topLevelUserId;
    const userName = readString(message.userName) ?? topLevelUserName;
    const history = parseHistory(message.history ?? payload.history);

    events.push({
      channel,
      userId,
      userName: userName ?? undefined,
      text,
      locale: parseLocale(message.locale ?? payload.locale, text),
      history,
    });
  }

  return events;
}

function extractWhatsAppMessages(payload: Record<string, unknown>): InboundMessage[] {
  const events: InboundMessage[] = [];
  if (payload.object !== "whatsapp_business_account") return events;
  if (!Array.isArray(payload.entry)) return events;

  for (const entryItem of payload.entry) {
    if (!isRecord(entryItem) || !Array.isArray(entryItem.changes)) continue;

    for (const changeItem of entryItem.changes) {
      if (!isRecord(changeItem) || !isRecord(changeItem.value)) continue;
      const changeValue = changeItem.value;
      const contacts = Array.isArray(changeValue.contacts) ? changeValue.contacts : [];
      const contact = contacts.find((item) => isRecord(item));
      const profile = isRecord(contact?.profile) ? contact.profile : null;
      const userName = profile ? readString(profile.name) ?? undefined : undefined;
      const messages = Array.isArray(changeValue.messages) ? changeValue.messages : [];

      for (const messageItem of messages) {
        if (!isRecord(messageItem) || !isRecord(messageItem.text)) continue;
        const text = readString(messageItem.text.body);
        if (!text) continue;

        events.push({
          channel: "whatsapp",
          userId: readString(messageItem.from) ?? "unknown-whatsapp-user",
          userName,
          text,
          locale: parseLocale(null, text),
          history: [],
        });
      }
    }
  }

  return events;
}

function extractMetaMessagingEvents(
  payload: Record<string, unknown>,
  channel: "instagram" | "facebook",
): InboundMessage[] {
  const events: InboundMessage[] = [];
  if (!Array.isArray(payload.entry)) return events;

  for (const entryItem of payload.entry) {
    if (!isRecord(entryItem) || !Array.isArray(entryItem.messaging)) continue;

    for (const messagingItem of entryItem.messaging) {
      if (!isRecord(messagingItem) || !isRecord(messagingItem.message)) continue;
      const text = readString(messagingItem.message.text);
      if (!text) continue;

      const sender = isRecord(messagingItem.sender) ? messagingItem.sender : null;
      const userId = sender ? readString(sender.id) ?? `unknown-${channel}-user` : `unknown-${channel}-user`;

      events.push({
        channel,
        userId,
        text,
        locale: parseLocale(null, text),
        history: [],
      });
    }
  }

  return events;
}

function extractInboundMessages(payload: Record<string, unknown>): InboundMessage[] {
  const events: InboundMessage[] = [];

  events.push(...extractWhatsAppMessages(payload));

  if (payload.object === "instagram") {
    events.push(...extractMetaMessagingEvents(payload, "instagram"));
  }

  if (payload.object === "page") {
    events.push(...extractMetaMessagingEvents(payload, "facebook"));
  }

  events.push(...extractGenericMessages(payload));
  return events;
}

async function getLovableReply(inbound: InboundMessage): Promise<string> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) {
    throw new Error("LOVABLE_API_KEY is not configured");
  }

  const requestMessages = [
    {
      role: "system",
      content: buildDrRoseSystemPrompt({
        channel: inbound.channel,
        locale: inbound.locale,
      }),
    },
    ...inbound.history,
    { role: "user", content: inbound.text },
  ];

  const response = await fetch(LOVABLE_GATEWAY_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: requestMessages,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI gateway error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim().length > 0) {
    return content.trim();
  }

  throw new Error("AI gateway returned an empty response");
}

async function hmacSha256Hex(secret: string, payload: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

async function forwardToChannelCallback(inbound: InboundMessage, reply: string): Promise<{
  forwarded: boolean;
  status?: number;
  error?: string;
}> {
  const callbackUrl = Deno.env.get("DR_ROSE_CHANNEL_CALLBACK_URL");
  if (!callbackUrl) {
    return { forwarded: false };
  }

  const outboundPayload = JSON.stringify({
    channel: inbound.channel,
    userId: inbound.userId,
    userName: inbound.userName ?? null,
    input: inbound.text,
    reply,
    timestamp: new Date().toISOString(),
  });

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  const callbackToken = Deno.env.get("DR_ROSE_CHANNEL_CALLBACK_TOKEN");
  if (callbackToken) {
    headers.Authorization = `Bearer ${callbackToken}`;
  }

  const callbackSecret = Deno.env.get("DR_ROSE_CHANNEL_CALLBACK_SECRET");
  if (callbackSecret) {
    headers["X-Dr-Rose-Signature"] = await hmacSha256Hex(
      callbackSecret,
      outboundPayload,
    );
  }

  try {
    const callbackResponse = await fetch(callbackUrl, {
      method: "POST",
      headers,
      body: outboundPayload,
    });

    if (!callbackResponse.ok) {
      const body = await callbackResponse.text();
      return {
        forwarded: false,
        status: callbackResponse.status,
        error: `callback returned ${callbackResponse.status}: ${body}`,
      };
    }

    return { forwarded: true, status: callbackResponse.status };
  } catch (error) {
    return {
      forwarded: false,
      error: error instanceof Error ? error.message : "callback request failed",
    };
  }
}

function healthPayload() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    supported_channels: SUPPORTED_CHANNELS,
    configured: {
      lovable_api_key: Boolean(Deno.env.get("LOVABLE_API_KEY")),
      webhook_verify_token: Boolean(Deno.env.get("DR_ROSE_WEBHOOK_VERIFY_TOKEN")),
      channel_callback_url: Boolean(Deno.env.get("DR_ROSE_CHANNEL_CALLBACK_URL")),
      channel_callback_token: Boolean(Deno.env.get("DR_ROSE_CHANNEL_CALLBACK_TOKEN")),
      channel_callback_secret: Boolean(Deno.env.get("DR_ROSE_CHANNEL_CALLBACK_SECRET")),
    },
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method === "GET") {
    const url = new URL(req.url);
    if (url.searchParams.get("health") === "1") {
      return jsonResponse(healthPayload());
    }

    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    if (mode === "subscribe" && challenge) {
      const verifyToken = Deno.env.get("DR_ROSE_WEBHOOK_VERIFY_TOKEN");
      if (!verifyToken) {
        return jsonResponse(
          { error: "DR_ROSE_WEBHOOK_VERIFY_TOKEN is not configured" },
          500,
        );
      }
      if (token === verifyToken) {
        return new Response(challenge, { status: 200, headers: corsHeaders });
      }
      return jsonResponse({ error: "Invalid verification token" }, 403);
    }

    return jsonResponse(
      {
        message:
          "Use POST for inbound messages, GET ?health=1 for status, or Meta webhook verification params.",
      },
      200,
    );
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const payload = await req.json();
    if (!isRecord(payload)) {
      return jsonResponse({ error: "Invalid JSON payload" }, 400);
    }

    const dryRun = payload.dryRun === true;
    const inboundMessages = extractInboundMessages(payload);

    if (inboundMessages.length === 0) {
      return jsonResponse({
        success: true,
        processed: 0,
        message: "No actionable inbound messages found.",
      });
    }

    const results: Array<Record<string, unknown>> = [];
    for (const inbound of inboundMessages) {
      try {
        const reply = await getLovableReply(inbound);
        const callbackResult = dryRun
          ? { forwarded: false, dry_run: true }
          : await forwardToChannelCallback(inbound, reply);

        results.push({
          success: true,
          channel: inbound.channel,
          userId: inbound.userId,
          input: inbound.text,
          reply,
          callback: callbackResult,
        });
      } catch (error) {
        results.push({
          success: false,
          channel: inbound.channel,
          userId: inbound.userId,
          input: inbound.text,
          error: error instanceof Error ? error.message : "Unknown processing error",
        });
      }
    }

    const succeeded = results.filter((item) => item.success === true).length;
    const failed = results.length - succeeded;

    return jsonResponse({
      success: failed === 0,
      dry_run: dryRun,
      processed: results.length,
      succeeded,
      failed,
      results,
    });
  } catch (error) {
    console.error("[dr-rose-channel-router] error:", error);
    return jsonResponse(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      500,
    );
  }
});
