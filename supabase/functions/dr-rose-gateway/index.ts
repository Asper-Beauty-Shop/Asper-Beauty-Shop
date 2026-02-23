import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { buildDrRoseSystemPrompt } from "../_shared/drRoseBrain.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function json(status: number, body: Record<string, unknown>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function extractAssistantText(data: unknown): string | null {
  const d = data as Record<string, unknown> | null;
  const choices = (d?.choices as unknown[]) ?? [];
  const first = (choices[0] as Record<string, unknown> | undefined) ?? {};
  const message = first.message as Record<string, unknown> | undefined;
  const content = message?.content;
  return typeof content === "string" ? content : null;
}

function clampOutboundText(text: string): string {
  const trimmed = text.trim();
  // Keep social replies comfortably within platform limits.
  if (trimmed.length <= 1500) return trimmed;
  return `${trimmed.slice(0, 1490).trimEnd()}…`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(405, { error: "Method not allowed" });
  }

  try {
    const payload = await req.json().catch(() => null) as
      | Record<string, unknown>
      | null;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const channel = typeof payload?.channel === "string"
      ? payload.channel
      : "unknown";
    const language = typeof payload?.language === "string"
      ? payload.language
      : "auto";
    const stream = payload?.stream === true;

    const systemPrompt = buildDrRoseSystemPrompt({ channel, language });

    let messages: ChatMessage[] = [];
    if (Array.isArray(payload?.messages)) {
      messages = payload!.messages as ChatMessage[];
    } else if (typeof payload?.text === "string") {
      messages = [{ role: "user", content: payload.text }];
    } else {
      return json(400, {
        error: "Invalid request: provide `text` or `messages`",
      });
    }

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
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          stream,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return json(429, {
          error: "Rate limit exceeded. Please try again in a moment.",
        });
      }
      if (response.status === 402) {
        return json(402, { error: "Service temporarily unavailable." });
      }

      const errorText = await response.text();
      console.error("[dr-rose-gateway] AI gateway error:", response.status, errorText);
      return json(500, { error: "Failed to get response" });
    }

    if (stream) {
      return new Response(response.body, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    const data = await response.json();
    const reply = extractAssistantText(data);
    if (!reply) return json(500, { error: "No assistant reply returned" });

    return json(200, { reply: clampOutboundText(reply) });
  } catch (error) {
    console.error("[dr-rose-gateway] error:", error);
    return json(500, {
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

