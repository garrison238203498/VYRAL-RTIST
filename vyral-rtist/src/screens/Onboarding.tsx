import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/PhoneFrame";
import VyralMark from "../components/VyralMark";

const slides = [
  {
    eyebrow: "Vyral",
    title: "A living AI operating system.",
    body: "Not a planner. Not a notes app. Vyral observes how you actually work and quietly organizes around you.",
    accent: "violet" as const,
  },
  {
    eyebrow: "ROTIST",
    title: "A pen that understands writing.",
    body: "Stroke, pressure, hesitation, grip, fatigue, gesture. ROTIST doesn't just digitize notes — it senses the act of writing.",
    accent: "cyan" as const,
  },
  {
    eyebrow: "Spaces",
    title: "Your patterns become structure.",
    body: "Spaces form from real behavior — late-night studio, exam week, group orbit. You approve, rename, merge, archive.",
    accent: "lime" as const,
  },
];

export default function Onboarding() {
  const [i, setI] = useState(0);
  const navigate = useNavigate();
  const slide = slides[i];

  const next = () => {
    if (i < slides.length - 1) setI(i + 1);
    else navigate("/home");
  };

  return (
    <PhoneFrame>
      <div className="relative flex h-full w-full flex-col bg-ink-950">
        {/* atmospheric backdrop */}
        <img
          src="/hero/welcome.png"
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/40 via-ink-950/70 to-ink-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.25),transparent_60%),radial-gradient(circle_at_75%_70%,rgba(34,211,238,0.18),transparent_60%)]" />

        <div className="relative z-10 flex h-full flex-col px-7 pb-10 pt-16">
          <div className="flex items-center gap-2.5">
            <VyralMark className="h-7 w-7" />
            <div className="font-display text-sm font-semibold tracking-tight">
              Vyral <span className="text-white/30">+</span>{" "}
              <span className="neon-text">ROTIST</span>
            </div>
          </div>

          <div className="flex-1" />

          <div className="space-y-4">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${
                slide.accent === "violet"
                  ? "border-violet-electric/40 bg-violet-electric/10 text-violet-electric"
                  : slide.accent === "cyan"
                  ? "border-cyan-glow/40 bg-cyan-glow/10 text-cyan-glow"
                  : "border-lime-glow/40 bg-lime-glow/10 text-lime-glow"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {slide.eyebrow}
            </span>
            <h1 className="font-display text-[34px] font-semibold leading-[1.05] tracking-tight text-white">
              {slide.title}
            </h1>
            <p className="text-base text-white/70">{slide.body}</p>
          </div>

          <div className="mt-8 flex items-center gap-2">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === i ? "w-6 bg-white" : "w-1.5 bg-white/25"
                }`}
              />
            ))}
            <button
              onClick={() => navigate("/home")}
              className="ml-auto text-xs text-white/50 hover:text-white"
            >
              Skip
            </button>
          </div>

          <button
            onClick={next}
            className="mt-5 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet-electric via-pink-glow to-cyan-glow px-5 py-4 text-base font-semibold text-ink-950 shadow-glow-violet active:scale-[0.99]"
          >
            {i < slides.length - 1 ? "Continue" : "Enter Vyral"}
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </PhoneFrame>
  );
}
