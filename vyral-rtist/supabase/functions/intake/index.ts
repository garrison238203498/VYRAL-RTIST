import {
  aiNotConfigured,
  asRecord,
  callStructuredOpenAI,
  clampNumber,
  corsHeaders,
  decodeBase64Text,
  getOpenAIConfig,
  isAllowedClient,
  json,
  safeJsonParse,
  sanitizeStringArray,
  stripMarkdown,
  userIdFromAuthHeader,
} from "../_shared/openai.ts";
import { accents, intakeJsonSchema, spaceKinds } from "../_shared/schemas.ts";

type IntakeFile = {
  filename: string;
  media_type: string;
  base64: string;
};

type IntakePayload = {
  text?: string;
  files?: IntakeFile[];
  anon_session_id?: string;
  user_context?: {
    user_first_name?: string;
    spaces?: Array<{ id: string; name: string; kind: string; accent: string; reason?: string }>;
    recent_themes?: string[];
    recent_intakes?: Array<{ vibe: string; summary_title: string }>;
    recent_outputs?: Array<{ title: string; suggested_space: string; themes: string[] }>;
    navigation_pattern?: unknown;
  };
};

const maxPayloadBytes = 4_000_000;

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  try {
    if (request.method !== "POST") {
      return json({ ok: false, code: "method_not_allowed", error: "Use POST for Vyral intake.", request_id: requestId }, 405);
    }

    const allowedClientKeys = [Deno.env.get("SUPABASE_ANON_KEY"), Deno.env.get("SUPABASE_PUBLISHABLE_KEY")]
      .filter((value): value is string => Boolean(value));
    if (allowedClientKeys.length > 0 && !isAllowedClient(request, allowedClientKeys)) {
      return json({ ok: false, code: "unauthorized", error: "Missing or invalid Supabase publishable key.", request_id: requestId }, 401);
    }

    const { apiKey, model } = getOpenAIConfig();
    if (!apiKey) return json({ ...aiNotConfigured(), request_id: requestId }, 503);

    const raw = await request.text();
    if (raw.length > maxPayloadBytes) {
      return json({
        ok: false,
        code: "payload_too_large",
        error: "This intake is too large. Try a smaller image, PDF, or text file.",
        payload_bytes: raw.length,
        request_id: requestId,
      }, 413);
    }

    const payload = safeJsonParse(raw) as IntakePayload;
    const text = stripMarkdown(payload.text || "");
    const files = Array.isArray(payload.files) ? payload.files.slice(0, 4) : [];
    if (!text && files.length === 0) {
      return json({ ok: false, code: "empty_intake", error: "Add typed text, a file, or a camera capture before analyzing.", request_id: requestId }, 400);
    }

    const userId = await userIdFromAuthHeader(request);
    const openai = await callStructuredOpenAI({
      apiKey,
      model,
      schemaName: "vyral_intake",
      schema: intakeJsonSchema,
      system: buildSystemPrompt(),
      content: buildContentParts(text, files, payload.user_context),
      maxTokens: 4200,
    });

    if (!openai.ok) {
      return json({
        ok: false,
        code: "openai_api_error",
        error: openai.error,
        request_id: openai.requestId || requestId,
      }, openai.status);
    }

    const intake = normalizeIntake(openai.parsed, text, files);
    await storeIntake({ ...payload, text }, intake, userId, openai.requestId || requestId);

    return json({
      ok: true,
      intake,
      model: openai.model || model,
      usage: openai.usage || null,
      request_id: openai.requestId || requestId,
    });
  } catch (error) {
    return json({
      ok: false,
      code: "supabase_intake_crash",
      error: error instanceof Error ? error.message : "Supabase intake function crashed.",
      request_id: requestId,
    }, 500);
  }
});

function buildSystemPrompt() {
  return [
    "You are Vyral's background intelligence. You are not a chatbot.",
    "Transform messy user input into structure the user can approve, edit, save, or dismiss.",
    "Use only typed text, visible image content, readable file text, existing Spaces, previous outputs, and navigation patterns supplied in the request.",
    "Be honest about uncertainty. If an image, handwriting, or PDF is blurry, cropped, unsupported, or unreadable, say that directly in limitations.",
    "Extract only real intended tasks. Never invent obligations.",
    "Suggest an existing Space when evidence fits. Otherwise create a specific Space name. Never use Misc, Inbox, or Notes.",
    "Write clean UI-ready text. No markdown, asterisks, headings, code fences, therapy language, diagnosis, or fake motivational filler.",
    "visual_prompt must describe a premium dark neon-glass Space cover image with no embedded text, no watermark, and no fake logos.",
    "The future friend-finding idea is only an honest affinity signal. Do not invent people or matches.",
  ].join(" ");
}

function buildContentParts(text: string, files: IntakeFile[], context: IntakePayload["user_context"]) {
  const content: Array<{ type: "text"; text: string } | { type: "image_url"; image_url: { url: string; detail: "high" } }> = [
    {
      type: "text",
      text: JSON.stringify({
        typed_text: text,
        user_context: context || {},
        instruction: "Analyze this for Vyral's flow: capture -> input read -> summary -> tasks -> suggested Space -> user approval -> Life & Legacy if meaningful.",
      }),
    },
  ];

  for (const file of files) {
    const filename = stripMarkdown(file.filename || "upload");
    const mediaType = file.media_type || "application/octet-stream";
    content.push({ type: "text", text: `Uploaded file: ${filename} (${mediaType}).` });

    if (mediaType.startsWith("image/") && file.base64) {
      content.push({
        type: "image_url",
        image_url: { url: `data:${mediaType};base64,${file.base64}`, detail: "high" },
      });
      continue;
    }

    if (mediaType === "text/plain" && file.base64) {
      content.push({ type: "text", text: `Text file contents:\n${decodeBase64Text(file.base64).slice(0, 18_000)}` });
      continue;
    }

    if (mediaType === "application/pdf") {
      content.push({
        type: "text",
        text: "PDF upload received. If readable text is not available through this request, acknowledge that limitation and organize from filename plus typed context only.",
      });
    }
  }

  return content;
}

function normalizeIntake(input: unknown, text: string, files: IntakeFile[]) {
  const data = asRecord(input);
  const inputRead = asRecord(data.input_read);
  const summary = asRecord(data.summary);
  const suggested = asRecord(data.suggested_space);
  const legacy = asRecord(data.legacy_candidate);
  const fit = asRecord(data.user_fit);
  const dashboard = asRecord(data.space_dashboard);

  const kind = spaceKinds.includes(stripMarkdown(suggested.kind) as typeof spaceKinds[number])
    ? stripMarkdown(suggested.kind)
    : "memory";
  const accent = accents.includes(stripMarkdown(suggested.accent) as typeof accents[number])
    ? stripMarkdown(suggested.accent)
    : "cyan";

  const normalized = {
    input_read: {
      source_types: sanitizeStringArray(inputRead.source_types, files.length ? ["file"] : ["typed_text"]),
      visible_text: stripMarkdown(inputRead.visible_text) || text || files.map((file) => file.filename).join(", "),
      file_observations: sanitizeStringArray(inputRead.file_observations, files.map((file) => `${file.filename}: received`)),
      confidence: clampNumber(inputRead.confidence, files.length ? 0.68 : 0.86),
      limitations: sanitizeStringArray(inputRead.limitations),
    },
    summary: {
      title: stripMarkdown(summary.title) || "Organized Intake",
      body: stripMarkdown(summary.body) || text || "Vyral organized the uploaded material into a usable Space candidate.",
      key_terms: sanitizeStringArray(summary.key_terms).slice(0, 8),
    },
    tasks: normalizeTasks(data.tasks),
    themes: normalizeThemes(data.themes),
    suggested_space: {
      mode: stripMarkdown(suggested.mode) === "use_existing" ? "use_existing" : "create_new",
      existing_space_id: typeof suggested.existing_space_id === "string" ? stripMarkdown(suggested.existing_space_id) || null : null,
      name: stripMarkdown(suggested.name) || "Fresh Signal",
      kind,
      accent,
      reason: stripMarkdown(suggested.reason) || "Built from the current input.",
    },
    legacy_candidate: {
      should_save: Boolean(legacy.should_save),
      title: legacy.title === null ? null : stripMarkdown(legacy.title),
      body: legacy.body === null ? null : stripMarkdown(legacy.body),
      kind: legacy.kind === null ? null : stripMarkdown(legacy.kind) || null,
    },
    user_fit: {
      matched_patterns: sanitizeStringArray(fit.matched_patterns),
      personalization_moves: sanitizeStringArray(fit.personalization_moves, ["Keep Capture central for this user."]),
      suggested_next_screen: stripMarkdown(fit.suggested_next_screen) || "capture",
      adaptation_reason: stripMarkdown(fit.adaptation_reason) || "The current signal came from intake activity.",
    },
    space_dashboard: {
      primary_label: stripMarkdown(dashboard.primary_label) || "Space dashboard",
      dashboard_cards: normalizeDashboardCards(dashboard.dashboard_cards),
    },
    vibe: stripMarkdown(data.vibe) || "clear",
    visual_prompt: stripMarkdown(data.visual_prompt) || `A cinematic dark neon-glass Space cover for ${stripMarkdown(suggested.name) || "organized life material"}, no text, no watermark.`,
  };

  return normalized;
}

function normalizeTasks(value: unknown) {
  return Array.isArray(value)
    ? value.slice(0, 10).map((item) => {
      const task = asRecord(item);
      return {
        text: stripMarkdown(task.text),
        due_relative: task.due_relative === null ? null : stripMarkdown(task.due_relative) || null,
      };
    }).filter((task) => task.text)
    : [];
}

function normalizeThemes(value: unknown) {
  return Array.isArray(value)
    ? value.slice(0, 8).map((item) => {
      const theme = asRecord(item);
      return {
        name: stripMarkdown(theme.name).toLowerCase().slice(0, 32),
        weight: clampNumber(theme.weight, 0.5),
      };
    }).filter((theme) => theme.name)
    : [];
}

function normalizeDashboardCards(value: unknown) {
  return Array.isArray(value)
    ? value.slice(0, 4).map((item) => {
      const card = asRecord(item);
      return {
        label: stripMarkdown(card.label),
        value: stripMarkdown(card.value),
        why: stripMarkdown(card.why),
      };
    }).filter((card) => card.label && card.value)
    : [];
}

async function storeIntake(payload: IntakePayload, intake: ReturnType<typeof normalizeIntake>, userId: string | null, requestId: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) return;

  const files = Array.isArray(payload.files) ? payload.files : [];
  const nav = payload.user_context?.navigation_pattern;
  const navItems = Array.isArray(nav)
    ? nav.map(String)
    : sanitizeStringArray([
      ...(asRecord(nav).first_screens as string[] || []),
      ...(asRecord(nav).last_screens as string[] || []),
      ...(asRecord(nav).most_visited as string[] || []),
    ]);

  await fetch(`${supabaseUrl}/rest/v1/ai_intakes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: serviceRoleKey,
      authorization: `Bearer ${serviceRoleKey}`,
      prefer: "return=minimal",
    },
    body: JSON.stringify({
      user_id: userId,
      anon_session_id: payload.anon_session_id || null,
      input_text: payload.text || "",
      file_names: files.map((file) => file.filename),
      output: intake,
      themes: intake.themes.map((theme) => theme.name),
      navigation_pattern: navItems,
      request_id: requestId,
    }),
  });
}
