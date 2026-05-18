// Discover — placeholder. Will host hashtag browse, creator suggestions, challenge gallery.

import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";

const ACCENT = "#a855f7";

const CATEGORIES = [
  { tag: "#latenightedits", count: "12.4K" },
  { tag: "#vyralmoments", count: "8.7K" },
  { tag: "#creativeflow", count: "6.3K" },
  { tag: "#dorm", count: "4.1K" },
  { tag: "#studyhack", count: "3.9K" },
  { tag: "#firstdraft", count: "2.7K" },
];

export default function Discover() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInUp.duration(500)} style={{ paddingTop: 8 }}>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -1 }}>Discover</Text>
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>
            What teens are making right now.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(100)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: "rgba(255,255,255,0.06)",
            borderRadius: 22,
            paddingHorizontal: 16,
            paddingVertical: 13,
            marginTop: 16,
            gap: 10,
          }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={7} stroke="rgba(255,255,255,0.6)" strokeWidth={1.6} />
            <Path d="M16.5 16.5L20 20" stroke="rgba(255,255,255,0.6)" strokeWidth={1.6} strokeLinecap="round" />
          </Svg>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 14 }}>Search hashtags, creators…</Text>
        </Animated.View>

        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 26 }}>Trending tags</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 }}>
          {CATEGORIES.map((c, i) => (
            <Animated.View
              key={c.tag}
              entering={FadeInDown.duration(400).delay(120 + i * 40)}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 10,
                borderRadius: 16,
                backgroundColor: "rgba(168,85,247,0.10)",
                borderWidth: 1,
                borderColor: "rgba(168,85,247,0.28)",
                flexDirection: "row",
                gap: 8,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>{c.tag}</Text>
              <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 11 }}>{c.count}</Text>
            </Animated.View>
          ))}
        </View>

        <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", marginTop: 28 }}>Challenge gallery</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.duration(450).delay(200 + i * 60)}
              style={{
                width: "47.5%",
                aspectRatio: 0.78,
                borderRadius: 18,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: "rgba(168,85,247,0.18)",
              }}
            >
              <LinearGradient
                colors={
                  i === 0
                    ? ["#3b0764", "#a855f7"]
                    : i === 1
                    ? ["#1e1b4b", "#7c3aed"]
                    : i === 2
                    ? ["#2e1065", "#c084fc"]
                    : ["#0f0820", "#6d28d9"]
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, padding: 12, justifyContent: "flex-end" }}
              >
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, letterSpacing: 1 }}>CHALLENGE</Text>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 2 }}>
                  Slot {i + 1}
                </Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>

        <View
          style={{
            marginTop: 30,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(168,85,247,0.25)",
            backgroundColor: "rgba(168,85,247,0.06)",
          }}
        >
          <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 2, fontWeight: "700" }}>BACKEND TODO</Text>
          <Text style={{ color: "#fff", fontSize: 13, marginTop: 6, lineHeight: 18 }}>
            Wire to Supabase: `posts` + `hashtags` + `challenges`. Feed query by trending score.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
