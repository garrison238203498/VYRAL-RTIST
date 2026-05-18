import { useState } from "react";
import { Link } from "react-router-dom";
import { useProfile, useSpaces, useTodayTasks, useInsights, useRecentSessions } from "../lib/data";
import { useAuth } from "../lib/auth";
import { supabase } from "../lib/supabase";
import { motion, TiltCard, Pressable } from "../lib/motion";
import { CheckPop, CapturePop, MicroToast, useToast } from "../components/MicroFx";

export default function Home() {
  const { user } = useAuth();
  const { profile } = useProfile();
  const { spaces } = useSpaces();
  const { tasks, toggle } = useTodayTasks();
  const { insights, dismiss } = useInsights();
  const recent = useRecentSessions(1);

  const [capture, setCapture] = useState("");
  const [pulse, setPulse] = useState(0);
  const toast = useToast();

  const pinned = spaces.filter((s) => s.pinned);
  const others = spaces.filter((s) => !s.pinned && s.status === "active");
  const insight = insights[0];
  const lastSession = recent[0];

  async function saveCapture() {
    if (!capture.trim() || !user) return;
    await supabase.from("notes").insert({
      user_id: user.id,
      text: capture.trim(),
      source: "quick",
      space_id: pinned[0]?.id ?? null,
    } as any);
    setCapture("");
    setPulse((p) => p + 1);
    toast.show("Saved · we'll suggest a Space later");
  }

  return (
    <div className="px-5 pt-2">
      <header className="mb-5">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">
          {greetingTime()}
        </div>
        <h1 className="mt-1.5 font-display text-[28px] leading-tight font-semibold tracking-tight">
          Hey {profile?.display_name ?? "you"}.
        </h1>
        <p className="mt-1 text-[14px] text-white/65">
          {profile?.pattern ?? "Let's see what kind of day you want this to be."}
        </p>
      </header>

      {/* Quick capture */}
      <div className="relative mb-4 rounded-2xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
        <CapturePop pulse={pulse} />
        <div className="flex items-center gap-2.5">
          <Pressable
            onClick={saveCapture}
            className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-electric to-cyan-glow text-ink-950"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </Pressable>
          <input
            value={capture}
            onChange={(e) => setCapture(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && saveCapture()}
            placeholder="Drop a thought, a lyric, a task…"
            className="flex-1 bg-transparent text-[15px] placeholder:text-white/30 focus:outline-none"
          />
          {capture && (
            <Pressable
              onClick={saveCapture}
              className="rounded-lg bg-violet-electric/30 px-3 py-1 text-xs font-medium text-white"
            >
              Save
            </Pressable>
          )}
        </div>
      </div>

      {/* Today */}
      <section className="mb-5">
        <SectionHeader label="Today" right={`${tasks.filter((t) => !t.done).length} left`} />
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-center text-[12px] text-white/45">
            Nothing pinned to today. Open a Space and add what's actually on your mind.
          </div>
        ) : (
          <ul className="space-y-2">
            {tasks.map((t) => {
              const space = spaces.find((s) => s.id === t.space_id);
              return (
                <motion.li
                  key={t.id}
                  layout
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
                >
                  <button onClick={() => toggle(t.id, !t.done)} aria-label="toggle task">
                    <CheckPop active={!!t.done} />
                  </button>
                  <span
                    className={`flex-1 text-[14px] ${
                      t.done ? "text-white/40 line-through" : "text-white/90"
                    }`}
                  >
                    {t.text}
                  </span>
                  {space && (
                    <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] ${dotClass(space.accent)}`}>
                      {space.name}
                    </span>
                  )}
                </motion.li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Insight */}
      {insight && (
        <section className="mb-5">
          <SectionHeader label="From Vyral" right={<button onClick={() => dismiss(insight.id)} className="text-white/40">Dismiss</button>} />
          <TiltCard className="relative block w-full overflow-hidden rounded-2xl border border-violet-electric/25 bg-violet-electric/[0.08] p-4 text-left">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-violet-electric/30">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" strokeLinecap="round" />
                </svg>
              </span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-violet-electric">{insight.tone}</span>
            </div>
            <h3 className="mt-2 font-display text-[16px] font-semibold leading-snug">
              {insight.title}
            </h3>
            <p className="mt-1 text-[13px] text-white/65">{insight.body}</p>
            {insight.cta_label && (
              <div className="mt-3 flex items-center gap-2">
                <span className="rounded-lg bg-gradient-to-r from-violet-electric to-cyan-glow px-3 py-1.5 text-xs font-medium text-ink-950">
                  {insight.cta_label}
                </span>
                {insight.cta_secondary && (
                  <span className="text-xs text-white/55">{insight.cta_secondary}</span>
                )}
              </div>
            )}
          </TiltCard>
        </section>
      )}

      {/* Pinned Spaces */}
      {pinned.length > 0 && (
        <section className="mb-5">
          <SectionHeader label="Pinned" right={<Link to="/spaces" className="text-cyan-glow">All</Link>} />
          <div className="-mx-5 overflow-x-auto px-5">
            <div className="flex gap-3 pb-1">
              {pinned.map((s) => (
                <Link key={s.id} to={`/spaces/${s.id}`} className="block">
                  <TiltCard
                    className={`relative w-[224px] shrink-0 overflow-hidden rounded-2xl border p-4 ${cardTone(s.accent)}`}
                  >
                    <SpaceMiniGlyph accent={s.accent} kind={s.kind} />
                    <span
                      className={`relative z-10 inline-block rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${dotClass(s.accent)}`}
                    >
                      {s.kind}
                    </span>
                    <div className="relative z-10 mt-2 font-display text-[16px] font-semibold leading-tight text-white">
                      {s.name}
                    </div>
                    <div className="relative z-10 mt-1 text-[11px] text-white/55">
                      {timeAgo(s.last_activity_at)} · {s.signals?.[0] ?? ""}
                    </div>
                    <div className="relative z-10 mt-3 line-clamp-2 text-[12px] text-white/70">
                      Next: {s.next_action}
                    </div>
                  </TiltCard>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Recent ROTIST */}
      {lastSession && (
        <section className="mb-5">
          <SectionHeader
            label="Recent session"
            right={<Link to={`/sessions/${lastSession.id}`} className="text-cyan-glow">Open</Link>}
          />
          <Link to={`/sessions/${lastSession.id}`} className="block">
            <TiltCard className="relative block overflow-hidden rounded-2xl border border-cyan-glow/25 bg-cyan-glow/[0.06] p-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-glow">ROTIST</span>
                <span className="text-[10px] text-white/40">·  {prettyDate(lastSession.started_at)}</span>
              </div>
              <div className="mt-1 font-display text-[16px] font-semibold text-white">
                {lastSession.title}
              </div>
              <div className="mt-3"><MiniWave /></div>
              <div className="mt-3 grid grid-cols-4 gap-2">
                <Mini v={`${lastSession.duration_min ?? 0}m`} l="time" />
                <Mini v={lastSession.strokes ?? 0} l="strokes" />
                <Mini v={lastSession.summary_lifts ?? 0} l="lifts" tone="cyan" />
                <Mini v={`+${lastSession.grip_pressure_change ?? 0}%`} l="grip" tone="pink" />
              </div>
            </TiltCard>
          </Link>
        </section>
      )}

      {/* Other Spaces */}
      {others.length > 0 && (
        <section className="mb-2">
          <SectionHeader label="Your Spaces" />
          <ul className="space-y-2">
            {others.map((s) => (
              <li key={s.id}>
                <Link to={`/spaces/${s.id}`} className="block">
                  <TiltCard
                    intensity={5}
                    className="relative flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.03] px-3 py-3"
                  >
                    <span className={`h-2 w-2 rounded-full ${dotBg(s.accent)} shadow-[0_0_10px_currentColor] ${dotText(s.accent)}`} />
                    <div className="flex-1">
                      <div className="text-[14px] font-medium text-white">{s.name}</div>
                      <div className="text-[11px] text-white/50">
                        {timeAgo(s.last_activity_at)} · {s.next_action}
                      </div>
                    </div>
                    <span className="text-white/30">›</span>
                  </TiltCard>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <MicroToast message={toast.message} />
    </div>
  );
}

function greetingTime() {
  const h = new Date().getHours();
  const day = new Date().toLocaleDateString(undefined, { weekday: "long" });
  const t = new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  const part = h < 5 ? "late night" : h < 12 ? "morning" : h < 18 ? "afternoon" : h < 22 ? "evening" : "night";
  return `${day} · ${t} · ${part}`;
}

function timeAgo(iso?: string | null) {
  if (!iso) return "—";
  const ms = Date.now() - new Date(iso).getTime();
  const m = Math.round(ms / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

function prettyDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const same = d.toDateString() === new Date().toDateString();
  return `${same ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" })}, ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

function SectionHeader({ label, right }: { label: string; right?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <h2 className="text-[10px] uppercase tracking-[0.25em] text-white/45">{label}</h2>
      {right && <div className="text-[11px] text-white/55">{right}</div>}
    </div>
  );
}

function Mini({ v, l, tone = "neutral" }: { v: React.ReactNode; l: string; tone?: "neutral" | "cyan" | "pink" | "violet" | "lime" }) {
  const colors: Record<string, string> = {
    neutral: "text-white",
    cyan: "text-cyan-glow",
    pink: "text-pink-glow",
    violet: "text-violet-electric",
    lime: "text-lime-glow",
  };
  return (
    <div className="rounded-lg border border-white/8 bg-white/[0.03] py-1.5 text-center">
      <div className={`font-display text-[14px] font-semibold ${colors[tone]}`}>{v}</div>
      <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">{l}</div>
    </div>
  );
}

export function dotClass(accent: "violet" | "cyan" | "pink" | "lime") {
  return {
    violet: "border-violet-electric/40 bg-violet-electric/10 text-violet-electric",
    cyan: "border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow",
    pink: "border-pink-glow/40 bg-pink-glow/10 text-pink-glow",
    lime: "border-lime-glow/40 bg-lime-glow/10 text-lime-glow",
  }[accent];
}
function dotText(accent: "violet" | "cyan" | "pink" | "lime") {
  return { violet: "text-violet-electric", cyan: "text-cyan-glow", pink: "text-pink-glow", lime: "text-lime-glow" }[accent];
}
function dotBg(accent: "violet" | "cyan" | "pink" | "lime") {
  return { violet: "bg-violet-electric", cyan: "bg-cyan-glow", pink: "bg-pink-glow", lime: "bg-lime-glow" }[accent];
}
export function cardTone(accent: "violet" | "cyan" | "pink" | "lime") {
  return {
    violet: "border-violet-electric/25 bg-violet-electric/[0.06]",
    cyan: "border-cyan-glow/25 bg-cyan-glow/[0.06]",
    pink: "border-pink-glow/25 bg-pink-glow/[0.06]",
    lime: "border-lime-glow/25 bg-lime-glow/[0.06]",
  }[accent];
}

function MiniWave() {
  return (
    <svg viewBox="0 0 320 60" className="w-full">
      <defs>
        <linearGradient id="hmw" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
      </defs>
      <path
        d="M0 40 C 30 10, 60 50, 90 30 S 150 10, 180 35 240 50, 270 25 300 5, 320 30"
        fill="none"
        stroke="url(#hmw)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function SpaceMiniGlyph({ accent, kind }: { accent: "violet" | "cyan" | "pink" | "lime"; kind: string }) {
  const stroke = { violet: "#a855f7", cyan: "#22d3ee", pink: "#ec4899", lime: "#a3e635" }[accent];
  return (
    <div className="absolute -right-3 -top-3 h-24 w-24 opacity-50 [mask-image:radial-gradient(circle_at_top_right,black_30%,transparent_70%)]">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        {kind === "creative" && (
          <g stroke={stroke} strokeWidth="0.8" fill="none">
            {Array.from({ length: 8 }).map((_, i) => (
              <path key={i} d={`M${i * 8} 100 Q ${50 + i * 4} ${60 - i * 4} ${110 - i * 4} ${10 + i * 6}`} />
            ))}
          </g>
        )}
        {kind === "school" && (
          <g stroke={stroke} strokeWidth="0.8" fill="none">
            {Array.from({ length: 6 }).map((_, i) => (
              <line key={i} x1="0" y1={20 + i * 15} x2="120" y2={20 + i * 15} />
            ))}
          </g>
        )}
        {kind === "writing" && (
          <g stroke={stroke} strokeWidth="0.8" fill="none">
            <circle cx="60" cy="60" r="50" />
            <circle cx="60" cy="60" r="34" />
            <circle cx="60" cy="60" r="18" />
          </g>
        )}
        {kind === "build" && (
          <g stroke={stroke} strokeWidth="0.8" fill="none">
            <rect x="20" y="20" width="80" height="80" />
            <line x1="20" y1="40" x2="100" y2="40" />
            <line x1="20" y1="60" x2="100" y2="60" />
            <line x1="20" y1="80" x2="100" y2="80" />
            <line x1="40" y1="20" x2="40" y2="100" />
            <line x1="60" y1="20" x2="60" y2="100" />
            <line x1="80" y1="20" x2="80" y2="100" />
          </g>
        )}
        {kind === "memory" && (
          <g stroke={stroke} strokeWidth="0.8" fill="none">
            <path d="M30 90 L60 30 L90 90" />
            <circle cx="60" cy="50" r="6" />
          </g>
        )}
        {kind === "social" && (
          <g stroke={stroke} strokeWidth="0.8" fill="none">
            <circle cx="40" cy="40" r="14" />
            <circle cx="80" cy="40" r="14" />
            <circle cx="60" cy="80" r="14" />
            <path d="M54 40 H66 M48 52 L60 70 M72 52 L60 70" />
          </g>
        )}
        {kind === "reset" && (
          <g stroke={stroke} strokeWidth="0.8" fill="none">
            <path d="M20 60 Q 60 0 100 60 T 180 60" transform="translate(-30,0)" />
          </g>
        )}
      </svg>
    </div>
  );
}
