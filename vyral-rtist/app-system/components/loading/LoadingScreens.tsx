/* eslint-disable react-hooks/refs */
import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type LoadingKind = "boot" | "space" | "koi" | "rotist" | "visual";

const copy: Record<LoadingKind, string[]> = {
  boot: ["Waking the system", "Loading your Spaces", "Syncing recent signals", "Preparing your dashboard"],
  space: ["Reading input", "Finding patterns", "Extracting actions", "Building Space", "Ready for review"],
  koi: ["Clearing the surface", "Setting a calm pace", "Preparing your DIVE"],
  rotist: ["Connecting ROTIST", "Calibrating grip profile", "Preparing stroke capture", "Starting writing session"],
  visual: ["Generating Space visual", "Matching visual tone", "Saving to Space"],
};

export function LoadingScreen({ kind = "boot", reduceMotion }: { kind?: LoadingKind; reduceMotion?: boolean }) {
  const [index, setIndex] = useState(0);
  const pulse = useRef(new Animated.Value(0)).current;
  const statuses = copy[kind];

  useEffect(() => {
    const timer = setInterval(() => setIndex((value) => (value + 1) % statuses.length), 900);
    return () => clearInterval(timer);
  }, [statuses.length]);

  useEffect(() => {
    if (reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduceMotion]);

  const icon = useMemo(() => {
    if (kind === "koi") return "water-outline";
    if (kind === "rotist") return "pencil-outline";
    if (kind === "visual") return "image-outline";
    return "sparkles-outline";
  }, [kind]);

  return (
    <View style={styles.loading}>
      <Animated.View
        style={[
          styles.core,
          {
            transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.96, 1.08] }) }],
          },
        ]}
      >
        <Ionicons name={icon} size={34} color="#f7f7ff" />
      </Animated.View>
      <Text style={styles.status}>{statuses[index]}</Text>
      <View style={styles.phaseRow}>
        {statuses.map((item, phaseIndex) => (
          <View key={item} style={[styles.phaseDot, phaseIndex <= index && styles.phaseDotActive]} />
        ))}
      </View>
    </View>
  );
}

export function SpaceMakerLoading() {
  return <LoadingScreen kind="space" />;
}

export function KoiDiveLoading() {
  return <LoadingScreen kind="koi" />;
}

export function RotistSessionLoading() {
  return <LoadingScreen kind="rotist" />;
}

export function GeneratedVisualLoading() {
  return <LoadingScreen kind="visual" />;
}

const styles = StyleSheet.create({
  loading: {
    minHeight: 230,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(5,8,22,0.58)",
    alignItems: "center",
    justifyContent: "center",
    padding: 22,
  },
  core: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(155,92,255,0.38)",
    borderWidth: 1,
    borderColor: "rgba(38,214,232,0.45)",
  },
  status: {
    color: "#f7f7ff",
    fontSize: 17,
    fontWeight: "900",
    marginTop: 18,
    textAlign: "center",
  },
  phaseRow: {
    flexDirection: "row",
    gap: 7,
    marginTop: 15,
  },
  phaseDot: {
    width: 24,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(247,247,255,0.16)",
  },
  phaseDotActive: {
    backgroundColor: "#26d6e8",
  },
});
