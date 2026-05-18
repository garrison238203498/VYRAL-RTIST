import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StrokeStream from "../components/StrokeStream";
import { sessions } from "../data/mock";

export default function LiveSession() {
  const navigate = useNavigate();
  const session = sessions[0];

  const [seconds, setSeconds] = useState(2538);
  const [showInsight, setShowInsight] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setSeconds((s) => s + 1), 1000);
    const insightTimer = setTimeout(() => setShowInsight(true), 4500);
    return () => {
      clearInterval(t);
      clearTimeout(insightTimer);
    };
  }, []);

  const time = `${Math.floor(seconds / 3600).toString().padStart(2, "0")}:${Math.floor(
    (seconds % 3600) / 60
  )
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;

  return (
    <div className="relative flex h-full flex-col bg-ink-950">
      {/* Top control bar */}
      <div className="flex items-center justify-between px-5 pt-1">
        <div className="flex items-center gap-2 rounded-full border border-lime-glow/30 bg-lime-glow/10 px-2.5 py-1 text-[11px] text-lime-glow">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-lime-glow" />
          Recording
        </div>
        <button
          onClick={() => navigate(`/sessions/${session.id}`)}
          className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] text-white/80"
        >
          End session
        </button>
      </div>

      {/* Title */}
      <div className="px-5 pt-2">
        <div className="font-display text-[22px] font-semibold leading-tight tracking-tight">
          {session.title}
        </div>
        <div className="text-[12px] text-white/55">
          Streaming to <span className="text-cyan-glow">Exam Week Control</span>
        </div>
      </div>

      {/* Big timer */}
      <div className="px-5 pt-3">
        <div className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                elapsed
              </div>
              <div className="font-mono text-[34px] font-medium tabular-nums tracking-tight text-white">
                {time}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                strokes
              </div>
              <div className="font-display text-[24px] font-semibold text-white">
                {session.strokes}
              </div>
            </div>
          </div>
          {/* live chips */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Chip tone="violet">guided layout</Chip>
            <Chip tone="cyan">stroke ghost on</Chip>
            <Chip tone="pink">grip +18%</Chip>
            <Chip tone="lime">heartbeat 1Hz</Chip>
          </div>
        </div>
      </div>

      {/* Stroke stream — main canvas */}
      <div className="flex-1 px-5 pt-3">
        <div className="relative h-full overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
          <StrokeStream height={undefined as unknown as number} />
        </div>
      </div>

      {/* AI insight — appears mid-session */}
      {showInsight && (
        <div className="live-insight-float px-5 pt-3 animate-floatY">
          <div className="rounded-2xl border border-violet-electric/30 bg-violet-electric/[0.08] p-3 backdrop-blur-xl">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md bg-violet-electric/30">
                <svg viewBox="0 0 24 24" className="h-3 w-3 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v3M12 19v3M2 12h3M19 12h3" strokeLinecap="round" />
                </svg>
              </span>
              <div className="flex-1">
                <div className="text-[10px] uppercase tracking-[0.25em] text-violet-electric">
                  Vyral noticed
                </div>
                <div className="text-[13px] leading-snug text-white/90">
                  Your spacing tightened. Want a 2-min reset, or switch to guided layout?
                </div>
              </div>
              <button
                onClick={() => setShowInsight(false)}
                className="text-[16px] leading-none text-white/40"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button className="rounded-lg bg-gradient-to-r from-violet-electric to-pink-glow py-2 text-xs font-medium text-ink-950">
                Try guided layout
              </button>
              <button className="rounded-lg border border-white/10 py-2 text-xs text-white/75">
                2-min reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom: live signals (compact) */}
      <div className="px-5 pb-5 pt-3">
        <div className="grid grid-cols-3 gap-2">
          <SignalChip label="grip" value="+18%" tone="pink" trend />
          <SignalChip label="fatigue" value="0.62" tone="violet" />
          <SignalChip label="confidence" value="dip" tone="cyan" />
        </div>
      </div>
    </div>
  );
}

function Chip({ children, tone }: { children: React.ReactNode; tone: "violet" | "cyan" | "pink" | "lime" }) {
  const cls = {
    violet: "border-violet-electric/30 bg-violet-electric/10 text-violet-electric",
    cyan: "border-cyan-glow/30 bg-cyan-glow/10 text-cyan-glow",
    pink: "border-pink-glow/30 bg-pink-glow/10 text-pink-glow",
    lime: "border-lime-glow/30 bg-lime-glow/10 text-lime-glow",
  }[tone];
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${cls}`}>
      {children}
    </span>
  );
}

function SignalChip({
  label,
  value,
  tone,
  trend,
}: {
  label: string;
  value: string;
  tone: "violet" | "cyan" | "pink";
  trend?: boolean;
}) {
  const cls = {
    violet: "text-violet-electric border-violet-electric/30 bg-violet-electric/[0.06]",
    cyan: "text-cyan-glow border-cyan-glow/30 bg-cyan-glow/[0.06]",
    pink: "text-pink-glow border-pink-glow/30 bg-pink-glow/[0.06]",
  }[tone];
  return (
    <div className={`rounded-xl border p-2.5 text-center ${cls}`}>
      <div className="text-[9px] uppercase tracking-[0.2em] opacity-80">{label}</div>
      <div className="mt-0.5 flex items-center justify-center gap-1">
        <span className="font-display text-[16px] font-semibold">{value}</span>
        {trend && <span className="text-[10px]">↑</span>}
      </div>
    </div>
  );
}
