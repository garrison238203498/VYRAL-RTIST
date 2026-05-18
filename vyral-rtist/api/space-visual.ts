// Vercel fallback: POST /api/space-visual
// Supabase Edge Functions are primary. This exists only when Vercel is explicitly configured.

import type { VercelRequest, VercelResponse } from "@vercel/node";

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).send(JSON.stringify({ ok: false, error: "method_not_allowed" }));
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(503).send(JSON.stringify({
      ok: false,
      code: "ai_not_configured",
      error: "OPENAI_API_KEY is not set in Vercel environment variables.",
    }));
    return;
  }

  const body = typeof req.body === "object" && req.body ? req.body as Record<string, unknown> : {};
  const prompt = buildVisualPrompt(body);
  const response = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1",
      prompt,
      size: "1024x1024",
      quality: "medium",
      n: 1,
    }),
  });

  const raw = await response.text();
  if (!response.ok) {
    res.status(200).send(JSON.stringify({
      ok: true,
      visual: fallbackVisual(body, prompt, "placeholder"),
      code: "image_generation_fallback",
      error: summarizeImageError(raw, response.status),
    }));
    return;
  }

  const data = JSON.parse(raw) as { data?: Array<{ b64_json?: string; revised_prompt?: string }> };
  const image = data.data?.[0];
  res.status(200).send(JSON.stringify({
    ok: true,
    visual: {
      ...fallbackVisual(body, prompt, "generated"),
      image_base64: image?.b64_json || null,
      revised_prompt: clean(image?.revised_prompt || prompt),
    },
  }));
}

function buildVisualPrompt(body: Record<string, unknown>) {
  const spaceName = clean(body.space_name || "Adaptive Space");
  const type = clean(body.space_type || "life operating system");
  const reason = clean(body.reason || "");
  const themes = Array.isArray(body.themes) ? body.themes.map(clean).filter(Boolean).join(", ") : "";
  const provided = clean(body.visual_prompt || "");
  return [
    provided || `A premium futuristic dark neon-glass cover image for ${spaceName}, a ${type} Space.`,
    reason ? `Context: ${reason}.` : "",
    themes ? `Themes: ${themes}.` : "",
    "Style: cinematic mobile app artwork, five-layer dark blue glass, restrained purple light, soft turquoise/cyan signal glow, calm, useful, refined.",
    "No text, no letters, no logos, no watermark, no UI labels, no signatures.",
  ].filter(Boolean).join(" ");
}

function fallbackVisual(body: Record<string, unknown>, prompt: string, status: "generated" | "placeholder") {
  const accent = ["violet", "cyan", "pink", "lime"].includes(String(body.accent)) ? String(body.accent) : "violet";
  const gradients: Record<string, string[]> = {
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

function clean(value: unknown) {
  return String(value ?? "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[*_`~]/g, "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function summarizeImageError(raw: string, status: number) {
  try {
    const parsed = JSON.parse(raw) as { error?: { message?: string } };
    return parsed.error?.message || `OpenAI image generation failed with status ${status}.`;
  } catch {
    return `OpenAI image generation failed with status ${status}.`;
  }
}
