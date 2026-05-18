import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import "./styles.css";

type SpaceSceneProps = {
  spaceName?: string;
};

export function SpaceBloomScene({ spaceName = "Exam Week Control" }: SpaceSceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame, fps, config: { damping: 18 } });
  const orbScale = interpolate(reveal, [0, 1], [0.55, 1]);

  return (
    <AbsoluteFill className="scene scene-space">
      <svg className="scene-svg" viewBox="0 0 1080 1920" aria-label="Space bloom animation">
        <defs>
          <radialGradient id="spaceOrbGradient" cx="50%" cy="50%" r="55%">
            <stop offset="0%" stopColor="#9b5cff" stopOpacity="0.7" />
            <stop offset="52%" stopColor="#ffffff" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.02" />
          </radialGradient>
          <filter id="cyanGlow">
            <feGaussianBlur stdDeviation="18" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {Array.from({ length: 18 }).map((_, index) => {
          const angle = (index / 18) * Math.PI * 2;
          const distance = interpolate(reveal, [0, 1], [330, 72]);
          const x = 540 + Math.cos(angle) * distance;
          const y = 960 + Math.sin(angle) * distance;
          const opacity = interpolate(reveal, [0, 1], [0.56, 0.18]);
          return (
            <rect
              key={index}
              className={index % 2 ? "fragment fragment-cyan" : "fragment fragment-violet"}
              x={x - 42}
              y={y - 16}
              width="84"
              height="32"
              rx="16"
              opacity={opacity}
              transform={`rotate(${index * 13} ${x} ${y})`}
            />
          );
        })}
        <g transform={`translate(540 910) scale(${orbScale})`} filter="url(#cyanGlow)">
          <circle className="space-orb" r="190" />
          <circle className="space-orb-ring" r="190" />
          <text className="space-v" textAnchor="middle" y="-10">V</text>
          <text className="space-name" textAnchor="middle" y="76">{spaceName}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
}

export function KoiDiveScene() {
  const frame = useCurrentFrame();
  const rotation = frame * 2.1;
  const breath = 1 + Math.sin(frame / 18) * 0.08;

  return (
    <AbsoluteFill className="scene scene-koi">
      <svg className="scene-svg" viewBox="0 0 1080 1920" aria-label="KOI DIVE animation">
        <g transform={`translate(540 820) scale(${breath})`}>
          <circle className="pond-ring pond-ring-outer" r="260" />
          <circle className="pond-ring pond-ring-inner" r="178" />
        </g>
        <g transform={`translate(540 820) rotate(${rotation})`}>
          <ellipse className="koi-fish koi-cyan" cx="-156" cy="-76" rx="58" ry="18" />
          <ellipse className="koi-fish koi-pink" cx="156" cy="76" rx="58" ry="18" />
        </g>
        <text className="dive-title" textAnchor="middle" x="540" y="850">DIVE</text>
        <text className="scene-caption" textAnchor="middle" x="540" y="920">Breathe. Reflect. Realign.</text>
      </svg>
    </AbsoluteFill>
  );
}

export function RotistTraceScene() {
  const frame = useCurrentFrame();
  const progress = Math.min(1, frame / 120);

  return (
    <AbsoluteFill className="scene scene-rotist">
      <svg className="scene-svg" viewBox="0 0 1080 1920" aria-label="ROTIST trace animation">
        <rect className="trace-page" x="180" y="600" width="720" height="420" rx="44" />
        {Array.from({ length: 7 }).map((_, index) => {
          const width = Math.max(80, progress * (260 + index * 70));
          return (
            <rect
              key={index}
              className={`trace-line trace-line-${index % 3}`}
              x="235"
              y={668 + index * 48}
              width={width}
              height="14"
              rx="7"
            />
          );
        })}
        <circle className="pressure-pulse" cx="765" cy="900" r={18 + Math.sin(frame / 10) * 10} />
        <text className="rotist-title" textAnchor="middle" x="540" y="1110">Writing becomes structure</text>
      </svg>
    </AbsoluteFill>
  );
}

export function LegacyMemoryScene({ title = "Study milestone saved" }: { title?: string }) {
  const frame = useCurrentFrame();
  const reveal = spring({ frame, fps: 30, config: { damping: 20 } });
  const cardX = interpolate(reveal, [0, 1], [-260, 0]);

  return (
    <AbsoluteFill className="scene scene-legacy">
      <svg className="scene-svg" viewBox="0 0 1080 1920" aria-label="Life and Legacy memory animation">
        <line className="timeline-line" x1="130" x2="950" y1="960" y2="960" />
        <g transform={`translate(${325 + cardX} 820)`}>
          <rect className="memory-card" width="430" height="220" rx="34" />
          <text className="memory-kicker" x="34" y="58">LIFE & LEGACY</text>
          <text className="memory-title" x="34" y="122">{title}</text>
        </g>
      </svg>
    </AbsoluteFill>
  );
}
