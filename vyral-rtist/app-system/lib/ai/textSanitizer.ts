export function sanitizeAIText(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/```[\s\S]*?```/g, "")
    .replace(/(^|\n)\s{0,3}#{1,6}\s*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function sanitizeList(values: unknown, fallback: string[] = []) {
  if (Array.isArray(values)) {
    return values.map(sanitizeAIText).filter(Boolean);
  }
  if (typeof values === "string") {
    return values
      .split(/\n|;/)
      .map(sanitizeAIText)
      .filter(Boolean);
  }
  return fallback;
}

export function safeJsonText(value: string) {
  const cleaned = sanitizeAIText(value);
  if (/^\s*[{[]/.test(cleaned)) return "";
  return cleaned;
}
