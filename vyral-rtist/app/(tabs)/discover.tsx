import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";
import { useAccent } from "../../lib/themeContext";

const CHALLENGE_DATA = [
  { title: "Late Night Edits", tag: "#latenightedits", colors: ["#3b0764", "#a855f7"] as [string, string] },
  { title: "60-second freestyle", tag: "#freestyle60", colors: ["#1e1b4b", "#7c3aed"] as [string, string] },
  { title: "Study with me", tag: "#studywithme", colors: ["#2e1065", "#c084fc"] as [string, string] },
  { title: "Raw take", tag: "#rawtake", colors: ["#0f0820", "#6d28d9"] as [string, string] },
];

const CATEGORIES = [
  { tag: "#latenightedits", count: "12.4K" },
  { tag: "#vyralmoments", count: "8.7K" },
  { tag: "#creativeflow", count: "6.3K" },
  { tag: "#dorm", count: "4.1K" },
  { tag: "#studyhack", count: "3.9K" },
  { tag: "#firstdraft", count: "2.7K" },
];

export default function Discover() {
  const ACCENT = useAccent("discoverTag", "#a855f7");
  const [query, setQuery] = useState("");

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
            paddingVertical: 4,
            marginTop: 16,
            gap: 10,
          }}
        >
          <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <Circle cx={11} cy={11} r={7} stroke="rgba(255,255,255,0.6)" strokeWidth={1.6} />
            <Path d="M16.5 16.5L20 20" stroke="rgba(255,255,255,0.6)" strokeWidth={1.6} strokeLinecap="round" />
          </Svg>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search hashtags, creators…"
            placeholderTextColor="rgba(255,255,255,0.45)"
            style={{ flex: 1, color: "#fff", fontSize: 14, paddingVertical: 12 }}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <Text onPress={() => setQuery("")} style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, paddingHorizontal: 4 }}>
              ×
            </Text>
          )}
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
                backgroundColor: `${ACCENT}1a`,
                borderWidth: 1,
                borderColor: `${ACCENT}47`,
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
          {CHALLENGE_DATA.map((challenge, i) => (
            <Animated.View
              key={challenge.title}
              entering={FadeInDown.duration(450).delay(200 + i * 60)}
              style={{
                width: "47.5%",
                aspectRatio: 0.78,
                borderRadius: 18,
                overflow: "hidden",
                borderWidth: 1,
                borderColor: `${ACCENT}2e`,
              }}
            >
              <LinearGradient
                colors={challenge.colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ flex: 1, padding: 12, justifyContent: "flex-end" }}
              >
                <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 10, letterSpacing: 1 }}>CHALLENGE</Text>
                <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 2 }}>
                  {challenge.title}
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, marginTop: 3 }}>{challenge.tag}</Text>
              </LinearGradient>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
