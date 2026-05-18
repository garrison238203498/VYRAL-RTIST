import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { useProfile, usePreferences, usePenState } from "../lib/data";
import { motion } from "../lib/motion";
import { progressWidthClass } from "../lib/progressClass";
import { useState, useEffect } from "react";

export default function Me() {
  const auth = useAuth();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { prefs, update } = usePreferences();
  const pen = usePenState();

  const [s, setS] = useState(prefs);
  useEffect(() => setS(prefs), [prefs]);

  function patch(p: Partial<NonNullable<typeof prefs>>) {
    if (!s) return;
    const next = { ...s, ...p };
    setS(next);
    update(p);
  }

  return (
    <div className="px-5 pt-2 pb-2">
      <header className="mb-4 flex items-center gap-3">
        <span className="grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-violet-electric via-pink-glow to-cyan-glow text-[20px] font-semibold text-ink-950">
          {(profile?.display_name ?? "?")[0]?.toUpperCase()}
        </span>
        <div>
          <h1 className="font-display text-[22px] font-semibold tracking-tight">
            {profile?.display_name ?? "Anonymous"}
          </h1>
          <div className="text-[12px] text-white/50">{profile?.pattern ?? auth.user?.email}</div>
        </div>
      </header>

      <div className="mb-5 grid grid-cols-3 gap-2">
        <Stat v={`${profile?.streak_days ?? 0}d`} l="streak" tone="violet" />
        <Stat v={`${profile?.weekly_focus_blocks ?? 0}`} l="focus / wk" tone="cyan" />
        <Stat v={profile?.energy ?? "—"} l="energy" tone="lime" />
      </div>

      {/* Energy check-in */}
      <Section label="Energy check-in">
        <div className="grid grid-cols-3 gap-1.5">
          {["low", "med", "high"].map((m) => (
            <button
              key={m}
              className={`rounded-xl border py-3 text-[12px] font-medium ${
                m === (profile?.energy === "medium-high" ? "med" : profile?.energy)
                  ? "border-violet-electric/40 bg-violet-electric/15 text-white"
                  : "border-white/10 bg-white/[0.02] text-white/65"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </Section>

      {/* AI personalization */}
      {s && (
        <Section label="AI">
          <Slider
            label="Space automation"
            value={s.space_automation_level ?? 2}
            max={3}
            hints={["Manual", "Suggest", "Suggest + nudge", "Autofill"]}
            onChange={(v) => patch({ space_automation_level: v })}
            tone="violet"
          />
          <Slider
            label="Insight sensitivity"
            value={s.insight_sensitivity ?? 2}
            max={4}
            hints={["Off", "Quiet", "Balanced", "Active", "Loud"]}
            onChange={(v) => patch({ insight_sensitivity: v })}
            tone="cyan"
          />
          <Selector
            label="Naming"
            value={s.ai_naming_control ?? "Suggest, I confirm"}
            options={["I name", "Suggest, I confirm", "Auto, I rename"]}
            onChange={(v) => patch({ ai_naming_control: v })}
          />
        </Section>
      )}

      {/* Pen */}
      {s && (
        <Section
          label="Pen"
          right={
            <button onClick={() => navigate("/pen")} className="text-[11px] text-cyan-glow">
              Status
            </button>
          }
        >
          <Slider
            label="Haptic"
            value={s.haptic_intensity ?? 60}
            max={100}
            hints={["off", "low", "med", "high"]}
            onChange={(v) => patch({ haptic_intensity: v })}
            tone="violet"
          />
          <Toggle
            label="Guided layout"
            on={!!s.guided_layout}
            hint="Adds light spacing cues during sessions."
            onChange={(v) => patch({ guided_layout: v })}
          />
          <Row
            label="Grip profile"
            value={`${profile?.display_name ?? "—"} · daily`}
            sub={`Pressure variance ±0.06 · ${pen?.echo_grip_auth ?? "unknown"}`}
            action="Recalibrate"
          />
        </Section>
      )}

      {/* Reading */}
      {s && (
        <Section label="Reading">
          <Toggle
            label="Dyslexia-friendly font"
            on={!!s.dyslexia_font}
            onChange={(v) => patch({ dyslexia_font: v })}
          />
          <Toggle
            label="Reduced motion"
            on={!!s.reduced_motion}
            onChange={(v) => patch({ reduced_motion: v })}
          />
          <Slider
            label="Slow-read pacing"
            value={Math.round((s.slow_read_pacing ?? 1) * 10)}
            max={20}
            hints={["1.0×", "1.25×", "1.5×", "2.0×"]}
            onChange={(v) => patch({ slow_read_pacing: v / 10 })}
            tone="cyan"
          />
        </Section>
      )}

      {/* Privacy */}
      {s && (
        <Section label="Privacy">
          <Toggle
            label="Store mood / fatigue signals"
            on={!!s.store_mood_signals}
            hint='Off by default. Vyral never claims a diagnosis — only "may indicate."'
            onChange={(v) => patch({ store_mood_signals: v })}
          />
          <Toggle
            label="Share insights with Vyral cloud"
            on={!!s.privacy_share_insights}
            hint="ROTIST signals are private to your device."
            onChange={(v) => patch({ privacy_share_insights: v })}
          />
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button className="rounded-xl border border-lime-glow/30 bg-lime-glow/10 py-2.5 text-[12px] font-medium text-lime-glow">
              Export everything
            </button>
            <button className="rounded-xl border border-pink-glow/30 bg-pink-glow/10 py-2.5 text-[12px] font-medium text-pink-glow">
              Forget last 24h
            </button>
          </div>
        </Section>
      )}

      <div className="mt-4 rounded-2xl border border-lime-glow/25 bg-lime-glow/[0.05] p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-lime-glow">
          We never tell you what you are
        </div>
        <p className="mt-1 text-[12px] text-white/75">
          Vyral describes what it noticed — never what it thinks you "have."
          You stay in control of every word that gets saved about you.
        </p>
      </div>

      <motion.button
        whileTap={{ scale: 0.98 }}
        onClick={async () => {
          await auth.signOut();
          navigate("/login");
        }}
        className="mt-4 w-full rounded-xl border border-white/10 bg-white/[0.025] py-3 text-[12px] text-white/60"
      >
        Sign out
      </motion.button>
    </div>
  );
}

function Section({
  label,
  children,
  right,
}: {
  label: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-white/45">{label}</h2>
        {right}
      </div>
      <div className="space-y-2.5 rounded-2xl border border-white/8 bg-white/[0.025] p-3">{children}</div>
    </section>
  );
}

function Stat({
  v,
  l,
  tone,
}: {
  v: React.ReactNode;
  l: string;
  tone: "violet" | "cyan" | "pink" | "lime";
}) {
  const cls = { violet: "text-violet-electric", cyan: "text-cyan-glow", pink: "text-pink-glow", lime: "text-lime-glow" }[tone];
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] p-3 text-center">
      <div className={`font-display text-[18px] font-semibold ${cls}`}>{v}</div>
      <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{l}</div>
    </div>
  );
}

function Slider({
  label,
  value,
  max,
  hints,
  tone,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  hints: string[];
  tone: "violet" | "cyan" | "pink" | "lime";
  onChange: (v: number) => void;
}) {
  const idx = Math.min(hints.length - 1, Math.round((value / max) * (hints.length - 1)));
  const fillPct = (value / max) * 100;
  const fill = {
    violet: "from-violet-electric to-pink-glow",
    cyan: "from-cyan-glow to-violet-electric",
    pink: "from-pink-glow to-violet-electric",
    lime: "from-lime-glow to-cyan-glow",
  }[tone];
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[12px]">
        <span className="text-white/85">{label}</span>
        <span className="text-[11px] text-white/55">{hints[idx]}</span>
      </div>
      <input
        type="range"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-violet-electric"
      />
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/5">
        <div className={`h-1 rounded-full bg-gradient-to-r ${fill} ${progressWidthClass(fillPct)}`} />
      </div>
    </div>
  );
}

function Toggle({
  label,
  on,
  hint,
  onChange,
}: {
  label: string;
  on: boolean;
  hint?: string;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <div className="pr-2">
        <div className="text-[13px] text-white/90">{label}</div>
        {hint && <div className="mt-0.5 text-[11px] text-white/50">{hint}</div>}
      </div>
      <button
        onClick={() => onChange(!on)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
          on ? "bg-gradient-to-r from-violet-electric to-cyan-glow shadow-glow-violet" : "bg-white/10"
        }`}
        aria-pressed={on}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
            on ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Selector({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[12px] text-white/85">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${
              value === o
                ? "border-violet-electric/40 bg-violet-electric/15 text-violet-electric"
                : "border-white/10 bg-white/[0.025] text-white/60"
            }`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  sub,
  action,
}: {
  label: string;
  value: string;
  sub?: string;
  action?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-2.5">
      <div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{label}</div>
        <div className="mt-0.5 text-[13px] text-white/85">{value}</div>
        {sub && <div className="text-[10px] text-white/45">{sub}</div>}
      </div>
      {action && (
        <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-white/85">
          {action}
        </button>
      )}
    </div>
  );
}
