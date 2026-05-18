import { type ReactNode } from "react";
import { Text, View, type ViewStyle, type StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import PressableScale from "./PressableScale";
import { type Accent, accentGradients, colors, radius } from "./theme";

type Variant = "primary" | "ghost" | "outline";

type Props = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  accent?: Accent;
  icon?: ReactNode;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  haptic?: "light" | "medium" | "heavy" | "selection" | "none";
  style?: StyleProp<ViewStyle>;
};

export default function NeonButton({
  label,
  onPress,
  variant = "primary",
  accent = "violet",
  icon,
  disabled,
  fullWidth = true,
  size = "md",
  haptic = "medium",
  style,
}: Props) {
  const padY = size === "sm" ? 10 : size === "lg" ? 16 : 13;
  const fontSize = size === "sm" ? 13 : size === "lg" ? 16 : 14;
  const colorsArr = accentGradients[accent];

  const inner =
    variant === "primary" ? (
      <LinearGradient
        colors={[colorsArr[0], colorsArr[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 18,
          paddingVertical: padY,
          borderRadius: radius.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        {icon}
        <Text style={{ color: colors.bg, fontWeight: "600", fontSize }}>{label}</Text>
      </LinearGradient>
    ) : variant === "outline" ? (
      <View
        style={{
          paddingHorizontal: 18,
          paddingVertical: padY,
          borderRadius: radius.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.18)",
          backgroundColor: "rgba(255,255,255,0.03)",
          opacity: disabled ? 0.45 : 1,
        }}
      >
        {icon}
        <Text style={{ color: colors.textHi, fontWeight: "500", fontSize }}>{label}</Text>
      </View>
    ) : (
      <View
        style={{
          paddingHorizontal: 14,
          paddingVertical: padY,
          borderRadius: radius.md,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: disabled ? 0.45 : 1,
        }}
      >
        {icon}
        <Text style={{ color: colors.textMid, fontWeight: "500", fontSize }}>{label}</Text>
      </View>
    );

  return (
    <PressableScale
      onPress={disabled ? undefined : onPress}
      haptic={disabled ? "none" : haptic}
      style={[
        fullWidth ? { width: "100%" } : null,
        variant === "primary" && !disabled
          ? {
              shadowColor: colorsArr[0],
              shadowOpacity: 0.45,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 0 },
              elevation: 6,
            }
          : null,
        style,
      ]}
    >
      {inner}
    </PressableScale>
  );
}
