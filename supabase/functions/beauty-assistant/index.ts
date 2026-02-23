import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildDrRoseSystemPrompt,
  normalizeDrRoseChannel,
  type DrRoseChannel,
} from "../_shared/drRosePrompt.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type ChatRole = "user" | "assistant";
type ChatMessage = { role: ChatRole; content: string };

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) {
    throw new Error("messages must be an array");
  }

  const parsed = value
    .map((item) => {
      if (typeof item !== "object" || item === null) return null;
      const candidate = item as Record<string, unknown>;
      const role = candidate.role;
      const content = candidate.content;
      if (
        (role === "user" || role === "assistant") &&
        typeof content === "string" &&
        content.trim().length > 0
      ) {
        return { role, content: content.trim() } as ChatMessage;
      }
      return null;
    })
    .filter((item): item is ChatMessage => item !== null);

  if (parsed.length === 0) {
    throw new Error("messages must include at least one valid message");
  }

  return parsed;
}

function parseLocale(value: unknown): "en" | "ar" {
  return value === "ar" ? "ar" : "en";
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const payload = await req.json();
    const messages = parseMessages((payload as Record<string, unknown>).messages);
    const channel = normalizeDrRoseChannel(
      (payload as Record<string, unknown>).channel,
    );
    const locale = parseLocale((payload as Record<string, unknown>).locale);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = buildDrRoseSystemPrompt({
      channel: channel as DrRoseChannel,
      locale,
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
            ...messages,
          ],
          stream: true,
        }),
      },
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({
            error: "Rate limit exceeded. Please try again in a moment.",
          }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable." }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Failed to get response" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": "text/event-stream",
        "X-Dr-Rose-Channel": channel,
      },
    });
  } catch (error) {
    console.error("Beauty assistant error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
