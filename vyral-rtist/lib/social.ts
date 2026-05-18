// Read-side data layer for the social home. Wraps Supabase queries with
// safe fallbacks — every fetcher returns an empty/null result on error so
// the UI never crashes when a user is anon or the table is empty.

import { supabase, supabaseConfigured } from "./supabase";
import type { Challenge, Hashtag, Post, Profile } from "./database.types";

export type FeedPost = Post & {
  author: Pick<Profile, "id" | "username" | "display_name" | "avatar_url"> | null;
};

export async function fetchTrendingHashtags(limit = 3): Promise<Hashtag[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from("hashtags")
    .select("id, tag, post_count, created_at")
    .order("post_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[social] trending hashtags:", error.message);
    return [];
  }
  return data ?? [];
}

export async function fetchActiveChallenge(): Promise<Challenge | null> {
  if (!supabaseConfigured) return null;
  const nowIso = new Date().toISOString();
  const { data, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("status", "active")
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso)
    .order("starts_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.warn("[social] active challenge:", error.message);
    return null;
  }
  return data;
}

export async function fetchForYouFeed(limit = 10): Promise<FeedPost[]> {
  if (!supabaseConfigured) return [];
  // RLS handles visibility filtering — we just ask for recent non-removed posts.
  // Two-step: posts then profiles, because posts.author_id FKs to auth.users
  // (not directly to profiles), so PostgREST can't auto-embed.
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .is("removed_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.warn("[social] for-you feed:", error.message);
    return [];
  }
  if (!posts?.length) return [];

  const authorIds = Array.from(new Set(posts.map((p) => p.author_id)));
  const { data: authors, error: authorErr } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", authorIds);
  if (authorErr) {
    console.warn("[social] feed author lookup:", authorErr.message);
  }
  const byId = new Map((authors ?? []).map((a) => [a.id, a]));
  return posts.map((p) => ({ ...p, author: byId.get(p.author_id) ?? null }));
}

// Format the time remaining on a challenge as HH:MM:SS.
export function formatChallengeCountdown(endsAt: string | null | undefined): string {
  if (!endsAt) return "—:—:—";
  const ms = Math.max(0, new Date(endsAt).getTime() - Date.now());
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function pad(n: number): string {
  return n.toString().padStart(2, "0");
}
