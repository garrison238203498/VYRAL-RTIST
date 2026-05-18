// Big-action ceremony — fires when a user completes a goal they set themselves.
// Layered 2.5D: backdrop, bloom, particles, the badge, and copy that names what they did.

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo } from "react";

export type CelebrationGoal = {
  id: string;
  title: string;
  unit?: string | null;
  target_value: number;
  why?: string | null;
};

export default function GoalCelebration({
  goal,
  onClose,
}: {
  goal: CelebrationGoal | null;
  onClose: () => void;
}) {
  // Auto-dismiss after 6.5s if the user doesn't tap.
  useEffect(() => {
    if (!goal) return;
    const t = setTimeout(onClose, 6500);
    return () => clearTimeout(t);
  }, [goal, onClose]);

  return (
    <AnimatePresence>
      {goal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
        >
          {/* dim backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink-950/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* radial bloom */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="goal-celebration-radial-bloom pointer-events-none absolute inset-0"
          />

          {/* particles */}
          <Particles />

          {/* center stage */}
          <motion.div
            initial={{ y: 24, opacity: 0, rotateX: -12 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22, delay: 0.15 }}
            className="goal-celebration-stage relative z-10 mx-auto w-[88%] max-w-[340px] text-center"
          >
            {/* Badge */}
            <motion.div
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 240, damping: 14, delay: 0.25 }}
              className="goal-celebration-badge-depth relative mx-auto h-32 w-32"
            >
              <Badge />
            </motion.div>

            <motion.div
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-5"
            >
              <div className="text-[10px] uppercase tracking-[0.4em] text-cyan-glow">
                you said you would
              </div>
              <h2 className="mt-2 font-display text-[26px] font-semibold leading-tight tracking-tight">
                {goal.title}
              </h2>
              <div className="mt-2 text-[14px] text-white/75">
                {goal.target_value} {goal.unit ?? ""} · done
              </div>
              {goal.why && (
                <p className="mt-3 text-[13px] italic text-white/55">"{goal.why}"</p>
              )}
            </motion.div>

            <motion.button
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.85 }}
              onClick={onClose}
              className="mt-6 inline-flex items-center justify-center rounded-2xl border border-white/15 bg-white/[0.04] px-5 py-2.5 text-[13px] text-white/85 backdrop-blur"
            >
              Save to Life & Legacy
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Badge() {
  return (
    <svg viewBox="0 0 200 200" className="h-full w-full drop-shadow-[0_0_30px_rgba(168,85,247,0.55)]">
      <defs>
        <linearGradient id="badge-stroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
        <radialGradient id="badge-fill" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#1d2347" />
          <stop offset="100%" stopColor="#06070f" />
        </radialGradient>
      </defs>
      {/* rotating outer ring */}
      <g className="badge-ring">
        <circle cx="100" cy="100" r="90" fill="none" stroke="url(#badge-stroke)" strokeWidth="2" strokeDasharray="6 8">
          <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="22s" repeatCount="indefinite" />
        </circle>
      </g>
      <circle cx="100" cy="100" r="74" fill="url(#badge-fill)" stroke="url(#badge-stroke)" strokeWidth="2" />
      {/* sparkline */}
      <path
        d="M50 130 L80 90 L110 110 L140 60"
        fill="none"
        stroke="url(#badge-stroke)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="140" cy="60" r="4" fill="#a3e635" />
    </svg>
  );
}

function Particles() {
  const items = useMemo(
    () =>
      Array.from({ length: 22 }).map((_, i) => ({
        id: i,
        angle: (i / 22) * Math.PI * 2,
        distance: 80 + Math.random() * 160,
        size: 2 + Math.random() * 4,
        color: ["#a855f7", "#22d3ee", "#a3e635", "#ec4899"][i % 4],
        colorClass: ["goal-particle-violet", "goal-particle-cyan", "goal-particle-lime", "goal-particle-pink"][i % 4],
        sizeClass: ["goal-particle-sm", "goal-particle-md", "goal-particle-lg"][i % 3],
        delay: Math.random() * 0.4,
      })),
    []
  );
  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      {items.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 0, scale: 0.4 }}
          animate={{
            x: Math.cos(p.angle) * p.distance,
            y: Math.sin(p.angle) * p.distance,
            opacity: [0, 1, 0],
            scale: [0.4, 1.1, 0.6],
          }}
          transition={{ duration: 2.2, ease: "easeOut", delay: p.delay }}
          className={`goal-particle ${p.colorClass} ${p.sizeClass}`}
        />
      ))}
    </div>
  );
}
