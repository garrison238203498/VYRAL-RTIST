type Props = { className?: string };

export default function VyralMark({ className = "h-6 w-6" }: Props) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-label="Vyral">
      <defs>
        <linearGradient id="vy-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="55%" stopColor="#22d3ee" />
          <stop offset="100%" stopColor="#a3e635" />
        </linearGradient>
        <radialGradient id="vy-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="30" fill="url(#vy-glow)" />
      <rect
        x="3"
        y="3"
        width="58"
        height="58"
        rx="14"
        fill="#0a0c1a"
        stroke="url(#vy-grad)"
        strokeWidth="2"
      />
      <path
        d="M16 22 L32 46 L48 22"
        fill="none"
        stroke="url(#vy-grad)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="32" cy="14" r="3" fill="#22d3ee" />
    </svg>
  );
}
