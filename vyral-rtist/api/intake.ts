// Vercel serverless function: POST /api/intake
// Server-only OpenAI call. Accepts messy text plus optional image/PDF/text files
// (base64-encoded) and returns structured JSON, validated against the Zod schema.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { getClient, MODEL, NOT_CONFIGURED_RESPONSE } from "./_lib/openai.js";
import { IntakeResultSchema, type IntakeResult } from "./_lib/schemas.js";

export const maxDuration = 60;

type IntakeFilePayload = {
  filename?: string;
  media_type?: string;
  base64?: string;
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    sendJson(res, 405, { ok: false, error: "method_not_allowed" });
    return;
  }

  const client = getClient();
  if (!client) {
    sendJson(res, 503, NOT_CONFIGURED_RESPONSE);
    return;
  }

  const body = coerceBody(req.body);
  const text = typeof body.text === "string" ? body.text.trim() : "";
  const files: IntakeFilePayload[] = Array.isArray(body.files) ? body.files : [];
  const userContext =
    typeof body.user_context === "object" && body.user_context ? body.user_context : {};

  if (!text && files.length === 0) {
    sendJson(res, 400, { ok: false, error: "Need at least text or one file." });
    return;
  }

  const payloadBytes = Buffer.byteLength(JSON.stringify({ text, files }), "utf8");
  if (payloadBytes > 4_000_000) {
    sendJson(res, 413, {
      ok: false,
      code: "payload_too_large",
      error:
        "This upload is too large for the current Vercel intake route. Try a smaller crop, screenshot, or single PDF page.",
      payload_bytes: payloadBytes,
    });
    return;
  }

  const userParts = await buildUserMessageContent(files, text);
  if (userParts.length === 0) {
    sendJson(res, 400, {
      ok: false,
      error: "No readable text, image, PDF, or text file was received.",
    });
    return;
  }

  const spacesContext = JSON.stringify(
    asArray((userContext as any).spaces).map((space: any) => ({
      id: space.id,
      name: space.name,
      kind: space.kind,
      accent: space.accent,
      reason: space.reason,
    })),
    null,
    2
  );
  const themesContext = asArray((userContext as any).recent_themes).join(", ") || "(none yet)";
  const recentIntakesContext = JSON.stringify(
    asArray((userContext as any).recent_intakes),
    null,
    2
  );
  const navigationContext = JSON.stringify(
    (userContext as any).navigation_pattern ?? {},
    null,
    2
  );
  const userName = (userContext as any).user_first_name || "the user";

  const system = `You are Vyral's intake interpreter. Vyral is a mobile life OS for ambitious teens: creators, makers, students, neurodivergent kids who think in fragments. Your job: take messy input and return structured JSON the user can approve.

The user is ${userName}.

Existing Spaces:
${spacesContext}

Recent themes:
${themesContext}

Recent intakes:
${recentIntakesContext}

Navigation & behavior hints:
${navigationContext}

NON-NEGOTIABLE RULES:
1. NO clichés. NO motivational filler. NO therapy-speak. NO medical claims.
2. If a file or image is included, input_read.visible_text must describe what you can actually see. If handwriting is unclear, say so directly.
3. Only extract tasks the user clearly intended. Never invent obligations.
4. Use an existing Space if the evidence fits. Otherwise create a specific new Space (never "Misc", "Inbox", "Notes").
5. Themes should be lowercase 1-2 word tags that can accumulate across intakes.
6. user_fit.personalization_moves must be REAL product behavior Vyral can use now, such as: surface a Space first, offer guided layout, ask for approval before saving to Legacy, group future uploads, dim non-essential UI, etc.
7. space_dashboard.dashboard_cards must be grounded in the input and useful in a real dashboard.
8. Be honest about confidence and limitations. Never fake certainty from blurry/cropped input.
9. visual_prompt must describe a premium dark neon-glass Space cover with no text, logos, or watermarks.

Accent mapping: violet (intuition / reflection / creative), cyan (clarity / study / focus), pink (raw expression / music / late-night), lime (action / build / social).`;

  try {
    const completion = await client.chat.completions.parse({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userParts as any },
      ],
      response_format: zodResponseFormat(IntakeResultSchema, "vyral_intake"),
    });

    const parsed = (completion.choices[0]?.message?.parsed as IntakeResult | null) ?? null;
    if (!parsed) {
      sendJson(res, 502, {
        ok: false,
        code: "schema_parse_failed",
        error: "OpenAI responded, but Vyral could not shape the output into the intake schema.",
        refusal: completion.choices[0]?.message?.refusal ?? null,
      });
      return;
    }

    sendJson(res, 200, {
      ok: true,
      intake: parsed,
      usage: completion.usage,
      model: completion.model,
    });
  } catch (err: unknown) {
    const status = err instanceof OpenAI.APIError ? err.status ?? 500 : 500;
    sendJson(res, status, {
      ok: false,
      code: err instanceof OpenAI.APIError ? "openai_api_error" : "intake_failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

// Build OpenAI multimodal content. Images become image_url data URIs.
// PDFs and text files are read server-side and inlined as text.
async function buildUserMessageContent(
  files: IntakeFilePayload[],
  text: string
): Promise<OpenAI.Chat.ChatCompletionContentPart[]> {
  const parts: OpenAI.Chat.ChatCompletionContentPart[] = [];

  for (const file of files.slice(0, 4)) {
    if (!file.base64 || !file.media_type) continue;
    const filename = file.filename || "upload";

    if (file.media_type.startsWith("image/")) {
      parts.push({
        type: "text",
        text: `Image uploaded by the user. Filename: ${filename}. Read any visible text or handwriting and describe what you actually see. Then organize it for Vyral.`,
      });
      parts.push({
        type: "image_url",
        image_url: {
          url: `data:${file.media_type};base64,${file.base64}`,
          detail: "high",
        },
      });
      continue;
    }

    if (file.media_type === "application/pdf") {
      try {
        // pdf-parse v2 — class-based API. Lazy-load to keep cold-starts fast.
        const { PDFParse } = await import("pdf-parse");
        const buf = Buffer.from(file.base64, "base64");
        const parser = new PDFParse({ data: new Uint8Array(buf) });
        const result = await parser.getText();
        const cleaned = (result.text || "").trim().slice(0, 30_000);
        parts.push({
          type: "text",
          text: `--- PDF uploaded: ${filename} ---\n${cleaned || "(PDF text could not be extracted)"}`,
        });
      } catch (e) {
        parts.push({
          type: "text",
          text: `--- PDF uploaded: ${filename} (text extraction failed: ${
            e instanceof Error ? e.message : "unknown"
          }) ---`,
        });
      }
      continue;
    }

    if (file.media_type === "text/plain") {
      const decoded = Buffer.from(file.base64, "base64").toString("utf-8").slice(0, 18_000);
      parts.push({
        type: "text",
        text: `--- Text file: ${filename} ---\n${decoded}`,
      });
    }
  }

  if (text) {
    parts.push({ type: "text", text: `--- Typed capture ---\n${text}` });
  }

  return parts;
}

function sendJson(res: VercelResponse, status: number, payload: unknown) {
  res.status(status).send(JSON.stringify(payload));
}

function coerceBody(body: unknown): Record<string, any> {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return typeof body === "object" ? (body as Record<string, any>) : {};
}

function asArray(value: unknown): any[] {
  return Array.isArray(value) ? value : [];
}
