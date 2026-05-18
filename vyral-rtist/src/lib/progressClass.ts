export function progressWidthClass(value: number) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const bucket = Math.max(0, Math.min(100, Math.round(safeValue / 5) * 5));
  return `progress-width-${bucket}`;
}
