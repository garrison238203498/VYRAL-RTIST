export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string; detail?: "low" | "high" | "auto" } };

type JsonSchema = Record<string, unknown>;

export function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

export function getOpenAIConfig() {
  const apiKey = Deno.env.get("OPENAI_API_KEY") || "";
  const model = Deno.env.get("OPENAI_MODEL") || "gpt-4o-mini";
  const imageModel = Deno.env.get("OPENAI_IMAGE_MODEL") || "gpt-image-1";
  return { apiKey, model, imageModel };
}

export function aiNotConfigured() {
  return {
    ok: false,
    code: "ai_not_configured",
    error: "OPENAI_API_KEY is not set in Supabase Edge Function secrets.",
  };
}

export async function callStructuredOpenAI({
  apiKey,
  model,
  schemaName,
  schema,
  system,
  content,
  maxTokens = 3000,
}: {
  apiKey: string;
  model: string;
  schemaName: string;
  schema: JsonSchema;
  system: string;
  content: ChatContentPart[];
  maxTokens?: number;
}) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: system },
        { role: "user", content },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: schemaName,
          strict: true,
          schema,
        },
      },
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    return {
      ok: false as const,
      status: response.status,
      error: summarizeOpenAIError(raw, response.status),
      requestId: response.headers.get("x-request-id"),
    };
  }

  const body = JSON.parse(raw) as {
    model?: string;
    usage?: unknown;
    choices?: Array<{ message?: { content?: string; refusal?: string | null } }>;
  };
  const message = body.choices?.[0]?.message;
  if (message?.refusal) {
    return {
      ok: false as const,
      status: 400,
      error: message.refusal,
      requestId: response.headers.get("x-request-id"),
    };
  }

  const parsed = JSON.parse(message?.content || "{}");
  return {
    ok: true as const,
    parsed,
    model: body.model,
    usage: body.usage,
    requestId: response.headers.get("x-request-id"),
  };
}

export function stripMarkdown(value: unknown): string {
  return String(value ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`~]/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*[-•]\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeStringArray(value: unknown, fallback: string[] = []) {
  if (!Array.isArray(value)) return fallback;
  return value.map(stripMarkdown).filter(Boolean).slice(0, 8);
}

export function clampNumber(value: unknown, fallback: number, min = 0, max = 1) {
  const n = typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(max, Math.max(min, n));
}

export function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

export function safeJsonParse(raw: string) {
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function decodeBase64Text(base64: string) {
  try {
    return new TextDecoder().decode(Uint8Array.from(atob(base64), (char) => char.charCodeAt(0)));
  } catch {
    return "";
  }
}

export function isAllowedClient(request: Request, expectedKeys: string[]) {
  const apikey = request.headers.get("apikey");
  const authorization = request.headers.get("authorization") || "";
  const bearer = authorization.toLowerCase().startsWith("bearer ") ? authorization.slice(7) : "";
  return expectedKeys.some((key) => apikey === key || bearer === key);
}

export async function userIdFromAuthHeader(request: Request) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const authorization = request.headers.get("authorization");
  if (!supabaseUrl || !serviceRoleKey || !authorization) return null;

  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: serviceRoleKey,
        authorization,
      },
    });
    if (!response.ok) return null;
    const user = await response.json() as { id?: string };
    return user.id || null;
  } catch {
    return null;
  }
}

function summarizeOpenAIError(raw: string, status: number) {
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    return parsed.error?.message || `OpenAI request failed with status ${status}.`;
  } catch {
    return `OpenAI request failed with status ${status}.`;
  }
}
