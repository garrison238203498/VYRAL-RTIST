import { type ReactNode } from "react";
import { Pressable, type PressableProps, type ViewStyle, type StyleProp } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, "style"> & {
  children: ReactNode;
  haptic?: "light" | "medium" | "heavy" | "selection" | "none";
  scaleTo?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

// Subtle press-spring + haptic. Wraps every tappable surface in the app.
export default function PressableScale({
  children,
  onPressIn,
  onPressOut,
  onPress,
  haptic = "selection",
  scaleTo = 0.97,
  style,
  ...rest
}: Props) {
  const scale = useSharedValue(1);
  const glow = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: 0.5 + 0.5 * (1 - glow.value * 0.4),
  }));

  return (
    <AnimatedPressable
      style={[animatedStyle, style]}
      onPressIn={(e) => {
        scale.value = withSpring(scaleTo, { damping: 18, stiffness: 360 });
        glow.value = withTiming(1, { duration: 120 });
        if (haptic !== "none") {
          const map = {
            light: Haptics.ImpactFeedbackStyle.Light,
            medium: Haptics.ImpactFeedbackStyle.Medium,
            heavy: Haptics.ImpactFeedbackStyle.Heavy,
            selection: Haptics.ImpactFeedbackStyle.Light,
          } as const;
          Haptics.impactAsync(map[haptic]).catch(() => {});
        }
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.value = withSpring(1, { damping: 16, stiffness: 320 });
        glow.value = withTiming(0, { duration: 220 });
        onPressOut?.(e);
      }}
      onPress={onPress}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}
