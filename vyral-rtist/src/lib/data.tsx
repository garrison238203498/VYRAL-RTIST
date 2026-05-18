// Data hooks against Supabase. Each hook reads/writes the user's own rows under RLS.
import { useCallback, useEffect, useState } from "react";
import { supabase } from "./supabase";
import { useAuth } from "./auth";
import type {
  GoalRow,
  InsightRow,
  LegacyRow,
  NoteRow,
  PenStateRow,
  PreferencesRow,
  ProfileRow,
  SessionRow,
  SpaceRow,
  TaskRow,
} from "../types/database";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!cancelled) {
          setProfile(data);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const update = useCallback(
    async (patch: Partial<ProfileRow>) => {
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .update(patch as any)
        .eq("id", user.id)
        .select("*")
        .maybeSingle();
      if (data) setProfile(data);
    },
    [user]
  );

  return { profile, loading, update };
}

export function useSpaces() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<SpaceRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("spaces")
      .select("*")
      .eq("user_id", user.id)
      .order("pinned", { ascending: false })
      .order("last_activity_at", { ascending: false });
    setSpaces(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  return { spaces, loading, refresh };
}

export function useSpace(id?: string) {
  const { user } = useAuth();
  const [space, setSpace] = useState<SpaceRow | null>(null);
  const [notes, setNotes] = useState<NoteRow[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!id || !user) return;
    const [s, n, t, sess] = await Promise.all([
      supabase.from("spaces").select("*").eq("id", id).maybeSingle(),
      supabase.from("notes").select("*").eq("space_id", id).order("captured_at", { ascending: false }),
      supabase.from("tasks").select("*").eq("space_id", id).order("done").order("created_at", { ascending: false }),
      supabase.from("sessions").select("*").eq("space_id", id).order("started_at", { ascending: false }),
    ]);
    setSpace(s.data);
    setNotes(n.data ?? []);
    setTasks(t.data ?? []);
    setSessions(sess.data ?? []);
    setLoading(false);
  }, [id, user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const toggleTask = useCallback(
    async (taskId: string, done: boolean) => {
      await supabase
        .from("tasks")
        .update({ done, done_at: done ? new Date().toISOString() : null } as any)
        .eq("id", taskId);
      setTasks((cur) => cur.map((t) => (t.id === taskId ? { ...t, done } : t)));
    },
    []
  );

  return { space, notes, tasks, sessions, loading, refresh, toggleTask };
}

export function useTodayTasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  const refresh = useCallback(async () => {
    if (!user) return;
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const tomorrow = new Date(todayStart);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const { data } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", user.id)
      .or(`due_at.lt.${tomorrow.toISOString()},due_at.is.null`)
      .order("done")
      .limit(6);
    setTasks((data ?? []).slice(0, 5));
  }, [user]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const toggle = useCallback(async (taskId: string, done: boolean) => {
    await supabase
      .from("tasks")
      .update({ done, done_at: done ? new Date().toISOString() : null } as any)
      .eq("id", taskId);
    setTasks((cur) => cur.map((t) => (t.id === taskId ? { ...t, done } : t)));
  }, []);

  return { tasks, refresh, toggle };
}

export function useGoals() {
  const { user } = useAuth();
  const [goals, setGoals] = useState<GoalRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("goals")
      .select("*")
      .eq("user_id", user.id)
      .order("status")
      .order("created_at", { ascending: false });
    setGoals(data ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) refresh();
  }, [user, refresh]);

  const createGoal = useCallback(
    async (input: {
      title: string;
      target_value: number;
      kind: GoalRow["kind"];
      unit?: string;
      why?: string | null;
      space_id?: string | null;
      deadline?: string | null;
    }) => {
      if (!user) return null;
      const { data } = await supabase
        .from("goals")
        .insert({ ...input, user_id: user.id, current_value: 0, status: "active" } as any)
        .select("*")
        .maybeSingle();
      if (data) setGoals((cur) => [data, ...cur]);
      return data;
    },
    [user]
  );

  // bumpProgress returns the updated goal so the caller can detect completion.
  const bumpProgress = useCallback(
    async (goalId: string, amount: number) => {
      const current = goals.find((g) => g.id === goalId);
      if (!current) return null;
      const next = (current.current_value ?? 0) + amount;
      const { data } = await supabase
        .from("goals")
        .update({ current_value: next } as any)
        .eq("id", goalId)
        .select("*")
        .maybeSingle();
      if (data) setGoals((cur) => cur.map((g) => (g.id === goalId ? data : g)));
      return data;
    },
    [goals]
  );

  return { goals, loading, refresh, createGoal, bumpProgress };
}

export function useLegacy() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LegacyRow[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("life_legacy")
      .select("*")
      .eq("user_id", user.id)
      .order("occurred_at", { ascending: false })
      .then(({ data }) => setEntries(data ?? []));
  }, [user]);
  return entries;
}

export function useInsights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<InsightRow[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("dismissed", false)
      .order("created_at", { ascending: false })
      .then(({ data }) => setInsights(data ?? []));
  }, [user]);

  const dismiss = useCallback(async (id: string) => {
    await supabase.from("ai_insights").update({ dismissed: true } as any).eq("id", id);
    setInsights((cur) => cur.filter((i) => i.id !== id));
  }, []);

  return { insights, dismiss };
}

export function usePenState() {
  const { user } = useAuth();
  const [pen, setPen] = useState<PenStateRow | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase.from("pen_state").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setPen(data));
  }, [user]);
  return pen;
}

export function usePreferences() {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<PreferencesRow | null>(null);
  useEffect(() => {
    if (!user) return;
    supabase.from("preferences").select("*").eq("user_id", user.id).maybeSingle().then(({ data }) => setPrefs(data));
  }, [user]);

  const update = useCallback(
    async (patch: Partial<PreferencesRow>) => {
      if (!user) return;
      const { data } = await supabase
        .from("preferences")
        .update(patch as any)
        .eq("user_id", user.id)
        .select("*")
        .maybeSingle();
      if (data) setPrefs(data);
    },
    [user]
  );

  return { prefs, update };
}

export function useSession(id?: string) {
  const [session, setSession] = useState<SessionRow | null>(null);
  useEffect(() => {
    if (!id) return;
    supabase.from("sessions").select("*").eq("id", id).maybeSingle().then(({ data }) => setSession(data));
  }, [id]);
  return session;
}

export function useRecentSessions(limit = 3) {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  useEffect(() => {
    if (!user) return;
    supabase
      .from("sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(limit)
      .then(({ data }) => setSessions(data ?? []));
  }, [user, limit]);
  return sessions;
}
