import { type ReactNode } from "react";
import { View, type ViewStyle, type StyleProp } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { type Accent, accentBorder, accentTint, colors, radius } from "./theme";

type Props = {
  children: ReactNode;
  accent?: Accent;
  intensity?: number;
  rounded?: keyof typeof radius;
  glow?: boolean;
  className?: string;
  style?: StyleProp<ViewStyle>;
  innerClassName?: string;
  inlinePadding?: number;
};

// Frosted glass card with optional neon accent border + tinted inner.
// Uses BlurView when supported, falls back to a translucent gradient elsewhere.
export default function GlassCard({
  children,
  accent,
  intensity = 35,
  rounded = "lg",
  glow = false,
  style,
  className,
  innerClassName,
  inlinePadding,
}: Props) {
  const borderColor = accent ? accentBorder[accent] : colors.border;
  const tint = accent ? accentTint[accent] : "rgba(255,255,255,0.05)";

  return (
    <View
      className={className}
      style={[
        {
          borderRadius: radius[rounded],
          overflow: "hidden",
          backgroundColor: colors.glass,
          borderWidth: 1,
          borderColor,
        },
        glow && accent
          ? {
              shadowColor: accent === "lime" ? colors.lime : accent === "cyan" ? colors.cyan : accent === "pink" ? colors.pink : colors.violet,
              shadowOpacity: 0.35,
              shadowRadius: 22,
              shadowOffset: { width: 0, height: 0 },
              elevation: 8,
            }
          : null,
        style,
      ]}
    >
      <BlurView intensity={intensity} tint="dark" style={{ position: "absolute", inset: 0 } as ViewStyle} />
      <LinearGradient
        colors={[tint, "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <View className={innerClassName} style={inlinePadding ? { padding: inlinePadding } : undefined}>
        {children}
      </View>
    </View>
  );
}
