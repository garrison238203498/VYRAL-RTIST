// Single source of truth for colors + accent system, used by RN components.
// Tailwind classes are duplicated here as raw hex for places StyleSheet is needed
// (LinearGradient, BlurView tint, dynamic shadow colors, etc).

export const colors = {
  blue950: "#020817",
  blue925: "#041023",
  blue900: "#07152f",
  blue850: "#0a1f44",
  blue800: "#102a56",
  purple900: "#22113f",
  purple800: "#352069",
  purple600: "#6d4aff",
  purple400: "#a78bfa",
  cyan900: "#083344",
  cyan600: "#0891b2",
  cyan300: "#5eead4",
  bg: "#020817",
  bgMid: "#041023",
  bgUp: "#07152f",
  border: "rgba(94,234,212,0.10)",
  borderStrong: "rgba(167,139,250,0.20)",
  glass: "rgba(12,32,67,0.46)",
  glassStrong: "rgba(16,42,86,0.64)",
  textHi: "#ffffff",
  textMid: "rgba(226,232,255,0.74)",
  textLo: "rgba(199,210,254,0.54)",
  textXLo: "rgba(148,163,184,0.40)",
  violet: "#a78bfa",
  violetDeep: "#352069",
  cyan: "#5eead4",
  pink: "#7c3aed",
  lime: "#22d3ee",
  rose: "#8b5cf6",
};

export type Accent = "violet" | "cyan" | "pink" | "lime";

export const accentHex: Record<Accent, string> = {
  violet: colors.violet,
  cyan: colors.cyan,
  pink: colors.pink,
  lime: colors.lime,
};

export const accentGradients: Record<Accent, [string, string]> = {
  violet: ["#a78bfa", "#6d4aff"],
  cyan: ["#5eead4", "#0891b2"],
  pink: ["#7c3aed", "#5eead4"],
  lime: ["#22d3ee", "#6d4aff"],
};

export const accentBorder: Record<Accent, string> = {
  violet: "rgba(167, 139, 250, 0.34)",
  cyan: "rgba(94, 234, 212, 0.32)",
  pink: "rgba(124, 58, 237, 0.34)",
  lime: "rgba(34, 211, 238, 0.34)",
};

export const accentTint: Record<Accent, string> = {
  violet: "rgba(109, 74, 255, 0.13)",
  cyan: "rgba(94, 234, 212, 0.11)",
  pink: "rgba(124, 58, 237, 0.13)",
  lime: "rgba(34, 211, 238, 0.12)",
};

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 28,
  pill: 999,
};

export const shadow = {
  glow: (hex: string) => ({
    shadowColor: hex,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  }),
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
};
