import { useEffect, useState } from "react";
import Waveform from "../components/Waveform";
import { conductorState } from "../data/mock";

export default function ConductorMode() {
  const [recording, setRecording] = useState(true);
  const [bars, setBars] = useState(4);

  // simulated tempo flicker
  const [bpm, setBpm] = useState(conductorState.bpm);
  useEffect(() => {
    if (!recording) return;
    const id = setInterval(() => {
      setBpm((b) => Math.max(70, Math.min(110, b + Math.round((Math.random() - 0.5) * 4))));
    }, 1400);
    return () => clearInterval(id);
  }, [recording]);

  return (
    <div className="relative h-full">
      {/* hero photo backdrop */}
      <img
        src="/hero/spatial.png"
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-50"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/65 to-ink-950" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(163,230,53,0.18),transparent_60%)]" />

      <div className="relative z-10 flex h-full flex-col px-5 pb-4 pt-2">
        <div className="ml-12 flex items-center gap-2">
          <span className="rounded-full border border-lime-glow/40 bg-lime-glow/10 px-2 py-0.5 text-[10px] uppercase tracking-wider text-lime-glow">
            RTIST · Spatial
          </span>
        </div>

        <h1 className="mt-3 font-display text-[24px] font-semibold leading-tight tracking-tight">
          Conductor Mode
        </h1>
        <p className="mt-1 max-w-[28ch] text-[12px] text-white/60">
          Sweep the pen. Tempo, intensity, and looping follow your hand.
        </p>

        {/* Live tempo */}
        <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">tempo</div>
              <div className="font-display text-[44px] leading-none font-semibold text-white">
                {bpm}
                <span className="text-[14px] font-normal text-white/45"> BPM</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">
                last gesture
              </div>
              <div className="text-[13px] text-lime-glow">{conductorState.lastGesture}</div>
            </div>
          </div>
          <div className="mt-3">
            <Waveform height={56} active={recording} />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <Pill label="intensity" value="0.78" tone="violet" />
            <Pill label="loop" value={`${bars} bars`} tone="cyan" />
            <Pill label="duration" value={conductorState.duration} tone="pink" />
          </div>
        </div>

        {/* Gesture trail (in-air arc) */}
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 backdrop-blur-xl">
          <div className="mb-1 text-[10px] uppercase tracking-[0.25em] text-white/45">
            in-air gesture · live
          </div>
          <ConductorArc />
        </div>

        {/* Controls */}
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Ctrl label="−1 bar" onClick={() => setBars((b) => Math.max(1, b - 1))} />
          <Ctrl label={`Loop · ${bars}`} primary />
          <Ctrl label="+1 bar" onClick={() => setBars((b) => Math.min(16, b + 1))} />
        </div>

        <div className="mt-auto pt-3">
          <button
            onClick={() => setRecording((r) => !r)}
            className={`w-full rounded-2xl py-4 font-display text-[16px] font-semibold ${
              recording
                ? "bg-pink-glow/20 text-pink-glow border border-pink-glow/40"
                : "bg-gradient-to-r from-lime-glow to-cyan-glow text-ink-950"
            }`}
          >
            {recording ? "Stop & save to Late Night Studio" : "Start conducting"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Pill({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "violet" | "cyan" | "pink";
}) {
  const cls = {
    violet: "text-violet-electric border-violet-electric/30 bg-violet-electric/[0.06]",
    cyan: "text-cyan-glow border-cyan-glow/30 bg-cyan-glow/[0.06]",
    pink: "text-pink-glow border-pink-glow/30 bg-pink-glow/[0.06]",
  }[tone];
  return (
    <div className={`rounded-xl border px-2.5 py-1.5 text-center ${cls}`}>
      <div className="text-[9px] uppercase tracking-[0.2em] opacity-80">{label}</div>
      <div className="mt-0.5 font-display text-[14px] font-semibold">{value}</div>
    </div>
  );
}

function Ctrl({
  label,
  primary,
  onClick,
}: {
  label: string;
  primary?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl py-2.5 text-[12px] font-medium ${
        primary
          ? "bg-gradient-to-r from-violet-electric to-cyan-glow text-ink-950 shadow-glow-violet"
          : "border border-white/10 bg-white/[0.04] text-white/85"
      }`}
    >
      {label}
    </button>
  );
}

function ConductorArc() {
  return (
    <svg viewBox="0 0 320 110" className="w-full">
      <defs>
        <linearGradient id="ca-grad" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#a3e635" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <path
        d="M20 95 C 80 10, 200 10, 300 95"
        fill="none"
        stroke="url(#ca-grad)"
        strokeWidth="3"
        strokeLinecap="round"
        className="conductor-arc-path"
      >
        <animate attributeName="stroke-dashoffset" values="0;0" dur="0.1s" />
      </path>
      {[20, 80, 160, 240, 300].map((x, i) => (
        <circle
          key={x}
          cx={x}
          cy={i === 0 || i === 4 ? 95 : i === 2 ? 22 : 45}
          r="3.5"
          fill="#a3e635"
          opacity={0.85 - i * 0.08}
        >
          <animate
            attributeName="r"
            values="3.5;5;3.5"
            dur={`${1.5 + i * 0.2}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}
