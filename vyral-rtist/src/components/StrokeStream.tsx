import { useEffect, useRef } from "react";

export default function StrokeStream({
  height = 220,
  className,
  paused,
}: {
  height?: number;
  className?: string;
  paused?: boolean;
}) {
  const ref = useRef<SVGSVGElement>(null);
  const heightClass = height <= 180 ? "stroke-stream-height-180" : height >= 260 ? "stroke-stream-height-260" : "stroke-stream-height-220";

  useEffect(() => {
    // Lightweight animated stroke - a synthetic live writing line.
    const path = ref.current?.querySelector("#sk-line") as SVGPathElement | null;
    if (!path) return;
    const len = path.getTotalLength?.() || 1500;
    path.setAttribute("stroke-dasharray", `${len}`);
    path.setAttribute("stroke-dashoffset", `${len}`);

    let raf = 0;
    const start = performance.now();
    const dur = 6500;
    const step = (t: number) => {
      const p = ((t - start) % dur) / dur;
      path.setAttribute("stroke-dashoffset", `${len - len * p}`);
      if (!paused) raf = requestAnimationFrame(step);
    };
    if (!paused) raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [paused]);

  return (
    <svg
      ref={ref}
      viewBox="0 0 800 240"
      className={["stroke-stream-svg", heightClass, className].filter(Boolean).join(" ")}
      aria-label="Live stroke stream"
    >
      <defs>
        <linearGradient id="sk-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="50%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
        <pattern id="sk-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="rgba(255,255,255,0.04)" />
        </pattern>
      </defs>
      <rect width="800" height="240" fill="url(#sk-grid)" />

      {/* faint hesitation markers */}
      <circle cx="220" cy="120" r="14" fill="none" stroke="#ec4899" strokeWidth="1" opacity=".5" />
      <circle cx="430" cy="160" r="11" fill="none" stroke="#ec4899" strokeWidth="1" opacity=".5" />
      <circle cx="600" cy="100" r="13" fill="none" stroke="#ec4899" strokeWidth="1" opacity=".5" />

      {/* ghost previous strokes */}
      <path
        d="M40 180 C 80 100, 120 100, 160 160 S 220 220, 280 150 380 60, 420 130 480 200, 540 130 620 70, 760 140"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="2"
        fill="none"
      />

      {/* main live stroke */}
      <path
        id="sk-line"
        d="M40 180 C 90 80, 130 90, 170 150 S 230 230, 280 150 360 70, 410 140 470 200, 530 140 600 80, 670 150 720 200, 760 130"
        stroke="url(#sk-grad)"
        strokeWidth="3.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-stream-live-line"
      />

      {/* baseline */}
      <line x1="0" y1="200" x2="800" y2="200" stroke="rgba(255,255,255,0.05)" />
      <line x1="0" y1="80" x2="800" y2="80" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 4" />

      {/* labels */}
      <g fontFamily="JetBrains Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
        <text x="226" y="100">hesitation 0.42s</text>
        <text x="436" y="186">hesitation 0.31s</text>
        <text x="606" y="84">hesitation 0.28s</text>
        <text x="10" y="14">stroke stream live</text>
      </g>
    </svg>
  );
}
