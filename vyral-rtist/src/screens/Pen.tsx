import { Link } from "react-router-dom";
import { usePenState, useRecentSessions, useProfile } from "../lib/data";
import { TiltCard, motion } from "../lib/motion";

export default function Pen() {
  const pen = usePenState();
  const { profile } = useProfile();
  const sessions = useRecentSessions(3);

  return (
    <div className="px-5 pt-2">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">ROTIST</div>
          <h1 className="mt-1 font-display text-[26px] font-semibold tracking-tight">Your pen</h1>
        </div>
        {profile?.rotist_serial && (
          <span className="font-mono text-[10px] text-white/35">{profile.rotist_serial}</span>
        )}
      </header>

      <TiltCard className="mb-4 overflow-hidden rounded-3xl border border-white/8 bg-gradient-to-b from-white/[0.05] to-white/[0.02] p-4">
        <PenIllustration />
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Big v={`${pen?.battery ?? 0}%`} l="battery" tone="cyan" sub="~9h" />
          <Big v={`${pen?.ink_remaining_percent ?? 0}%`} l="ink" tone="violet" sub={`${pen?.ink_predicted_days ?? 0}d`} />
          <Big v={pen?.echo_grip_auth === "matched" ? "✓" : "—"} l="grip auth" tone="lime" sub={profile?.display_name ?? ""} />
        </div>
      </TiltCard>

      <div className="mb-4 grid grid-cols-2 gap-2">
        <Link
          to="/pen/live"
          className="block rounded-2xl bg-gradient-to-br from-cyan-glow to-violet-electric px-4 py-4 text-ink-950 shadow-glow-cyan active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-950/20">
              <span className="h-2 w-2 rounded-full bg-ink-950" />
            </span>
            <span className="text-[10px] uppercase tracking-[0.25em] opacity-70">start</span>
          </div>
          <div className="mt-1 font-display text-[16px] font-semibold">Writing session</div>
          <div className="text-[11px] opacity-75">stream · auto-save</div>
        </Link>
        <Link
          to="/pen/conductor"
          className="block rounded-2xl border border-lime-glow/40 bg-lime-glow/[0.08] px-4 py-4 text-white active:scale-[0.99]"
        >
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-4 w-4 text-lime-glow" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M3 18 Q 12 4 21 18" />
            </svg>
            <span className="text-[10px] uppercase tracking-[0.25em] text-lime-glow">spatial</span>
          </div>
          <div className="mt-1 font-display text-[16px] font-semibold">Conductor Mode</div>
          <div className="text-[11px] text-white/60">tempo · loop · emphasis</div>
        </Link>
      </div>

      <SectionLabel right={<Link to="/legacy" className="text-cyan-glow text-[11px]">All</Link>}>
        Recent sessions
      </SectionLabel>
      <ul className="mb-5 space-y-2">
        {sessions.map((s) => (
          <li key={s.id}>
            <Link to={`/sessions/${s.id}`} className="block">
              <motion.div
                whileTap={{ scale: 0.99 }}
                className="rounded-2xl border border-white/8 bg-white/[0.03] p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="font-display text-[14px] font-semibold text-white">{s.title}</div>
                  <span className="text-[10px] text-white/40">
                    {prettyDate(s.started_at)}
                  </span>
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  <Mini v={`${s.duration_min ?? 0}m`} l="time" />
                  <Mini v={s.strokes ?? 0} l="strokes" />
                  <Mini v={s.summary_lifts ?? 0} l="lifts" tone="cyan" />
                  <Mini
                    v={`+${s.grip_pressure_change ?? 0}%`}
                    l="grip"
                    tone={(s.grip_pressure_change ?? 0) > 12 ? "pink" : "lime"}
                  />
                </div>
              </motion.div>
            </Link>
          </li>
        ))}
      </ul>

      {pen?.knock_shortcuts && Array.isArray(pen.knock_shortcuts) && (pen.knock_shortcuts as any[]).length > 0 && (
        <>
          <SectionLabel>Knock shortcuts</SectionLabel>
          <ul className="mb-5 space-y-2">
            {(pen.knock_shortcuts as { pattern: string; action: string }[]).map((k) => (
              <li
                key={k.pattern}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2.5"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[14px] tracking-[0.3em] text-white">{k.pattern}</span>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">tap pattern</span>
                </div>
                <span className="text-[13px] text-white/85">{k.action}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <SectionLabel>Status</SectionLabel>
      <div className="grid grid-cols-2 gap-2">
        <Tele label="Tip Glow" value={pen?.tip_glow ?? "—"} tone="violet" />
        <Tele label="Haptic" value={`${pen?.haptic ?? 0}% · low`} />
        <Tele label="Thermal" value={`${pen?.thermal_avg_c ?? 0}°C`} tone="cyan" />
        <Tele label="Cap" value={(pen?.cap_orientation ?? "—").replace("-", " ")} />
        <Tele label="Refill" value={pen?.refill_id ?? "—"} />
        <Tele label="Pressure lock" value={pen?.pressure_signature_lock ?? "—"} tone="violet" />
      </div>
    </div>
  );
}

function PenIllustration() {
  return (
    <svg viewBox="0 0 360 80" className="w-full">
      <defs>
        <linearGradient id="penm-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1d2347" />
          <stop offset="50%" stopColor="#0f1124" />
          <stop offset="100%" stopColor="#262d5b" />
        </linearGradient>
        <linearGradient id="penm-stripe" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
        <radialGradient id="penm-tip" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity=".85" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="180" cy="72" rx="150" ry="2.5" fill="#000" opacity=".5" />
      <rect x="40" y="30" width="270" height="20" rx="10" fill="url(#penm-body)" stroke="rgba(255,255,255,0.08)" />
      <rect x="40" y="38" width="270" height="2" fill="url(#penm-stripe)" opacity=".7" />
      <rect x="135" y="34" width="78" height="12" rx="2" fill="#000" />
      <text x="141" y="43" fontFamily="JetBrains Mono, monospace" fontSize="7" fill="#a3e635">
        00:42 · GUIDED
      </text>
      <circle cx="240" cy="40" r="3" fill="none" stroke="rgba(255,255,255,0.18)" strokeDasharray="1.5 1.5" />
      <rect x="310" y="28" width="42" height="24" rx="11" fill="#0a0c1a" stroke="rgba(255,255,255,0.08)" />
      <circle cx="332" cy="40" r="2.5" fill="#22d3ee" opacity=".8" />
      <rect x="22" y="32" width="18" height="16" rx="6" fill="#161a35" stroke="rgba(255,255,255,0.06)" />
      <circle cx="40" cy="40" r="14" fill="url(#penm-tip)" />
      <polygon points="22,40 40,33 40,47" fill="#0f1124" stroke="rgba(255,255,255,0.1)" />
      <circle cx="26" cy="40" r="1.6" fill="#a855f7">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Big({ v, l, tone, sub }: { v: string; l: string; tone: "violet" | "cyan" | "pink" | "lime"; sub?: string }) {
  const cls: Record<string, string> = {
    violet: "text-violet-electric",
    cyan: "text-cyan-glow",
    pink: "text-pink-glow",
    lime: "text-lime-glow",
  };
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3">
      <div className={`font-display text-[20px] font-semibold ${cls[tone]}`}>{v}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{l}</div>
      {sub && <div className="mt-0.5 text-[10px] text-white/45">{sub}</div>}
    </div>
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
      <div className={`font-display text-[12px] font-semibold ${colors[tone]}`}>{v}</div>
      <div className="text-[9px] uppercase tracking-[0.18em] text-white/40">{l}</div>
    </div>
  );
}

function Tele({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "violet" | "cyan" | "pink" | "lime";
}) {
  const colors: Record<string, string> = {
    neutral: "text-white/85",
    violet: "text-violet-electric",
    cyan: "text-cyan-glow",
    pink: "text-pink-glow",
    lime: "text-lime-glow",
  };
  return (
    <div className="rounded-xl border border-white/8 bg-white/[0.025] p-3">
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
      <div className={`mt-0.5 text-[13px] font-medium ${colors[tone]}`}>{value}</div>
    </div>
  );
}

function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="mb-2 flex items-center justify-between">
      <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">{children}</div>
      {right}
    </div>
  );
}

function prettyDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const today = d.toDateString() === new Date().toDateString();
  return `${today ? "Today" : d.toLocaleDateString(undefined, { weekday: "short" })} · ${d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}
