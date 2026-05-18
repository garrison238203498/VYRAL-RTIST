// 2.5D motion primitives — parallax tilt, press response, layered depth.
// Built on Framer Motion. Used for microactions everywhere.

import { motion, AnimatePresence } from "framer-motion";
import { type ReactNode } from "react";

// A 2.5D tilt card — pointer position warps the surface like a thin glass tile.
// Press scales it down a hair; release snaps back. Use for tap-to-open cards.
export function TiltCard({
  children,
  className,
  intensity = 8,
  press = 0.985,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  press?: number;
  onClick?: () => void;
}) {
  return (
    <motion.div
      onClick={onClick}
      whileTap={{ scale: press }}
      whileHover={{ y: -Math.max(1, intensity / 6) }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      className={`motion-tilt-card ${className ?? ""}`}
    >
      <motion.div
        aria-hidden
        className="motion-tilt-glow pointer-events-none absolute inset-0 rounded-[inherit]"
      />
      <div className="motion-depth-content relative">
        {children}
      </div>
    </motion.div>
  );
}

// A simple press-feedback wrapper for buttons / tiles where tilt is too much.
export function Pressable({
  children,
  className,
  onClick,
  scale = 0.97,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  scale?: number;
}) {
  return (
    <motion.button
      whileTap={{ scale }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.button>
  );
}

// A layered scene that parallaxes children based on global pointer.
// Good for hero areas. Each child element opts in via translateZ.
export function ParallaxScene({
  children,
  className,
  depth = 1,
}: {
  children: ReactNode;
  className?: string;
  depth?: number;
}) {
  return (
    <motion.div
      whileHover={{ y: -Math.max(1, depth) }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      className={`parallax-scene ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

// Re-export motion primitives so screens import from one place.
export { motion, AnimatePresence };
