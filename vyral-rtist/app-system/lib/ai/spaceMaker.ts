import { buildSpaceMakerPrompt } from "./promptTemplates";
import { sanitizeAIText, sanitizeList } from "./textSanitizer";
import type { GeneratedSpace, SpaceMakerInput, SpaceMakerResult, SpaceTask } from "./types";
import { generateSpaceImage } from "./imageProvider";
import { fallbackGenerateSpace } from "../mock/fallbackGenerators";

const env = (globalThis as typeof globalThis & { process?: { env?: Record<string, string | undefined> } }).process?.env || {};
const supabaseUrl = (env.EXPO_PUBLIC_SUPABASE_URL || env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const publishableKey = env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY || env.EXPO_PUBLIC_SUPABASE_ANON_KEY || env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export async function makeSpace(input: SpaceMakerInput): Promise<SpaceMakerResult> {
  const prompt = buildSpaceMakerPrompt(input);
  if (supabaseUrl && publishableKey) {
    try {
      const response = await fetch(`${supabaseUrl}/functions/v1/intake`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: publishableKey,
          Authorization: `Bearer ${publishableKey}`,
        },
        body: JSON.stringify({
          text: `${input.text}\n\n${prompt.user}`,
          files: [],
          anon_session_id: "prototype-space-maker",
          user_context: {
            spaces: input.recentActivity.spaces,
            recent_themes: input.recentActivity.legacyEntries,
            recent_outputs: [],
            navigation_pattern: ["vyral", "koi", "rotist"],
          },
        }),
      });
      const body = await response.json();
      if (response.ok && body?.ok && body.intake) {
        return normalizeServerIntake(body.intake, input);
      }
    } catch {
      // Fall through to local intelligence. The prototype should never break when AI infra is absent.
    }
  }
  return fallbackGenerateSpace(input);
}

function normalizeServerIntake(intake: Record<string, unknown>, input: SpaceMakerInput): Promise<GeneratedSpace> {
  const suggested = asRecord(intake.suggested_space);
  const summary = asRecord(intake.summary);
  const tasks = Array.isArray(intake.tasks) ? intake.tasks : [];
  const spaceType = sanitizeAIText(suggested.kind) || "adaptive_space";
  const visualPrompt =
    sanitizeAIText(intake.visualPrompt) ||
    `A cinematic neon-glass Space for ${sanitizeAIText(suggested.name) || "organized life material"}, dark navy, premium, calm, no text.`;

  return generateSpaceImage(visualPrompt, { spaceType }).then((visual): GeneratedSpace => ({
    id: `space-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    spaceName: sanitizeAIText(suggested.name) || sanitizeAIText(summary.title) || "Adaptive Space",
    spaceType,
    description: sanitizeAIText(summary.body) || "A focused Space generated from the current intake.",
    reason: sanitizeAIText(suggested.reason) || "VYRAL found related signals that belong together.",
    detectedPatterns: sanitizeList(toThemeNames(intake.themes), ["pattern forming"]),
    sourceSignals: [
      ...sanitizeList(asRecord(intake.input_read).source_types),
      ...input.files.map((file) => file.name),
    ].slice(0, 5),
    tasks: tasks.map((item): SpaceTask => {
      const task = asRecord(item);
      return {
      title: sanitizeAIText(task.text || task.title) || "Review this signal",
      priority: task.priority === "low" || task.priority === "high" ? task.priority : "medium",
      estimatedMinutes: Number(task.estimatedMinutes || task.estimated_minutes || 12),
    };
    }),
    nextActions: sanitizeList(asRecord(intake.user_fit).personalization_moves, ["Create Space", "Review tasks"]),
    relatedFiles: input.files.map((file) => file.name),
    relatedRotistSessions: input.rotistSessionSummary ? ["Current ROTIST writing session"] : [],
    relatedKoiSessions: input.koiReflection ? ["Latest KOI reflection"] : [],
    lifeLegacyEntry: sanitizeAIText(asRecord(intake.legacy_candidate).body || asRecord(intake.legacy_candidate).title) || "Created a new adaptive Space.",
    visualPrompt,
    animationTheme: suggested.kind === "reset_reflection" ? "koi_ripple" : suggested.kind === "rotist_trace" ? "rotist_trace" : "space_bloom",
    visual,
    createdAt: new Date().toISOString(),
  }));
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function toThemeNames(value: unknown) {
  return Array.isArray(value)
    ? value.map((item) => sanitizeAIText(asRecord(item).name))
    : [];
}
