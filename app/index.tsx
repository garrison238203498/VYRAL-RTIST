// Vyral splash. Cinematic neon V mark + "Loading vibes…" progress bar.
// Routes to /(tabs)/home or /login after auth resolves.

import { useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Defs, Stop, LinearGradient as SvgGradient } from "react-native-svg";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useAuth } from "../lib/auth";

const ROUTE_AFTER_MS = 2400;

export default function Boot() {
  const router = useRouter();
  const { user, configured, loading } = useAuth();

  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.85);
  const glow = useSharedValue(0.6);
  const wordOpacity = useSharedValue(0);
  const barProgress = useSharedValue(0);
  const labelOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    glow.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.sin) }),
      -1,
      true
    );
    wordOpacity.value = withDelay(450, withTiming(1, { duration: 700 }));
    labelOpacity.value = withDelay(700, withTiming(1, { duration: 500 }));
    barProgress.value = withTiming(1, {
      duration: ROUTE_AFTER_MS,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [logoOpacity, logoScale, glow, wordOpacity, labelOpacity, barProgress]);

  useEffect(() => {
    if (loading) return;
    const id = setTimeout(() => {
      if (!configured) router.replace("/login");
      else if (user) router.replace("/(tabs)/home");
      else router.replace("/login");
    }, ROUTE_AFTER_MS);
    return () => clearTimeout(id);
  }, [loading, user, configured, router]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
    shadowOpacity: 0.55 + glow.value * 0.35,
    shadowRadius: 28 + glow.value * 18,
  }));
  const wordStyle = useAnimatedStyle(() => ({ opacity: wordOpacity.value }));
  const labelStyle = useAnimatedStyle(() => ({ opacity: labelOpacity.value }));
  const barStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, barProgress.value * 100)}%`,
  }));

  return (
    <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", width: "100%" }}>
        <Animated.View
          style={[
            {
              shadowColor: "#a855f7",
              shadowOffset: { width: 0, height: 0 },
              alignItems: "center",
            },
            logoStyle,
          ]}
        >
          <NeonV size={170} />
          <Animated.Text
            style={[
              {
                color: "#fff",
                fontSize: 44,
                fontWeight: "800",
                letterSpacing: -1.4,
                marginTop: 22,
              },
              wordStyle,
            ]}
          >
            vyral
          </Animated.Text>
        </Animated.View>
      </View>

      <View style={{ width: "70%", paddingBottom: 70, alignItems: "center" }}>
        <Animated.Text
          style={[
            {
              color: "rgba(255,255,255,0.55)",
              fontSize: 13,
              letterSpacing: 1,
              marginBottom: 14,
            },
            labelStyle,
          ]}
        >
          Loading vibes…
        </Animated.Text>
        <View
          style={{
            width: "100%",
            height: 4,
            borderRadius: 4,
            backgroundColor: "rgba(255,255,255,0.08)",
            overflow: "hidden",
          }}
        >
          <Animated.View style={[{ height: "100%", borderRadius: 4 }, barStyle]}>
            <LinearGradient
              colors={["#7c3aed", "#a855f7", "#d8b4fe"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={{ flex: 1, borderRadius: 4 }}
            />
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

function NeonV({ size }: { size: number }) {
  const w = size;
  const h = size;
  return (
    <Svg width={w} height={h} viewBox="0 0 120 120">
      <Defs>
        <SvgGradient id="vstroke" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor="#d8b4fe" />
          <Stop offset="50%" stopColor="#a855f7" />
          <Stop offset="100%" stopColor="#7c3aed" />
        </SvgGradient>
      </Defs>
      <Path
        d="M16 22 Q 18 18 24 18 Q 30 18 33 26 L 56 90 Q 60 100 64 90 L 88 26 Q 91 18 97 18 Q 103 18 104 22"
        stroke="url(#vstroke)"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.95}
      />
      <Path
        d="M22 22 L 60 92 L 98 22"
        stroke="#fff"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity={0.85}
      />
    </Svg>
  );
}
