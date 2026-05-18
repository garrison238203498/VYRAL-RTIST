import {
  aiNotConfigured,
  asRecord,
  callStructuredOpenAI,
  corsHeaders,
  getOpenAIConfig,
  isAllowedClient,
  json,
  safeJsonParse,
  sanitizeStringArray,
  stripMarkdown,
} from "../_shared/openai.ts";
import { affinityJsonSchema } from "../_shared/schemas.ts";

type AffinityPayload = {
  user_first_name?: string;
  user_data?: {
    themes?: Array<{ name: string; weight: number }>;
    spaces?: Array<{ name: string; kind: string; reason?: string; signals?: string[] }>;
    recent_intakes?: Array<{ vibe: string; summary_title: string }>;
    navigation_pattern?: {
      first_screens?: string[];
      last_screens?: string[];
      most_visited?: string[];
    };
  };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const requestId = crypto.randomUUID();
  try {
    if (request.method !== "POST") {
      return json({ ok: false, code: "method_not_allowed", error: "Use POST for Vyral affinity.", request_id: requestId }, 405);
    }

    const allowedClientKeys = [Deno.env.get("SUPABASE_ANON_KEY"), Deno.env.get("SUPABASE_PUBLISHABLE_KEY")]
      .filter((value): value is string => Boolean(value));
    if (allowedClientKeys.length > 0 && !isAllowedClient(request, allowedClientKeys)) {
      return json({ ok: false, code: "unauthorized", error: "Missing or invalid Supabase publishable key.", request_id: requestId }, 401);
    }

    const { apiKey, model } = getOpenAIConfig();
    if (!apiKey) return json({ ...aiNotConfigured(), request_id: requestId }, 503);

    const payload = safeJsonParse(await request.text()) as AffinityPayload;
    const userData = asRecord(payload.user_data);
    const themes = Array.isArray(userData.themes) ? userData.themes : [];
    const spaces = Array.isArray(userData.spaces) ? userData.spaces : [];
    const recentIntakes = Array.isArray(userData.recent_intakes) ? userData.recent_intakes : [];
    const navigationPattern = asRecord(userData.navigation_pattern);
    const dataPoints =
      themes.length +
      spaces.length +
      recentIntakes.length +
      sanitizeStringArray(navigationPattern.first_screens).length +
      sanitizeStringArray(navigationPattern.last_screens).length;

    const openai = await callStructuredOpenAI({
      apiKey,
      model,
      schemaName: "vyral_affinity",
      schema: affinityJsonSchema,
      system: buildSystemPrompt(dataPoints, payload.user_first_name || "the user"),
      content: [
        {
          type: "text",
          text: JSON.stringify({
            themes,
            spaces,
            recent_intakes: recentIntakes,
            navigation_pattern: navigationPattern,
            data_points: dataPoints,
          }),
        },
      ],
      maxTokens: 2600,
    });

    if (!openai.ok) {
      return json({
        ok: false,
        code: "openai_api_error",
        error: openai.error,
        request_id: openai.requestId || requestId,
      }, openai.status);
    }

    const profile = normalizeAffinity(openai.parsed, dataPoints);
    return json({
      ok: true,
      profile,
      model: openai.model || model,
      usage: openai.usage || null,
      request_id: openai.requestId || requestId,
    });
  } catch (error) {
    return json({
      ok: false,
      code: "supabase_affinity_crash",
      error: error instanceof Error ? error.message : "Supabase affinity function crashed.",
      request_id: requestId,
    }, 500);
  }
});

function buildSystemPrompt(dataPoints: number, userName: string) {
  const volume =
    dataPoints < 5
      ? "This is very little data. Say that clearly."
      : dataPoints < 20
      ? "This is an early signal. Say that it is still forming."
      : dataPoints < 50
      ? "This is a developing signal. Be moderately confident."
      : "This is a strong signal. Still avoid pretending to know everything.";

  return [
    "You are Vyral's affinity reader. You are not a chatbot and not a therapist.",
    `User name: ${stripMarkdown(userName)}.`,
    volume,
    "Produce an honest profile from real Spaces, themes, intakes, and navigation patterns.",
    "This may later help users find compatible collaborators only with explicit consent.",
    "Do not invent friend matches, identities, diagnoses, or private traits.",
    "No markdown, no archetype cliches, no motivational filler.",
  ].join(" ");
}

function normalizeAffinity(input: unknown, dataPoints: number) {
  const data = asRecord(input);
  const signals = Array.isArray(data.signals)
    ? data.signals.slice(0, 5).map((item) => {
      const signal = asRecord(item);
      return {
        name: stripMarkdown(signal.name),
        evidence: stripMarkdown(signal.evidence),
      };
    }).filter((signal) => signal.name && signal.evidence)
    : [];

  return {
    archetype: stripMarkdown(data.archetype) || "Pattern still forming",
    signals,
    resonance_pattern: stripMarkdown(data.resonance_pattern) || "There is not enough approved activity yet for a strong read.",
    ideal_collaborator_traits: sanitizeStringArray(data.ideal_collaborator_traits).slice(0, 5),
    one_thing_to_build_on: stripMarkdown(data.one_thing_to_build_on) || "Capture a few more real inputs before using this for matching.",
    honesty_note: stripMarkdown(data.honesty_note) || `Built from ${dataPoints} data points.`,
    data_points: dataPoints,
  };
}
