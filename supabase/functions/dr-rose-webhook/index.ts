/**
 * Dr. Rose Omnichannel Webhook
 * ==============================
 * Unified webhook endpoint for receiving messages from all social media platforms
 * and routing them through Dr. Rose's AI brain.
 *
 * Supported Channels:
 * - WhatsApp Business API (via Meta Cloud API)
 * - Instagram DMs (via Meta Graph API / Instagram Messaging)
 * - Facebook Messenger (via Meta Webhooks)
 * - TikTok DMs (via TikTok Business API)
 *
 * Endpoint: POST /functions/v1/dr-rose-webhook
 * Verify:   GET  /functions/v1/dr-rose-webhook?hub.mode=subscribe&hub.verify_token=...
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-hub-signature-256",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

interface WebhookMessage {
  channel: "whatsapp" | "instagram" | "facebook" | "tiktok";
  sender_id: string;
  sender_name?: string;
  message_text: string;
  message_id?: string;
  timestamp?: string;
  raw_payload?: unknown;
}

interface ConversationEntry {
  role: "user" | "assistant";
  content: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const BEAUTY_ASSISTANT_URL = `${SUPABASE_URL}/functions/v1/beauty-assistant`;

/**
 * Extract message from Meta Webhook payload (WhatsApp, Instagram, Facebook Messenger)
 */
function parseMetaWebhook(body: Record<string, unknown>): WebhookMessage | null {
  try {
    const entry = (body.entry as Array<Record<string, unknown>>)?.[0];
    if (!entry) return null;

    // WhatsApp Business API
    const changes = (entry.changes as Array<Record<string, unknown>>)?.[0];
    if (changes?.field === "messages") {
      const value = changes.value as Record<string, unknown>;
      const messages = (value?.messages as Array<Record<string, unknown>>);
      if (messages?.[0]) {
        const msg = messages[0];
        const contacts = (value?.contacts as Array<Record<string, unknown>>);
        return {
          channel: "whatsapp",
          sender_id: msg.from as string,
          sender_name: (contacts?.[0]?.profile as Record<string, unknown>)?.name as string,
          message_text: (msg.text as Record<string, unknown>)?.body as string || "",
          message_id: msg.id as string,
          timestamp: msg.timestamp as string,
          raw_payload: body,
        };
      }
    }

    // Instagram Messaging
    const messaging = (entry.messaging as Array<Record<string, unknown>>)?.[0];
    if (messaging) {
      const senderId = (messaging.sender as Record<string, unknown>)?.id as string;
      const pageId = (messaging.recipient as Record<string, unknown>)?.id as string;

      if (senderId === pageId) return null;

      const message = messaging.message as Record<string, unknown>;
      if (!message?.text) return null;

      const platform = body.object === "instagram" ? "instagram" : "facebook";

      return {
        channel: platform,
        sender_id: senderId,
        message_text: message.text as string,
        message_id: message.mid as string,
        timestamp: String(messaging.timestamp),
        raw_payload: body,
      };
    }
  } catch (e) {
    console.error("[webhook] Failed to parse Meta payload:", e);
  }
  return null;
}

/**
 * Parse TikTok webhook payload
 */
function parseTikTokWebhook(body: Record<string, unknown>): WebhookMessage | null {
  try {
    const event = body.event as string;
    if (event !== "receive_message") return null;

    const content = body.content as Record<string, unknown>;
    return {
      channel: "tiktok",
      sender_id: content?.from_user_id as string || "",
      message_text: content?.text as string || "",
      message_id: content?.msg_id as string,
      timestamp: String(body.create_time || ""),
      raw_payload: body,
    };
  } catch (e) {
    console.error("[webhook] Failed to parse TikTok payload:", e);
  }
  return null;
}

/**
 * Get or initialize conversation history from Supabase
 */
async function getConversationHistory(
  supabase: ReturnType<typeof createClient>,
  channelId: string,
  senderId: string,
): Promise<ConversationEntry[]> {
  const { data } = await supabase
    .from("dr_rose_conversations")
    .select("messages")
    .eq("channel", channelId)
    .eq("sender_id", senderId)
    .single();

  if (data?.messages) {
    const messages = data.messages as ConversationEntry[];
    return messages.slice(-10);
  }
  return [];
}

/**
 * Save conversation history to Supabase
 */
async function saveConversationHistory(
  supabase: ReturnType<typeof createClient>,
  channelId: string,
  senderId: string,
  messages: ConversationEntry[],
) {
  const trimmed = messages.slice(-20);

  const { error } = await supabase
    .from("dr_rose_conversations")
    .upsert(
      {
        channel: channelId,
        sender_id: senderId,
        messages: trimmed,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "channel,sender_id" },
    );

  if (error) {
    console.error("[webhook] Failed to save conversation:", error);
  }
}

/**
 * Call Dr. Rose's brain (beauty-assistant) and get a non-streaming response
 */
async function getDrRoseResponse(
  messages: ConversationEntry[],
  channel: string,
): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) {
    return "I'm having a moment — please try again shortly! 🌹 - Dr. Rose";
  }

  try {
    const response = await fetch(BEAUTY_ASSISTANT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_ANON_KEY,
        "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ messages, channel }),
    });

    if (!response.ok) {
      console.error("[webhook] Beauty assistant returned:", response.status);
      return "I'm having a moment — please try again shortly! 🌹 - Dr. Rose";
    }

    const reader = response.body?.getReader();
    if (!reader) return "I'm having a moment — please try again shortly! 🌹 - Dr. Rose";

    const decoder = new TextDecoder();
    let fullContent = "";
    let textBuffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textBuffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
        let line = textBuffer.slice(0, newlineIndex);
        textBuffer = textBuffer.slice(newlineIndex + 1);

        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (line.startsWith(":") || line.trim() === "") continue;
        if (!line.startsWith("data: ")) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) fullContent += content;
        } catch {
          // incomplete chunk, will be completed next iteration
        }
      }
    }

    return fullContent || "I'm here to help with your beauty needs! What's your skin concern? 🌹 - Dr. Rose";
  } catch (error) {
    console.error("[webhook] Error calling Dr. Rose brain:", error);
    return "I'm having a moment — please try again shortly! 🌹 - Dr. Rose";
  }
}

/**
 * Send reply back to WhatsApp via Meta Cloud API
 */
async function sendWhatsAppReply(recipientPhone: string, message: string) {
  const token = Deno.env.get("META_WHATSAPP_TOKEN");
  const phoneNumberId = Deno.env.get("META_WHATSAPP_PHONE_ID");

  if (!token || !phoneNumberId) {
    console.error("[webhook] WhatsApp credentials not configured");
    return;
  }

  await fetch(
    `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: recipientPhone,
        type: "text",
        text: { body: message },
      }),
    },
  );
}

/**
 * Send reply back to Instagram/Facebook via Meta Send API
 */
async function sendMetaReply(recipientId: string, message: string, platform: "instagram" | "facebook") {
  const token = platform === "instagram"
    ? Deno.env.get("META_INSTAGRAM_TOKEN")
    : Deno.env.get("META_FACEBOOK_TOKEN");

  if (!token) {
    console.error(`[webhook] ${platform} token not configured`);
    return;
  }

  const pageId = platform === "instagram"
    ? Deno.env.get("META_INSTAGRAM_PAGE_ID")
    : Deno.env.get("META_FACEBOOK_PAGE_ID");

  await fetch(
    `https://graph.facebook.com/v19.0/${pageId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipient: { id: recipientId },
        message: { text: message },
      }),
    },
  );
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Meta Webhook Verification (GET request with hub.verify_token)
  if (req.method === "GET") {
    const url = new URL(req.url);
    const mode = url.searchParams.get("hub.mode");
    const token = url.searchParams.get("hub.verify_token");
    const challenge = url.searchParams.get("hub.challenge");

    const VERIFY_TOKEN = Deno.env.get("WEBHOOK_VERIFY_TOKEN") || "asper_dr_rose_2026";

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[webhook] Verification successful");
      return new Response(challenge, {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    return new Response(JSON.stringify({ status: "webhook_active", channels: ["whatsapp", "instagram", "facebook", "tiktok"] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Process incoming messages (POST)
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  try {
    const body = await req.json();

    // Determine source and parse message
    let webhookMessage: WebhookMessage | null = null;

    if (body.object === "whatsapp_business_account" || body.object === "whatsapp") {
      webhookMessage = parseMetaWebhook(body);
    } else if (body.object === "instagram") {
      webhookMessage = parseMetaWebhook(body);
    } else if (body.object === "page") {
      webhookMessage = parseMetaWebhook(body);
    } else if (body.event === "receive_message") {
      webhookMessage = parseTikTokWebhook(body);
    } else if (body.channel && body.message_text) {
      // Direct/manual integration format
      webhookMessage = {
        channel: body.channel,
        sender_id: body.sender_id || "unknown",
        sender_name: body.sender_name,
        message_text: body.message_text,
        message_id: body.message_id,
      };
    }

    if (!webhookMessage || !webhookMessage.message_text) {
      // Meta expects 200 OK even for events we don't process
      return new Response(
        JSON.stringify({ status: "received", processed: false }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log(`[webhook] ${webhookMessage.channel} message from ${webhookMessage.sender_id}: "${webhookMessage.message_text.slice(0, 100)}"`);

    // Initialize Supabase for conversation persistence
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Get conversation history
    const history = await getConversationHistory(
      supabase,
      webhookMessage.channel,
      webhookMessage.sender_id,
    );

    // Add new user message
    const updatedMessages: ConversationEntry[] = [
      ...history,
      { role: "user", content: webhookMessage.message_text },
    ];

    // Get Dr. Rose's response
    const drRoseReply = await getDrRoseResponse(updatedMessages, webhookMessage.channel);

    // Save updated conversation
    await saveConversationHistory(
      supabase,
      webhookMessage.channel,
      webhookMessage.sender_id,
      [...updatedMessages, { role: "assistant", content: drRoseReply }],
    );

    // Send reply back to the originating platform
    switch (webhookMessage.channel) {
      case "whatsapp":
        await sendWhatsAppReply(webhookMessage.sender_id, drRoseReply);
        break;
      case "instagram":
        await sendMetaReply(webhookMessage.sender_id, drRoseReply, "instagram");
        break;
      case "facebook":
        await sendMetaReply(webhookMessage.sender_id, drRoseReply, "facebook");
        break;
      case "tiktok":
        console.log(`[webhook] TikTok reply (manual send required): ${drRoseReply.slice(0, 100)}`);
        break;
    }

    // Log to conversation analytics table
    try {
      await supabase.from("dr_rose_analytics").insert({
        channel: webhookMessage.channel,
        sender_id: webhookMessage.sender_id,
        user_message: webhookMessage.message_text,
        bot_response: drRoseReply,
        created_at: new Date().toISOString(),
      });
    } catch {
      // Analytics logging is non-critical
    }

    return new Response(
      JSON.stringify({
        status: "ok",
        channel: webhookMessage.channel,
        reply: drRoseReply,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[webhook] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
