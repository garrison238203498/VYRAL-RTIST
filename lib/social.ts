import { supabase, supabaseConfigured } from "./supabase";

export type FeedPost = {
  id: string;
  author_id: string;
  caption?: string | null;
  kind?: string;
  like_count: number;
  comment_count: number;
  created_at: string;
  removed_at?: string | null;
  author: { id: string; username?: string | null; display_name?: string | null; avatar_url?: string | null } | null;
};

export async function fetchTrendingHashtags(limit = 3): Promise<any[]> {
  if (!supabaseConfigured) return [];
  const { data, error } = await supabase
    .from("hashtags")
    .select("id, tag, post_count, created_at")
    .order("post_count", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.warn("[social] trending hashtags:", error.message); return []; }
  return data ?? [];
}

export async function fetchActiveChallenge(): Promise<any> {
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
  if (error) { console.warn("[social] active challenge:", error.message); return null; }
  return data;
}

export async function fetchForYouFeed(limit = 10): Promise<FeedPost[]> {
  if (!supabaseConfigured) return [];
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .is("removed_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) { console.warn("[social] for-you feed:", error.message); return []; }
  if (!posts?.length) return [];

  const authorIds = Array.from(new Set(posts.map((p: any) => p.author_id)));
  const { data: authors, error: authorErr } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .in("id", authorIds);
  if (authorErr) { console.warn("[social] feed author lookup:", authorErr.message); }
  const byId = new Map((authors ?? []).map((a: any) => [a.id, a]));
  return posts.map((p: any) => ({ ...p, author: byId.get(p.author_id) ?? null }));
}

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
