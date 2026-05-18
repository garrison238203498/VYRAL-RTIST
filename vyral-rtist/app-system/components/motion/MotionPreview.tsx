/* eslint-disable react-hooks/refs */
import { useEffect, useRef } from "react";
import { Animated, Easing, StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { AnimationTheme, GeneratedSpace, KoiSession, RotistSession } from "../../lib/ai/types";

type LegacyEntry = {
  title: string;
  body: string;
};

export function MotionPreview({
  theme,
  space,
  koi,
  rotist,
  legacy,
  reduceMotion,
}: {
  theme: AnimationTheme;
  space?: GeneratedSpace;
  koi?: KoiSession;
  rotist?: RotistSession;
  legacy?: LegacyEntry;
  reduceMotion?: boolean;
}) {
  if (theme === "koi_ripple") return <KoiDivePreview session={koi} reduceMotion={reduceMotion} />;
  if (theme === "rotist_trace") return <RotistTracePreview session={rotist} reduceMotion={reduceMotion} />;
  if (theme === "legacy_memory") return <LegacyMemoryPreview entry={legacy} reduceMotion={reduceMotion} />;
  return <SpaceBloomPreview space={space} reduceMotion={reduceMotion} />;
}

export function SpaceBloomPreview({ space, reduceMotion }: { space?: GeneratedSpace; reduceMotion?: boolean }) {
  const anim = useLoop(reduceMotion);
  return (
    <View style={styles.scene}>
      {Array.from({ length: 8 }).map((_, index) => (
        <Animated.View
          key={index}
          style={[
            styles.fragment,
            {
              left: 18 + (index % 4) * 54,
              top: 20 + Math.floor(index / 4) * 64,
              opacity: anim.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.82] }),
              transform: [
                { translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [(index - 3) * 8, 0] }) },
                { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [index % 2 ? 18 : -14, 0] }) },
              ],
            },
          ]}
        />
      ))}
      <Animated.View style={[styles.spaceOrb, { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.04] }) }] }]}>
        <Ionicons name="planet-outline" size={25} color="#f7f7ff" />
      </Animated.View>
      <Text style={styles.sceneTitle}>{space?.spaceName || "Space Bloom"}</Text>
    </View>
  );
}

export function KoiDivePreview({ session, reduceMotion }: { session?: KoiSession; reduceMotion?: boolean }) {
  const anim = useLoop(reduceMotion);
  const rotate = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  return (
    <View style={styles.scene}>
      <Animated.View style={[styles.rippleRing, { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.14] }) }] }]} />
      <Animated.View style={[styles.koiOrbit, { transform: [{ rotate }] }]}>
        <View style={[styles.koiFish, { backgroundColor: "#27d9ff", left: 4 }]} />
        <View style={[styles.koiFish, { backgroundColor: "#ff7bb8", right: 4, bottom: 0 }]} />
      </Animated.View>
      <Text style={styles.diveWord}>DIVE</Text>
      <Text style={styles.sceneCaption}>{session?.nextAction || "Breathe. Reflect. Return with one step."}</Text>
    </View>
  );
}

export function RotistTracePreview({ session, reduceMotion }: { session?: RotistSession; reduceMotion?: boolean }) {
  const anim = useLoop(reduceMotion);
  return (
    <View style={styles.scene}>
      <View style={styles.tracePage}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.traceLine,
              {
                width: anim.interpolate({ inputRange: [0, 1], outputRange: ["18%", `${42 + index * 9}%`] }),
                top: 18 + index * 21,
              },
            ]}
          />
        ))}
        <Animated.View style={[styles.pressureDot, { transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [0.8, 1.8] }) }] }]} />
      </View>
      <Text style={styles.sceneTitle}>{session?.title || "ROTIST Trace"}</Text>
    </View>
  );
}

export function LegacyMemoryPreview({ entry, reduceMotion }: { entry?: LegacyEntry; reduceMotion?: boolean }) {
  const anim = useLoop(reduceMotion);
  return (
    <View style={styles.scene}>
      <View style={styles.timeline} />
      <Animated.View style={[styles.memoryCard, { transform: [{ translateX: anim.interpolate({ inputRange: [0, 1], outputRange: [-18, 18] }) }] }]}>
        <Text style={styles.sceneTitle}>{entry?.title || "Saved Memory"}</Text>
        <Text style={styles.sceneCaption}>{entry?.body || "This moment joined Life & Legacy."}</Text>
      </Animated.View>
    </View>
  );
}

function useLoop(reduceMotion?: boolean) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduceMotion) {
      anim.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim, reduceMotion]);
  return anim;
}

const styles = StyleSheet.create({
  scene: {
    height: 190,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    backgroundColor: "rgba(5,8,22,0.62)",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  fragment: {
    position: "absolute",
    width: 42,
    height: 24,
    borderRadius: 10,
    backgroundColor: "rgba(38,214,232,0.28)",
  },
  spaceOrb: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(155,92,255,0.5)",
    borderWidth: 1,
    borderColor: "rgba(38,214,232,0.55)",
  },
  sceneTitle: {
    color: "#f7f7ff",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center",
  },
  sceneCaption: {
    color: "rgba(247,247,255,0.62)",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6,
    maxWidth: 240,
    textAlign: "center",
  },
  rippleRing: {
    position: "absolute",
    width: 138,
    height: 138,
    borderRadius: 69,
    borderWidth: 1,
    borderColor: "rgba(39,217,255,0.45)",
  },
  koiOrbit: {
    width: 162,
    height: 162,
    borderRadius: 81,
    position: "absolute",
  },
  koiFish: {
    position: "absolute",
    width: 48,
    height: 16,
    borderRadius: 16,
    top: 48,
  },
  diveWord: {
    color: "#f7f7ff",
    fontSize: 38,
    fontWeight: "900",
    letterSpacing: 3,
    textShadowColor: "#27d9ff",
    textShadowRadius: 14,
  },
  tracePage: {
    width: 220,
    height: 124,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  traceLine: {
    position: "absolute",
    left: 20,
    height: 7,
    borderRadius: 999,
    backgroundColor: "#b7f75a",
  },
  pressureDot: {
    position: "absolute",
    right: 36,
    bottom: 28,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "rgba(255,90,165,0.75)",
  },
  timeline: {
    position: "absolute",
    left: 46,
    right: 46,
    height: 2,
    backgroundColor: "rgba(247,247,255,0.18)",
  },
  memoryCard: {
    width: 230,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,211,106,0.3)",
    backgroundColor: "rgba(255,255,255,0.075)",
    padding: 14,
    alignItems: "center",
  },
});
