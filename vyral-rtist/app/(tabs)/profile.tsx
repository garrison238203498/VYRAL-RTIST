// Profile — public-facing identity + private AI Spaces entry point.
// AI Spaces and Legacy are gated below the public profile surface.

import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import PressableScale from "../../components/PressableScale";
import { useAuth } from "../../lib/auth";

const ACCENT = "#a855f7";
const ACCENT_DEEP = "#7c3aed";

export default function Profile() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const handle = user?.email?.split("@")[0] ?? "you";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={false}>
        <Animated.View
          entering={FadeInUp.duration(500)}
          style={{ paddingHorizontal: 20, paddingTop: 8, alignItems: "center" }}
        >
          <View
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              borderWidth: 2,
              borderColor: ACCENT,
              padding: 3,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: ACCENT,
              shadowOpacity: 0.5,
              shadowRadius: 18,
              shadowOffset: { width: 0, height: 0 },
            }}
          >
            <LinearGradient
              colors={[ACCENT, ACCENT_DEEP]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                flex: 1,
                width: "100%",
                borderRadius: 44,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 32, fontWeight: "800" }}>
                {handle[0]?.toUpperCase() ?? "V"}
              </Text>
            </LinearGradient>
          </View>
          <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700", marginTop: 12 }}>@{handle}</Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>
            Vyral creator · joined this week
          </Text>

          <View style={{ flexDirection: "row", gap: 26, marginTop: 18 }}>
            <Stat n="0" label="Posts" />
            <Stat n="0" label="Followers" />
            <Stat n="0" label="Following" />
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(120)}
          style={{ flexDirection: "row", gap: 10, marginTop: 22, paddingHorizontal: 20 }}
        >
          <PressableScale haptic="light" style={{ flex: 1, borderRadius: 14, overflow: "hidden" }}>
            <LinearGradient
              colors={[ACCENT, ACCENT_DEEP]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingVertical: 11, alignItems: "center" }}
            >
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Edit Profile</Text>
            </LinearGradient>
          </PressableScale>
          <PressableScale
            haptic="light"
            style={{
              flex: 1,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.18)",
              paddingVertical: 11,
              alignItems: "center",
            }}
          >
            <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>Share Profile</Text>
          </PressableScale>
        </Animated.View>

        {/* Posts grid placeholder */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(180)}
          style={{ marginTop: 28, paddingHorizontal: 20 }}
        >
          <View style={{ flexDirection: "row", gap: 4 }}>
            {[0, 1, 2].map((i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  aspectRatio: 0.75,
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.03)",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.06)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Rect x={4} y={4} width={16} height={16} rx={2} stroke="rgba(255,255,255,0.2)" strokeWidth={1.4} />
                  <Path d="M10 9.5l5 3-5 3v-6z" fill="rgba(255,255,255,0.2)" />
                </Svg>
              </View>
            ))}
          </View>
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, textAlign: "center", marginTop: 10 }}>
            No posts yet. Tap + to make your first.
          </Text>
        </Animated.View>

        {/* Private tools section */}
        <Animated.View
          entering={FadeInDown.duration(500).delay(240)}
          style={{ marginTop: 32, paddingHorizontal: 20 }}
        >
          <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, letterSpacing: 2, fontWeight: "700" }}>
            PRIVATE TOOLS
          </Text>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>
            Just for you. Nothing here is public.
          </Text>

          <View style={{ marginTop: 14, gap: 10 }}>
            <ToolRow
              title="AI Spaces"
              subtitle="Drop a thought, photo, or PDF — Vyral organizes it."
              accent={ACCENT}
              icon={
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Circle cx={7} cy={7} r={2.6} stroke={ACCENT} strokeWidth={1.8} />
                  <Circle cx={17} cy={7} r={2.6} stroke={ACCENT} strokeWidth={1.8} />
                  <Circle cx={12} cy={17} r={2.6} stroke={ACCENT} strokeWidth={1.8} />
                  <Path d="M9.5 9L12 14M14.5 9L12 14" stroke={ACCENT} strokeWidth={1.4} opacity={0.45} />
                </Svg>
              }
              onPress={() => router.push("/spaces" as any)}
            />
            <ToolRow
              title="Life & Legacy"
              subtitle="Long-form reflections that stay private to you."
              accent="#22d3ee"
              icon={
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 4h9l3 3v13H6z" stroke="#22d3ee" strokeWidth={1.8} strokeLinejoin="round" />
                  <Path d="M14 4v4h4M9 12h6M9 16h4" stroke="#22d3ee" strokeWidth={1.8} strokeLinejoin="round" />
                </Svg>
              }
              onPress={() => router.push("/legacy" as any)}
            />
            <ToolRow
              title="Account & Safety"
              subtitle="Privacy, DMs, age, blocking, reports."
              accent="#a3e635"
              icon={
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path
                    d="M12 3l8 4v6c0 4.5-3.4 7.5-8 8-4.6-.5-8-3.5-8-8V7l8-4z"
                    stroke="#a3e635"
                    strokeWidth={1.8}
                    strokeLinejoin="round"
                  />
                  <Path d="M9 12l2 2 4-4" stroke="#a3e635" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </Svg>
              }
              onPress={() => router.push("/me" as any)}
            />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(320)} style={{ marginTop: 28, paddingHorizontal: 20 }}>
          <PressableScale
            haptic="medium"
            onPress={async () => {
              await signOut();
              router.replace("/login" as any);
            }}
            style={{
              paddingVertical: 12,
              borderRadius: 14,
              borderWidth: 1,
              borderColor: "rgba(239,68,68,0.45)",
              alignItems: "center",
              backgroundColor: "rgba(239,68,68,0.08)",
            }}
          >
            <Text style={{ color: "#fda4af", fontSize: 13, fontWeight: "700" }}>Sign out</Text>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, label }: { n: string; label: string }) {
  return (
    <View style={{ alignItems: "center" }}>
      <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{n}</Text>
      <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, marginTop: 2 }}>{label}</Text>
    </View>
  );
}

function ToolRow({
  title,
  subtitle,
  accent,
  icon,
  onPress,
}: {
  title: string;
  subtitle: string;
  accent: string;
  icon: React.ReactNode;
  onPress: () => void;
}) {
  return (
    <PressableScale
      haptic="light"
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
        padding: 14,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.03)",
      }}
    >
      <View
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: `${accent}1a`,
          borderWidth: 1,
          borderColor: `${accent}55`,
        }}
      >
        {icon}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{title}</Text>
        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>{subtitle}</Text>
      </View>
      <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
        <Path d="M9 6l6 6-6 6" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    </PressableScale>
  );
}
