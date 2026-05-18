export default function Waveform({
  bars = 64,
  height = 80,
  active = true,
}: {
  bars?: number;
  height?: number;
  active?: boolean;
}) {
  const heightClass = height <= 64 ? "waveform-height-64" : height >= 120 ? "waveform-height-120" : "waveform-height-80";

  return (
    <div className={`waveform ${heightClass}`}>
      {Array.from({ length: bars }).map((_, i) => {
        const seed = Math.sin(i * 0.6) * 0.4 + Math.cos(i * 1.3) * 0.4 + 0.6;
        const heightBucket = Math.min(10, Math.max(1, Math.round(seed * 8)));
        const delayBucket = i % 16;
        return (
          <span
            key={i}
            className={`waveform-bar waveform-bar-h-${heightBucket} waveform-delay-${delayBucket} ${
              active ? "waveform-bar-active" : "waveform-bar-paused"
            }`}
          />
        );
      })}
    </div>
  );
}
