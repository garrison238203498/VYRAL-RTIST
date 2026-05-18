// Tiny moments: a quick capture pop, a task tick, a save burst.
// Each component is self-contained and short-lived.

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// CheckPop: ring expands and a checkmark draws when a task flips to done.
export function CheckPop({ active }: { active: boolean }) {
  return (
    <span className="relative grid h-5 w-5 place-items-center">
      <AnimatePresence>
        {active && (
          <motion.span
            key="ring"
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute inset-0 rounded-full border border-lime-glow"
          />
        )}
      </AnimatePresence>
      <span
        className={`grid h-5 w-5 place-items-center rounded-full border transition-colors ${
          active ? "border-lime-glow bg-lime-glow/30 text-lime-glow" : "border-white/20"
        }`}
      >
        <AnimatePresence>
          {active && (
            <motion.svg
              viewBox="0 0 12 12"
              className="h-3 w-3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              <motion.path
                d="M2 6l3 3 5-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </span>
    </span>
  );
}

// CapturePop: a brief halo around the capture row when a thought is saved.
export function CapturePop({ pulse }: { pulse: number }) {
  return (
    <AnimatePresence>
      {pulse > 0 && (
        <motion.span
          key={pulse}
          aria-hidden
          initial={{ opacity: 0.6, scale: 0.97 }}
          animate={{ opacity: 0, scale: 1.04 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="pointer-events-none absolute inset-0 rounded-2xl ring-2 ring-violet-electric/60"
        />
      )}
    </AnimatePresence>
  );
}

// Toast: an inline confirmation that fades out.
export function MicroToast({ message }: { message: string | null }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -8, opacity: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="pointer-events-none absolute bottom-28 left-1/2 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-ink-900/90 px-4 py-1.5 text-[12px] text-white/90 backdrop-blur"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// useToast — minimal local toast queue
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 1600);
    return () => clearTimeout(t);
  }, [message]);
  return { message, show: setMessage };
}
