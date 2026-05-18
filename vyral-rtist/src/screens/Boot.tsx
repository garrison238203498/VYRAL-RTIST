// Bootup screen: post-login transition with a deep-space, Interstellar-quiet vibe.
// Plays once after sign-in, then routes to /home.

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "../lib/motion";
import PhoneFrame from "../components/PhoneFrame";
import VyralMark from "../components/VyralMark";
import { useProfile } from "../lib/data";

const lines = [
  { t: 350, label: "AUTH ·", value: "grip + key matched" },
  { t: 850, label: "LINK ·", value: "ROTIST channel established" },
  { t: 1350, label: "SPACES ·", value: "loading your environments" },
  { t: 1850, label: "MEMORY ·", value: "Life & Legacy synced" },
  { t: 2350, label: "READY ·", value: "your reality, as lived" },
];

export default function Boot() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = lines.map((l, i) => setTimeout(() => setStep(i + 1), l.t));
    const done = setTimeout(() => navigate("/home"), 3300);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [navigate]);

  return (
    <PhoneFrame>
      <div className="relative flex h-full w-full flex-col overflow-hidden bg-black">
        <DeepSpace />

        <div className="relative z-10 flex h-full flex-col items-center justify-center px-7">
          {/* Centered mark with breathing glow */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="relative"
          >
            <motion.div
              aria-hidden
              className="boot-core-glow absolute -inset-16 rounded-full"
              animate={{ opacity: [0.5, 1, 0.5], scale: [0.95, 1.05, 0.95] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative">
              <VyralMark className="h-20 w-20" />
            </div>
          </motion.div>

          {/* Greeting */}
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-10 text-center"
          >
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/45">
              waking system
            </div>
            <h1 className="mt-2 font-display text-[28px] font-semibold leading-tight tracking-tight text-white">
              {profile?.display_name ? `Good to see you, ${profile.display_name}.` : "Welcome back."}
            </h1>
          </motion.div>

          {/* Boot log */}
          <div className="mt-10 w-full max-w-[280px] space-y-1.5 font-mono text-[11px]">
            <AnimatePresence>
              {lines.slice(0, step).map((l, i) => (
                <motion.div
                  key={l.label}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.35, delay: i * 0.02 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-cyan-glow">{l.label}</span>
                  <span className="text-white/65">{l.value}</span>
                  {i === step - 1 && (
                    <motion.span
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-lime-glow"
                      animate={{ opacity: [1, 0.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Progress hairline */}
          <div className="mt-8 h-px w-44 overflow-hidden rounded-full bg-white/5">
            <motion.div
              className="h-px bg-gradient-to-r from-violet-electric via-cyan-glow to-lime-glow"
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 3, ease: "easeInOut" }}
            />
          </div>

          {/* Tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5, duration: 0.6 }}
            className="absolute bottom-12 text-center"
          >
            <div className="text-[10px] uppercase tracking-[0.5em] text-white/40">
              v · your reality as lived
            </div>
            <div className="mt-1 font-mono text-[10px] text-white/25">#Vyral</div>
          </motion.div>
        </div>
      </div>
    </PhoneFrame>
  );
}

// Deep-space scene: nebula gradient, drifting stars, hyperlane streaks at the end.
function DeepSpace() {
  const stars = useMemo(
    () =>
      Array.from({ length: 140 }).map((_, i) => {
        const x = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
        const y = ((Math.sin(i * 78.233) * 12345.6789) % 1 + 1) % 1;
        const r = 0.3 + ((i * 17) % 13) / 16;
        const opacity = 0.2 + ((i * 31) % 9) / 12;
        const tw = 1.5 + ((i * 7) % 5);
        return { x, y, r, opacity, tw };
      }),
    []
  );

  return (
    <div className="absolute inset-0">
      {/* nebula */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_24%,rgba(168,85,247,0.45),transparent_55%),radial-gradient(circle_at_72%_72%,rgba(34,211,238,0.28),transparent_55%),radial-gradient(circle_at_50%_85%,rgba(236,72,153,0.18),transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />

      {/* stars */}
      <svg
        viewBox="0 0 412 868"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
      >
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x * 412}
            cy={s.y * 868}
            r={s.r}
            fill="white"
            opacity={s.opacity}
          >
            <animate
              attributeName="opacity"
              values={`${s.opacity};${Math.min(1, s.opacity * 1.6)};${s.opacity}`}
              dur={`${s.tw}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </svg>

      {/* hyperlane streaks (appear near the end of boot) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 0.55, 0] }}
        transition={{ duration: 4, times: [0, 0.6, 0.85, 1] }}
        className="absolute inset-0"
      >
        <svg viewBox="0 0 412 868" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          {Array.from({ length: 18 }).map((_, i) => {
            const cx = 206 + Math.cos((i / 18) * Math.PI * 2) * 60;
            const cy = 434 + Math.sin((i / 18) * Math.PI * 2) * 60;
            const dx = (cx - 206) * 6;
            const dy = (cy - 434) * 6;
            return (
              <line
                key={i}
                x1={cx}
                y1={cy}
                x2={cx + dx}
                y2={cy + dy}
                stroke={i % 3 === 0 ? "#a855f7" : i % 3 === 1 ? "#22d3ee" : "#a3e635"}
                strokeWidth="1"
                opacity="0.7"
              />
            );
          })}
        </svg>
      </motion.div>
    </div>
  );
}
