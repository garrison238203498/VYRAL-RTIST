import { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "./GlassCard";

const STEPS = [
  "Reading input…",
  "Looking at your existing Spaces…",
  "Extracting tasks…",
  "Drafting a Space proposal…",
  "Almost there…",
];

export default function ProcessingState({ step }: { step?: string }) {
  const pulse = useSharedValue(0);
  const sweep = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.quad) }), -1, true);
    sweep.value = withRepeat(withTiming(1, { duration: 2000, easing: Easing.linear }), -1, false);
  }, [pulse, sweep]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: 0.45 + pulse.value * 0.55,
    transform: [{ scale: 1 + pulse.value * 0.04 }],
  }));

  const sweepStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: -200 + sweep.value * 400 }],
  }));

  return (
    <GlassCard accent="cyan" rounded="xl" intensity={30} style={{ overflow: "hidden" }}>
      <View style={{ padding: 18, gap: 14 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <Animated.View style={pulseStyle}>
            <LinearGradient
              colors={["#a855f7", "#22d3ee", "#a3e635"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 28, height: 28, borderRadius: 14 }}
            />
          </Animated.View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}>Vyral is reading</Text>
            <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 }}>
              {step || STEPS[Math.floor(Date.now() / 1400) % STEPS.length]}
            </Text>
          </View>
        </View>

        <View style={{ height: 4, backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 2, overflow: "hidden" }}>
          <Animated.View style={[sweepStyle, { height: 4 }]}>
            <LinearGradient
              colors={["transparent", "#a855f7", "#22d3ee", "#a3e635", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{ width: 200, height: 4 }}
            />
          </Animated.View>
        </View>
      </View>
    </GlassCard>
  );
}
