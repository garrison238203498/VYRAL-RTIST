import { Platform } from "react-native";
import { File as ExpoFile } from "expo-file-system";
import { apiBase, supabase, supabaseConfigured } from "./supabase";

export type IntakeFile = {
  filename: string;
  media_type: string;
  uri: string;
  size: number;
};

export type IntakePayload = {
  filename: string;
  media_type: string;
  base64: string;
};

export type IntakeResult = {
  input_read?: {
    source_types: string[];
    visible_text: string;
    file_observations: string[];
    confidence: number;
    limitations: string[];
  };
  summary: {
    title: string;
    body: string;
    key_terms: string[];
  };
  tasks: Array<{ text: string; due_relative: string | null }>;
  themes: Array<{ name: string; weight: number }>;
  suggested_space: {
    mode: "use_existing" | "create_new";
    existing_space_id: string | null;
    name: string;
    kind: string;
    accent: "violet" | "cyan" | "pink" | "lime";
    reason: string;
  };
  legacy_candidate: {
    should_save: boolean;
    title: string | null;
    body: string | null;
    kind: string | null;
  };
  user_fit?: {
    matched_patterns: string[];
    personalization_moves: string[];
    suggested_next_screen: string;
    adaptation_reason: string;
  };
  space_dashboard?: {
    primary_label: string;
    dashboard_cards: Array<{ label: string; value: string; why: string }>;
  };
  vibe: string;
  visual_prompt?: string;
};

export type UserContext = {
  user_first_name?: string;
  spaces?: Array<{ id: string; name: string; kind: string; accent: string; reason?: string }>;
  recent_themes?: string[];
  recent_intakes?: Array<{ vibe: string; summary_title: string }>;
  navigation_pattern?: {
    first_screens?: string[];
    last_screens?: string[];
    most_visited?: string[];
  };
};

export async function fileToPayload(file: IntakeFile): Promise<IntakePayload> {
  const base64 =
    Platform.OS === "web" ? await webUriToBase64(file.uri) : await new ExpoFile(file.uri).base64();
  return {
    filename: file.filename,
    media_type: file.media_type,
    base64,
  };
}

async function webUriToBase64(uri: string): Promise<string> {
  // Strip an existing data: prefix so callers get raw base64.
  if (uri.startsWith("data:")) {
    const comma = uri.indexOf(",");
    return comma >= 0 ? uri.slice(comma + 1) : "";
  }
  const blob = await (await fetch(uri)).blob();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(reader.error || new Error("Failed to read file."));
    reader.readAsDataURL(blob);
  });
  const comma = dataUrl.indexOf(",");
  return comma >= 0 ? dataUrl.slice(comma + 1) : "";
}

export async function runIntake({
  text,
  files,
  userContext,
}: {
  text: string;
  files: IntakeFile[];
  userContext: UserContext;
}): Promise<IntakeResult> {
  const payloads = await Promise.all(files.map(fileToPayload));
  const body = {
    text,
    files: payloads,
    user_context: userContext,
  };

  let supabaseError: unknown = null;
  if (supabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke("intake", { body });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Supabase intake failed.");
      return data.intake as IntakeResult;
    } catch (err) {
      supabaseError = err;
    }
  }

  if (!apiBase) {
    throw supabaseError instanceof Error
      ? supabaseError
      : new Error("Supabase AI is not configured and no Vercel fallback URL is set.");
  }

  const res = await fetch(`${apiBase}/api/intake`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const responseBody = await res.json();
  if (!res.ok || !responseBody.ok) {
    throw new Error(responseBody.error || `Intake failed (${res.status}).`);
  }
  return responseBody.intake as IntakeResult;
}

export type AffinityProfile = {
  archetype: string;
  signals: Array<{ name: string; evidence: string }>;
  resonance_pattern: string;
  ideal_collaborator_traits: string[];
  one_thing_to_build_on: string;
  honesty_note: string;
  data_points: number;
};

export async function runAffinity({
  userName,
  userData,
}: {
  userName: string;
  userData: {
    themes: Array<{ name: string; weight: number }>;
    spaces: Array<{ name: string; kind: string; reason?: string; signals?: string[] }>;
    recent_intakes: Array<{ vibe: string; summary_title: string }>;
    navigation_pattern: { first_screens?: string[]; last_screens?: string[]; most_visited?: string[] };
  };
}): Promise<AffinityProfile> {
  const requestBody = { user_first_name: userName, user_data: userData };

  let supabaseError: unknown = null;
  if (supabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke("affinity", { body: requestBody });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Supabase affinity failed.");
      return data.profile as AffinityProfile;
    } catch (err) {
      supabaseError = err;
    }
  }

  if (!apiBase) {
    throw supabaseError instanceof Error
      ? supabaseError
      : new Error("Supabase AI is not configured and no Vercel fallback URL is set.");
  }

  const res = await fetch(`${apiBase}/api/affinity`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });
  const responseBody = await res.json();
  if (!res.ok || !responseBody.ok) {
    throw new Error(responseBody.error || `Affinity failed (${res.status}).`);
  }
  return responseBody.profile as AffinityProfile;
}

export type GeneratedSpaceVisual = {
  id: string;
  status: "generated" | "placeholder";
  prompt: string;
  accent: "violet" | "cyan" | "pink" | "lime";
  gradient: string[];
  image_base64: string | null;
  revised_prompt: string;
};

export async function runSpaceVisual(input: {
  space_name: string;
  space_type: string;
  reason: string;
  themes: string[];
  accent: "violet" | "cyan" | "pink" | "lime";
  visual_prompt?: string;
}): Promise<GeneratedSpaceVisual> {
  let supabaseError: unknown = null;
  if (supabaseConfigured) {
    try {
      const { data, error } = await supabase.functions.invoke("space-visual", { body: input });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || "Space visual generation failed.");
      return data.visual as GeneratedSpaceVisual;
    } catch (err) {
      supabaseError = err;
    }
  }

  if (!apiBase) {
    throw supabaseError instanceof Error
      ? supabaseError
      : new Error("Supabase AI is not configured and no Vercel fallback URL is set.");
  }

  const res = await fetch(`${apiBase}/api/space-visual`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const body = await res.json();
  if (!res.ok || !body.ok) {
    throw new Error(body.error || `Space visual failed (${res.status}).`);
  }
  return body.visual as GeneratedSpaceVisual;
}

export async function persistApprovedIntakeToSupabase({
  intake,
  includedTaskIndexes,
  saveLegacy,
  originalText,
}: {
  intake: IntakeResult;
  includedTaskIndexes: number[];
  saveLegacy: boolean;
  originalText: string;
}) {
  if (!supabaseConfigured) return { skipped: true as const };
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return { skipped: true as const };

  const spaceId = await ensureSpaceForIntake(user.id, intake);
  const now = new Date().toISOString();
  const includedTasks = intake.tasks.filter((_, index) => includedTaskIndexes.includes(index));

  await Promise.all([
    originalText || intake.summary.body
      ? supabase.from("notes").insert({
          user_id: user.id,
          space_id: spaceId,
          text: originalText || intake.summary.body,
          source: "quick",
          handwritten: intake.input_read?.source_types?.some((source) => source.includes("image")) || false,
        } as any)
      : Promise.resolve(),
    includedTasks.length
      ? supabase.from("tasks").insert(
          includedTasks.map((task) => ({
            user_id: user.id,
            space_id: spaceId,
            text: task.text,
            due_at: null,
            done: false,
          })) as any
        )
      : Promise.resolve(),
    saveLegacy && (intake.legacy_candidate.title || intake.summary.title)
      ? supabase.from("life_legacy").insert({
          user_id: user.id,
          space_id: spaceId,
          kind: normalizeLegacyKind(intake.legacy_candidate.kind),
          title: intake.legacy_candidate.title || intake.summary.title,
          body: intake.legacy_candidate.body || intake.summary.body,
          accent: intake.suggested_space.accent,
          occurred_at: now,
        } as any)
      : Promise.resolve(),
  ]);

  return { skipped: false as const, spaceId };
}

async function ensureSpaceForIntake(userId: string, intake: IntakeResult) {
  const suggested = intake.suggested_space;
  let existingId: string | null = null;

  if (suggested.mode === "use_existing") {
    const byId = isUuid(suggested.existing_space_id) ? suggested.existing_space_id : null;
    if (byId) {
      const { data } = await supabase
        .from("spaces")
        .select("id")
        .eq("user_id", userId)
        .eq("id", byId)
        .maybeSingle();
      existingId = data?.id ?? null;
    }
    if (!existingId) {
      const { data } = await supabase
        .from("spaces")
        .select("id")
        .eq("user_id", userId)
        .eq("name", suggested.name)
        .maybeSingle();
      existingId = data?.id ?? null;
    }
  }

  if (existingId) {
    await supabase
      .from("spaces")
      .update({
        last_activity_at: new Date().toISOString(),
        next_action: intake.tasks[0]?.text || null,
        signals: intake.themes.map((theme) => theme.name),
      } as any)
      .eq("id", existingId)
      .eq("user_id", userId);
    return existingId;
  }

  const { data, error } = await supabase
    .from("spaces")
    .insert({
      user_id: userId,
      name: suggested.name,
      kind: normalizeSpaceKind(suggested.kind),
      status: "active",
      accent: suggested.accent,
      reason: suggested.reason,
      signals: intake.themes.map((theme) => theme.name),
      next_action: intake.tasks[0]?.text || null,
      pinned: false,
      evolution: [
        {
          at: new Date().toISOString(),
          type: "ai_intake",
          title: intake.summary.title,
          visual_prompt: intake.visual_prompt || null,
        },
      ],
    } as any)
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

function normalizeSpaceKind(value: string) {
  const allowed = new Set(["creative", "school", "writing", "social", "reset", "legacy", "build", "memory", "reflection"]);
  return allowed.has(value) ? value : "memory";
}

function normalizeLegacyKind(value: string | null) {
  const allowed = new Set(["milestone", "summary", "pattern", "session", "evolution"]);
  return value && allowed.has(value) ? value : "summary";
}

function isUuid(value: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}
