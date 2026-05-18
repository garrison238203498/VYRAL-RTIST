import { Link, useParams } from "react-router-dom";
import { useSession } from "../lib/data";
import StrokeStream from "../components/StrokeStream";
import { dotClass } from "./Home";
import { useSpaces } from "../lib/data";
import { progressWidthClass } from "../lib/progressClass";
import type { Json } from "../types/database";

type SessionSummary = { title: string; body: string; keyTerms: string[]; questions: string[] };

export default function SessionDetail() {
  const { id } = useParams();
  const session = useSession(id);
  const { spaces } = useSpaces();
  if (!session) {
    return <div className="grid h-full place-items-center pt-12 text-white/40">·</div>;
  }
  const space = spaces.find((s) => s.id === session.space_id);
  const summary = (session.summary as Json as unknown as SessionSummary | null) ?? null;

  return (
    <div className="pb-4">
      <header className="border-b border-white/5 px-5 pb-4 pt-4">
        <div className="ml-12 flex items-center gap-2">
          <span className="rounded-full border border-cyan-glow/40 bg-cyan-glow/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cyan-glow">
            ROTIST
          </span>
          {space && (
            <Link
              to={`/spaces/${space.id}`}
              className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${dotClass(space.accent)}`}
            >
              {space.name}
            </Link>
          )}
        </div>
        <h1 className="mt-3 font-display text-[24px] font-semibold tracking-tight">{session.title}</h1>
        <div className="mt-1 text-[12px] text-white/50">{prettyDate(session.started_at)}</div>
      </header>

      <div className="px-5 pt-4">
        <div className="mb-4 grid grid-cols-4 gap-2">
          <Mini v={`${session.duration_min ?? 0}m`} l="time" />
          <Mini v={session.strokes ?? 0} l="strokes" />
          <Mini v={session.hesitation_clusters ?? 0} l="hesitations" />
          <Mini
            v={`+${session.grip_pressure_change ?? 0}%`}
            l="grip"
            tone={(session.grip_pressure_change ?? 0) > 12 ? "pink" : "lime"}
          />
        </div>

        <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-3">
          <div className="mb-2 text-[10px] uppercase tracking-[0.25em] text-white/45">
            What ROTIST captured
          </div>
          <StrokeStream height={140} paused />
        </div>

        {(session.transcript ?? []).length > 0 && (
          <>
            <SectionLabel>Transcript</SectionLabel>
            <div className="mb-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4">
              <ul className="space-y-2.5">
                {(session.transcript ?? []).map((line, i) => (
                  <li key={i} className="handwriting text-[20px] leading-tight text-white/85">
                    "{line}"
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {summary && (
          <>
            <SectionLabel>AI summary</SectionLabel>
            <div className="mb-4 rounded-2xl border border-cyan-glow/25 bg-cyan-glow/[0.05] p-4">
              <div className="font-display text-[16px] font-semibold text-white">{summary.title}</div>
              <p className="mt-1 text-[13px] text-white/70">{summary.body}</p>
              {summary.keyTerms?.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {summary.keyTerms.map((k) => (
                    <span key={k} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/75">
                      {k}
                    </span>
                  ))}
                </div>
              )}
              {summary.questions?.length > 0 && (
                <ol className="mt-3 list-decimal space-y-1 pl-4 text-[13px] text-white/80">
                  {summary.questions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              )}
            </div>
          </>
        )}

        <SectionLabel>How writing felt</SectionLabel>
        <div className="mb-4 grid grid-cols-2 gap-2">
          <Block
            label="Fatigue"
            value={`${Math.round((session.fatigue_score ?? 0) * 100)}%`}
            tone="violet"
            note={(session.fatigue_score ?? 0) > 0.5 ? "rose toward end" : "steady"}
            barPct={(session.fatigue_score ?? 0) * 100}
          />
          <Block
            label="Mood Δ"
            value={`${(session.mood_delta ?? 0) > 0 ? "+" : ""}${(session.mood_delta ?? 0).toFixed(2)}`}
            tone={(session.mood_delta ?? 0) < 0 ? "pink" : "lime"}
            note={(session.mood_delta ?? 0) < 0 ? "may indicate tension" : "calm + flow"}
            barPct={Math.abs(session.mood_delta ?? 0) * 100}
          />
          {session.confidence_drop && (
            <div className="col-span-2 rounded-xl border border-pink-glow/25 bg-pink-glow/[0.06] px-3 py-2.5 text-[12px] text-white/80">
              <span className="text-pink-glow">Confidence dipped</span> in the {session.confidence_drop}.
              Vyral may suggest a guided layout next session.
            </div>
          )}
        </div>

        <SectionLabel>What this became</SectionLabel>
        <ul className="mb-5 space-y-2">
          <Outcome label={`${session.tasks_extracted ?? 0} tasks`} desc="added to this Space" tone="lime" />
          <Outcome label={`${session.review_cards_suggested ?? 0} review cards`} desc="from the summary" tone="cyan" />
          <Outcome label={`${session.summary_lifts ?? 0} summary lift`} desc="circle + flick gesture" tone="violet" />
        </ul>

        <div className="grid grid-cols-2 gap-2">
          <button className="rounded-xl bg-gradient-to-r from-violet-electric to-cyan-glow py-3 text-[13px] font-medium text-ink-950">
            Save to Life & Legacy
          </button>
          <button className="rounded-xl border border-white/10 bg-white/[0.04] py-3 text-[13px] text-white/85">
            Convert to project
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-2 mt-4 text-[10px] uppercase tracking-[0.25em] text-white/45">{children}</div>
  );
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
      <div className={`font-display text-[13px] font-semibold ${colors[tone]}`}>{v}</div>
      <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">{l}</div>
    </div>
  );
}

function Block({
  label,
  value,
  note,
  tone,
  barPct,
}: {
  label: string;
  value: string;
  note: string;
  tone: "violet" | "cyan" | "pink" | "lime";
  barPct: number;
}) {
  const cls = {
    violet: "from-violet-electric to-pink-glow text-violet-electric",
    cyan: "from-cyan-glow to-violet-electric text-cyan-glow",
    pink: "from-pink-glow to-violet-electric text-pink-glow",
    lime: "from-lime-glow to-cyan-glow text-lime-glow",
  }[tone];
  const fill = cls.split(" ").slice(0, 2).join(" ");
  const text = cls.split(" ")[2];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
      <div className={`mt-0.5 font-display text-[18px] font-semibold ${text}`}>{value}</div>
      <div className="mt-2 h-1 rounded-full bg-white/5">
        <div className={`h-1 rounded-full bg-gradient-to-r ${fill} ${progressWidthClass(barPct)}`} />
      </div>
      <div className="mt-1 text-[10px] text-white/45">{note}</div>
    </div>
  );
}

function Outcome({
  label,
  desc,
  tone,
}: {
  label: string;
  desc: string;
  tone: "violet" | "cyan" | "pink" | "lime";
}) {
  const dot = { violet: "bg-violet-electric text-violet-electric", cyan: "bg-cyan-glow text-cyan-glow", pink: "bg-pink-glow text-pink-glow", lime: "bg-lime-glow text-lime-glow" }[tone];
  return (
    <li className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5">
      <span className={`h-2 w-2 rounded-full ${dot} shadow-[0_0_8px_currentColor]`} />
      <div className="flex-1">
        <div className="text-[14px] font-medium text-white">{label}</div>
        <div className="text-[11px] text-white/55">{desc}</div>
      </div>
    </li>
  );
}

function prettyDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString(undefined, { weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}
