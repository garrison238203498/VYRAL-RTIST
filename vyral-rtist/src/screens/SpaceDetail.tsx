import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useSpace } from "../lib/data";
import { motion } from "../lib/motion";
import { CheckPop } from "../components/MicroFx";
import { dotClass } from "./Home";
import type { Json } from "../types/database";

const tabs = ["All", "Notes", "Tasks", "Sessions"] as const;

export default function SpaceDetail() {
  const { id } = useParams();
  const { space, notes, tasks, sessions, toggleTask } = useSpace(id);
  const [tab, setTab] = useState<(typeof tabs)[number]>("All");

  if (!space) {
    return (
      <div className="grid h-full place-items-center px-5 pt-12 text-white/40">
        <span>·</span>
      </div>
    );
  }

  const isCreative = space.kind === "creative";

  return (
    <div className="pb-4">
      <header
        className={`relative overflow-hidden border-b border-white/5 px-5 pb-5 pt-4 bg-gradient-to-b ${headerGradient(space.accent)}`}
      >
        {isCreative && (
          <>
            <img
              src="/hero/creative.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/65 to-ink-950" />
          </>
        )}
        <div className="relative z-10">
          <div className="ml-12 flex items-center gap-2">
            <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${dotClass(space.accent)}`}>
              {space.kind}
            </span>
            {space.pinned && (
              <span className="text-[9px] uppercase tracking-[0.25em] text-white/45">pinned</span>
            )}
          </div>
          <h1 className="mt-3 font-display text-[26px] font-semibold leading-tight tracking-tight">
            {space.name}
          </h1>
          <p className="mt-1 text-[13px] text-white/65">{space.reason}</p>

          {(space.signals ?? []).length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {(space.signals ?? []).map((s) => (
                <span
                  key={s}
                  className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/70"
                >
                  {s}
                </span>
              ))}
            </div>
          )}

          {space.next_action && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] p-3 backdrop-blur-xl">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-violet-electric to-cyan-glow text-ink-950">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" />
                </svg>
              </span>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">AI next</div>
                <div className="text-[13px] text-white/85">{space.next_action}</div>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="sticky top-12 z-30 border-b border-white/5 bg-ink-950/85 px-5 py-2 backdrop-blur-xl">
        <div className="grid grid-cols-4 gap-1 rounded-xl border border-white/8 bg-white/[0.025] p-1">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`rounded-lg py-1.5 text-[12px] font-medium transition ${
                tab === t ? "bg-white/10 text-white" : "text-white/55"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4">
        {(tab === "All" || tab === "Notes") && notes.length > 0 && (
          <>
            <SectionLabel>Notes · {notes.length}</SectionLabel>
            <ul className="space-y-2.5">
              {notes.map((n) => (
                <li
                  key={n.id}
                  className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
                >
                  <div className="mb-1 flex items-center gap-2 text-[10px] text-white/45">
                    <SourceBadge source={n.source} />
                    <span>{prettyTime(n.captured_at)}</span>
                  </div>
                  {n.handwritten ? (
                    <p className="handwriting text-[22px] leading-tight text-white/85">"{n.text}"</p>
                  ) : (
                    <p className="text-[14px] text-white/80">{n.text}</p>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}

        {(tab === "All" || tab === "Tasks") && tasks.length > 0 && (
          <>
            <SectionLabel>Tasks · {tasks.filter((t) => !t.done).length} open</SectionLabel>
            <ul className="space-y-2">
              {tasks.map((t) => (
                <motion.li
                  key={t.id}
                  layout
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
                >
                  <button onClick={() => toggleTask(t.id, !t.done)} aria-label="toggle task">
                    <CheckPop active={!!t.done} />
                  </button>
                  <span className={`flex-1 text-[14px] ${t.done ? "text-white/40 line-through" : "text-white/90"}`}>
                    {t.text}
                  </span>
                  {t.due_at && !t.done && (
                    <span className="text-[10px] text-white/45">{relativeDue(t.due_at)}</span>
                  )}
                </motion.li>
              ))}
            </ul>
          </>
        )}

        {(tab === "All" || tab === "Sessions") && sessions.length > 0 && (
          <>
            <SectionLabel>Sessions · {sessions.length}</SectionLabel>
            <ul className="space-y-2">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Link
                    to={`/sessions/${s.id}`}
                    className="block rounded-2xl border border-cyan-glow/20 bg-cyan-glow/[0.04] p-3 active:scale-[0.99]"
                  >
                    <div className="flex items-center justify-between text-[10px] text-white/45">
                      <span className="uppercase tracking-[0.25em] text-cyan-glow">ROTIST</span>
                      <span>{prettyTime(s.started_at)}</span>
                    </div>
                    <div className="mt-1 font-display text-[15px] font-semibold text-white">{s.title}</div>
                    <div className="mt-2 grid grid-cols-4 gap-1.5">
                      <Mini v={`${s.duration_min ?? 0}m`} l="time" />
                      <Mini v={s.strokes ?? 0} l="strokes" />
                      <Mini v={s.summary_lifts ?? 0} l="lifts" tone="cyan" />
                      <Mini v={`+${s.grip_pressure_change ?? 0}%`} l="grip" tone="pink" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}

        {(tab === "All") && evolutionFromJson(space.evolution).length > 0 && (
          <>
            <SectionLabel>How it evolved</SectionLabel>
            <ol className="relative ml-2 space-y-3 border-l border-white/10 pl-4">
              {evolutionFromJson(space.evolution).map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[19px] top-1.5 h-2 w-2 rounded-full bg-violet-electric shadow-[0_0_8px_currentColor]" />
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">{e.date}</div>
                  <div className="text-[13px] text-white/80">{e.note}</div>
                </li>
              ))}
            </ol>
          </>
        )}

        <div className="mt-6 grid grid-cols-4 gap-2">
          <Action label="Rename" />
          <Action label="Merge" />
          <Action label="Split" />
          <Action label="Archive" tone="pink" />
        </div>
      </div>
    </div>
  );
}

function evolutionFromJson(j: Json | null): { date: string; note: string }[] {
  if (!Array.isArray(j)) return [];
  return j as { date: string; note: string }[];
}

function headerGradient(accent: "violet" | "cyan" | "pink" | "lime") {
  return {
    violet: "from-violet-electric/15 via-violet-electric/5 to-transparent",
    cyan: "from-cyan-glow/15 via-cyan-glow/5 to-transparent",
    pink: "from-pink-glow/15 via-pink-glow/5 to-transparent",
    lime: "from-lime-glow/15 via-lime-glow/5 to-transparent",
  }[accent];
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-5 text-[10px] uppercase tracking-[0.25em] text-white/40">{children}</div>
  );
}

function SourceBadge({ source }: { source: "rotist" | "quick" | "voice" }) {
  const map: Record<string, { label: string; cls: string }> = {
    rotist: { label: "ROTIST", cls: "border-cyan-glow/40 text-cyan-glow" },
    quick: { label: "QUICK", cls: "border-white/15 text-white/55" },
    voice: { label: "VOICE", cls: "border-pink-glow/40 text-pink-glow" },
  };
  const m = map[source];
  return <span className={`rounded border px-1.5 py-0.5 text-[9px] tracking-wider ${m.cls}`}>{m.label}</span>;
}

function Mini({
  v,
  l,
  tone = "neutral",
}: {
  v: React.ReactNode;
  l: string;
  tone?: "neutral" | "cyan" | "pink" | "lime";
}) {
  const colors: Record<string, string> = {
    neutral: "text-white",
    cyan: "text-cyan-glow",
    pink: "text-pink-glow",
    lime: "text-lime-glow",
  };
  return (
    <div className="rounded-md border border-white/8 bg-white/[0.025] py-1.5 text-center">
      <div className={`font-display text-[12px] font-semibold ${colors[tone]}`}>{v}</div>
      <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">{l}</div>
    </div>
  );
}

function Action({ label, tone = "neutral" }: { label: string; tone?: "neutral" | "pink" }) {
  return (
    <button
      className={`rounded-xl border py-2.5 text-[12px] font-medium ${
        tone === "pink"
          ? "border-pink-glow/30 bg-pink-glow/10 text-pink-glow"
          : "border-white/10 bg-white/[0.04] text-white/80"
      }`}
    >
      {label}
    </button>
  );
}

function prettyTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function relativeDue(iso: string) {
  const t = new Date(iso).getTime();
  const ms = t - Date.now();
  const days = Math.round(ms / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days < 0) return `${Math.abs(days)}d late`;
  return `${days}d`;
}
