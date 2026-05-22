// Inbox — notifications, mentions, DMs.
// Teen-safety note: DMs default to followers-only for users under 18.

import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import PressableScale from "../../components/PressableScale";
import { useAccent } from "../../lib/themeContext";

type Tab = "All" | "Mentions" | "Likes" | "DMs";
const TABS: Tab[] = ["All", "Mentions", "Likes", "DMs"];

export default function Inbox() {
  const ACCENT = useAccent("inboxTab", "#a855f7");
  const [activeTab, setActiveTab] = useState<Tab>("All");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120, paddingHorizontal: 20 }}>
        <Animated.View entering={FadeInUp.duration(500)} style={{ paddingTop: 8 }}>
          <Text style={{ color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: -1 }}>Inbox</Text>
          <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, marginTop: 4 }}>
            Replies, mentions, and DMs from people you follow.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(400).delay(100)} style={{ flexDirection: "row", gap: 10, marginTop: 18 }}>
          {TABS.map((t) => {
            const isActive = t === activeTab;
            return (
              <PressableScale
                key={t}
                haptic="selection"
                onPress={() => setActiveTab(t)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: isActive ? `${ACCENT}66` : "rgba(255,255,255,0.12)",
                  backgroundColor: isActive ? `${ACCENT}22` : "transparent",
                }}
              >
                <Text style={{ color: isActive ? "#fff" : "rgba(255,255,255,0.55)", fontSize: 12, fontWeight: "600" }}>
                  {t}
                </Text>
              </PressableScale>
            );
          })}
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(500).delay(200)}
          style={{ marginTop: 60, alignItems: "center", paddingHorizontal: 30 }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: `${ACCENT}1f`,
              borderWidth: 1,
              borderColor: `${ACCENT}4d`,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <Svg width={30} height={30} viewBox="0 0 24 24" fill="none">
              <Path
                d="M4 7a3 3 0 013-3h10a3 3 0 013 3v8a3 3 0 01-3 3h-7l-4 3v-3H7a3 3 0 01-3-3V7z"
                stroke={ACCENT}
                strokeWidth={1.6}
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700", textAlign: "center" }}>Nothing here yet</Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginTop: 8, textAlign: "center", lineHeight: 20 }}>
            When people react to your posts, follow you, or message you, it’ll show up here.
          </Text>
        </Animated.View>

        <Animated.View
          entering={FadeInDown.duration(400).delay(320)}
          style={{ marginTop: 40, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: `${ACCENT}40`, backgroundColor: `${ACCENT}0f` }}
        >
          <Text style={{ color: ACCENT, fontSize: 11, letterSpacing: 2, fontWeight: "700" }}>SAFETY</Text>
          <Text style={{ color: "#fff", fontSize: 13, marginTop: 6, lineHeight: 18 }}>
            For accounts under 18: DMs are followers-only, image filtering on, report &amp; block one tap away.
          </Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
