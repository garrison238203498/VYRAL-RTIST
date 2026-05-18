// Inbox — placeholder. Future home for DMs, notifications, mentions.
// Teen-safety note: DMs default to "followers only" for users <18.

import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInUp, FadeInDown } from "react-native-reanimated";
import Svg, { Path, Circle } from "react-native-svg";

const ACCENT = "#a855f7";

type Tab = "All" | "Mentions" | "Likes" | "DMs";
const TABS: Tab[] = ["All", "Mentions", "Likes", "DMs"];

export default function Inbox() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInUp.duration(500)} style={{ paddingTop: 8 }}>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -1 }}>Inbox</Text>
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>
            Replies, mentions, and DMs from people you follow.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(400).delay(100)}
          style={{ flexDirection: "row", gap: 10, marginTop: 18 }}
        >
          {TABS.map((t, i) => (
            <View
              key={t}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 7,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: i === 0 ? "rgba(168,85,247,0.4)" : "rgba(255,255,255,0.12)",
                backgroundColor: i === 0 ? "rgba(168,85,247,0.14)" : "transparent",
              }}
            >
              <Text style={{ color: i === 0 ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "600" }}>
                {t}
              </Text>
            </View>
          ))}
        </Animated.View>

        <View style={{ marginTop: 24, gap: 12 }}>
          {[0, 1, 2, 3].map((i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.duration(400).delay(140 + i * 50)}
              style={{
                flexDirection: "row",
                gap: 12,
                padding: 14,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.08)",
                backgroundColor: "rgba(255,255,255,0.03)",
              }}
            >
              <View
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  backgroundColor: "rgba(168,85,247,0.15)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={9} r={3} stroke={ACCENT} strokeWidth={1.6} />
                  <Path d="M5 20a7 7 0 0114 0" stroke={ACCENT} strokeWidth={1.6} strokeLinecap="round" />
                </Svg>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>placeholder_user</Text>
                <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 12, marginTop: 2 }}>
                  Sample notification — wire real data after Supabase `notifications` table lands.
                </Text>
              </View>
              <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>2h</Text>
            </Animated.View>
          ))}
        </View>

        <View
          style={{
            marginTop: 28,
            padding: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: "rgba(168,85,247,0.25)",
            backgroundColor: "rgba(168,85,247,0.06)",
          }}
        >
          <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 2, fontWeight: "700" }}>SAFETY DEFAULT</Text>
          <Text style={{ color: "#fff", fontSize: 13, marginTop: 6, lineHeight: 18 }}>
            For accounts &lt;18: DMs are followers-only, image filtering on, report &amp; block one tap away.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
