import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";

// Purposeful system background: deep blue field, quiet signal rails, and soft mode auras.
// Lives behind every screen via the root layout.
export default function AmbientBackground() {
  const v = useSharedValue(0);
  const c = useSharedValue(0);
  const p = useSharedValue(0);

  useEffect(() => {
    v.value = withRepeat(withTiming(1, { duration: 14000, easing: Easing.inOut(Easing.sin) }), -1, true);
    c.value = withRepeat(withTiming(1, { duration: 18000, easing: Easing.inOut(Easing.sin) }), -1, true);
    p.value = withRepeat(withTiming(1, { duration: 22000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [v, c, p]);

  const violetStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -20 + v.value * 30 }, { translateY: -10 + v.value * 20 }],
    opacity: 0.55 + v.value * 0.25,
  }));
  const cyanStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: 30 - c.value * 40 }, { translateY: 0 + c.value * 30 }],
    opacity: 0.45 + c.value * 0.3,
  }));
  const pinkStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -10 + p.value * 20 }, { translateY: 30 - p.value * 40 }],
    opacity: 0.3 + p.value * 0.25,
  }));

  return (
    <View pointerEvents="none" style={{ position: "absolute", inset: 0 } as any}>
      <LinearGradient
        colors={["#020817", "#041023", "#07152f", "#020817"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={["rgba(94,234,212,0.10)", "transparent", "rgba(109,74,255,0.09)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 360 }}
      />
      {Array.from({ length: 7 }).map((_, index) => (
        <View
          key={`rail-${index}`}
          style={{
            position: "absolute",
            left: 18,
            right: 18,
            top: 112 + index * 82,
            height: 1,
            backgroundColor: index % 2 === 0 ? "rgba(94,234,212,0.045)" : "rgba(167,139,250,0.045)",
          }}
        />
      ))}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: -120,
            left: -140,
            width: 430,
            height: 430,
            borderRadius: 215,
            backgroundColor: "#352069",
          },
          violetStyle,
          { opacity: 0.36 },
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 210,
            right: -150,
            width: 410,
            height: 410,
            borderRadius: 205,
            backgroundColor: "#0891b2",
          },
          cyanStyle,
          { opacity: 0.18 },
        ]}
      />
      <Animated.View
        style={[
          {
            position: "absolute",
            bottom: -150,
            left: 80,
            width: 360,
            height: 360,
            borderRadius: 180,
            backgroundColor: "#6d4aff",
          },
          pinkStyle,
          { opacity: 0.18 },
        ]}
      />
      <View
        style={{
          position: "absolute",
          left: 24,
          right: 24,
          top: 76,
          height: 1,
          backgroundColor: "rgba(94,234,212,0.12)",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 24,
          width: 1,
          top: 76,
          bottom: 126,
          backgroundColor: "rgba(167,139,250,0.055)",
        }}
      />
      <LinearGradient
        colors={["transparent", "rgba(2,8,23,0.72)"]}
        style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 240 }}
      />
    </View>
  );
}
