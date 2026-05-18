import OpenAI from "openai";

// Server-only OpenAI client. Never import this from anywhere under /src or /app.
// Reads the API key from the Vercel environment.

let cached: OpenAI | null = null;

export function getClient(): OpenAI | null {
  if (cached) return cached;
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  cached = new OpenAI({ apiKey });
  return cached;
}

// Override via Vercel env var OPENAI_MODEL.
// gpt-4o-mini is the cost-efficient default for optional Vercel fallback,
// fully multimodal for images and supports structured outputs via response_format.
// Upgrade to "gpt-4o" or "gpt-4.1" for higher quality intake parsing.
export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const NOT_CONFIGURED_RESPONSE = {
  ok: false as const,
  error:
    "AI is not configured. The owner of this Vyral instance needs to set OPENAI_API_KEY in Vercel environment variables.",
  code: "ai_not_configured",
};
