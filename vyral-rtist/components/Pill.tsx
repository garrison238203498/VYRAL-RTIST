import { type ReactNode } from "react";
import { Text, View } from "react-native";
import { type Accent, accentBorder, accentHex, accentTint, colors } from "./theme";

type Tone = Accent | "neutral";

const tones: Record<Tone, { bg: string; border: string; text: string }> = {
  violet: { bg: accentTint.violet, border: accentBorder.violet, text: accentHex.violet },
  cyan: { bg: accentTint.cyan, border: accentBorder.cyan, text: accentHex.cyan },
  pink: { bg: accentTint.pink, border: accentBorder.pink, text: accentHex.pink },
  lime: { bg: accentTint.lime, border: accentBorder.lime, text: accentHex.lime },
  neutral: { bg: "rgba(255,255,255,0.05)", border: "rgba(255,255,255,0.12)", text: colors.textMid },
};

export default function Pill({
  children,
  tone = "neutral",
  dot = false,
  size = "md",
}: {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  size?: "sm" | "md";
}) {
  const t = tones[tone];
  const py = size === "sm" ? 2 : 4;
  const fontSize = size === "sm" ? 10 : 11;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: py,
        backgroundColor: t.bg,
        borderColor: t.border,
        borderWidth: 1,
        borderRadius: 999,
        alignSelf: "flex-start",
      }}
    >
      {dot && (
        <View
          style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.text }}
        />
      )}
      <Text style={{ color: t.text, fontSize, fontWeight: "500", letterSpacing: 0.4 }}>
        {typeof children === "string" ? children.toUpperCase() : children}
      </Text>
    </View>
  );
}
