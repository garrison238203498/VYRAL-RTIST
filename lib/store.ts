import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase, supabaseConfigured } from "./supabase";

export const STORE_KEYS = {
  approvedSpaces: "vyral.approvedSpaces",
  legacy: "vyral.legacy",
  themes: "vyral.themes",
  recentIntakes: "vyral.recentIntakes",
  navigationPattern: "vyral.navigationPattern",
  affinityProfile: "vyral.affinityProfile",
  userName: "vyral.userName",
} as const;

export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function writeJson<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* swallow */
  }
}

export type ApprovedSpace = {
  id: string;
  name: string;
  kind: string;
  accent: "violet" | "cyan" | "pink" | "lime";
  reason: string;
  summaries: Array<{ title: string; body: string; savedAt: string }>;
  tasks: Array<{ id: string; text: string; due_relative: string | null; done: boolean }>;
  themes: Array<{ name: string; weight: number }>;
  visual?: {
    id: string;
    status: "generated" | "placeholder";
    prompt: string;
    accent: "violet" | "cyan" | "pink" | "lime";
    gradient: string[];
    revised_prompt: string;
  };
  createdAt: string;
};

export type LegacyEntry = {
  id: string;
  savedAt: string;
  title: string;
  body: string;
  kind: string;
  sourceVibe: string;
};

export function mergeThemes(
  current: Array<{ name: string; weight: number }>,
  incoming: Array<{ name: string; weight: number }>
) {
  const map = new Map(current.map((t) => [t.name, t.weight]));
  for (const t of incoming) {
    map.set(t.name, Math.max(map.get(t.name) ?? 0, t.weight));
  }
  return Array.from(map, ([name, weight]) => ({ name, weight })).sort((a, b) => b.weight - a.weight);
}

export function slugifySpaceId(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return slug ? `space-${slug}` : `space-${Date.now()}`;
}

export async function trackScreen(screen: string) {
  try {
    const nav = await readJson<{
      first_screens?: string[];
      last_screens?: string[];
      most_visited?: string[];
      counts?: Record<string, number>;
      session_started_at?: string;
    }>(STORE_KEYS.navigationPattern, {});
    const counts = { ...(nav.counts || {}) };
    counts[screen] = (counts[screen] || 0) + 1;
    const first_screens = nav.first_screens?.length ? nav.first_screens : [screen];
    const last_screens = [screen, ...(nav.last_screens || []).filter((s) => s !== screen)].slice(0, 10);
    const most_visited = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
    await writeJson(STORE_KEYS.navigationPattern, {
      first_screens,
      last_screens,
      most_visited,
      counts,
      session_started_at: nav.session_started_at || new Date().toISOString(),
    });

    if (supabaseConfigured) {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        await supabase.from("ai_navigation_events").insert({
          user_id: data.user.id,
          screen,
          event_type: "view",
          metadata: { counts, most_visited },
        } as any);
      }
    }
  } catch {
    /* swallow */
  }
}
