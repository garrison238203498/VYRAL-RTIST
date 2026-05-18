import {
  aiNotConfigured,
  corsHeaders,
  getOpenAIConfig,
  isAllowedClient,
  json,
  safeJsonParse,
  stripMarkdown,
} from "../_shared/openai.ts";

type SpaceVisualPayload = {
  space_name?: string;
  space_type?: string;
  reason?: string;
  themes?: string[];
  accent?: "violet" | "cyan" | "pink" | "lime";
  visual_prompt?: string;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  try {
    if (request.method !== "POST") {
      return json({ ok: false, code: "method_not_allowed", error: "Use POST for Space visuals.", request_id: requestId }, 405);
    }

    const allowedClientKeys = [Deno.env.get("SUPABASE_ANON_KEY"), Deno.env.get("SUPABASE_PUBLISHABLE_KEY")]
      .filter((value): value is string => Boolean(value));
    if (allowedClientKeys.length > 0 && !isAllowedClient(request, allowedClientKeys)) {
      return json({ ok: false, code: "unauthorized", error: "Missing or invalid Supabase publishable key.", request_id: requestId }, 401);
    }

    const { apiKey, imageModel } = getOpenAIConfig();
    if (!apiKey) return json({ ...aiNotConfigured(), request_id: requestId }, 503);

    const payload = safeJsonParse(await request.text()) as SpaceVisualPayload;
    const prompt = buildVisualPrompt(payload);
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: imageModel,
        prompt,
        size: "1024x1024",
        quality: "medium",
        n: 1,
      }),
    });

    const raw = await response.text();
    if (!response.ok) {
      return json({
        ok: true,
        visual: fallbackVisual(payload, prompt, "placeholder"),
        code: "image_generation_fallback",
        error: summarizeImageError(raw, response.status),
        request_id: response.headers.get("x-request-id") || requestId,
      });
    }

    const body = JSON.parse(raw) as { data?: Array<{ b64_json?: string; revised_prompt?: string }> };
    const image = body.data?.[0];
    return json({
      ok: true,
      visual: {
        ...fallbackVisual(payload, prompt, "generated"),
        image_base64: image?.b64_json || null,
        revised_prompt: stripMarkdown(image?.revised_prompt || prompt),
      },
      request_id: response.headers.get("x-request-id") || requestId,
    });
  } catch (error) {
    return json({
      ok: false,
      code: "space_visual_crash",
      error: error instanceof Error ? error.message : "Space visual function crashed.",
      request_id: requestId,
    }, 500);
  }
});

function buildVisualPrompt(payload: SpaceVisualPayload) {
  const spaceName = stripMarkdown(payload.space_name || "Adaptive Space");
  const type = stripMarkdown(payload.space_type || "life operating system");
  const reason = stripMarkdown(payload.reason || "");
  const themes = Array.isArray(payload.themes) ? payload.themes.map(stripMarkdown).filter(Boolean).join(", ") : "";
  const provided = stripMarkdown(payload.visual_prompt || "");
  return [
    provided || `A premium futuristic dark neon-glass cover image for ${spaceName}, a ${type} Space.`,
    reason ? `Context: ${reason}.` : "",
    themes ? `Themes: ${themes}.` : "",
    "Style: cinematic mobile app artwork, five-layer dark blue glass, restrained purple light, soft turquoise/cyan signal glow, calm, useful, refined.",
    "No text, no letters, no logos, no watermark, no UI labels, no signatures.",
  ].filter(Boolean).join(" ");
}

function fallbackVisual(payload: SpaceVisualPayload, prompt: string, status: "generated" | "placeholder") {
  const accent = payload.accent || "violet";
  const gradients = {
    violet: ["#020817", "#352069", "#5eead4"],
    cyan: ["#020817", "#0891b2", "#a78bfa"],
    pink: ["#020817", "#7c3aed", "#5eead4"],
    lime: ["#020817", "#22d3ee", "#6d4aff"],
  };
  return {
    id: `visual-${Date.now()}`,
    status,
    prompt,
    accent,
    gradient: gradients[accent],
    image_base64: null,
    revised_prompt: prompt,
  };
}

function summarizeImageError(raw: string, status: number) {
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    return parsed.error?.message || `OpenAI image generation failed with status ${status}.`;
  } catch {
    return `OpenAI image generation failed with status ${status}.`;
  }
}
