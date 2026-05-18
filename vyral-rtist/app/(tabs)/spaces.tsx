import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import GlassCard from "../../components/GlassCard";
import Pill from "../../components/Pill";
import PressableScale from "../../components/PressableScale";
import NeonButton from "../../components/NeonButton";
import { accentHex, colors } from "../../components/theme";
import { readJson, STORE_KEYS, type ApprovedSpace } from "../../lib/store";

export default function Spaces() {
  const router = useRouter();
  const [spaces, setSpaces] = useState<ApprovedSpace[]>([]);

  const load = useCallback(async () => {
    const s = await readJson<ApprovedSpace[]>(STORE_KEYS.approvedSpaces, []);
    setSpaces(s);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 120, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(500)}>
          <Pill tone="violet" dot size="sm">Spaces</Pill>
          <Text style={{ color: colors.textHi, fontSize: 30, fontWeight: "700", letterSpacing: -1, marginTop: 8, lineHeight: 32 }}>
            Your living environments.
          </Text>
          <Text style={{ color: colors.textLo, fontSize: 13, lineHeight: 19, marginTop: 4 }}>
            {spaces.length === 0
              ? "Your first capture will become your first Space."
              : "Tap any Space to open its tasks, captures, and themes."}
          </Text>
        </Animated.View>

        {spaces.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(120).duration(500)}>
            <GlassCard rounded="xl" intensity={22}>
              <View style={{ padding: 22, alignItems: "center", gap: 12 }}>
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 18,
                    backgroundColor: "rgba(168,85,247,0.15)",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: accentHex.violet, fontSize: 28 }}>◇</Text>
                </View>
                <Text style={{ color: colors.textHi, fontSize: 16, fontWeight: "600", textAlign: "center" }}>
                  No Spaces yet
                </Text>
                <Text style={{ color: colors.textLo, fontSize: 12, lineHeight: 18, textAlign: "center" }}>
                  Spaces form from real captures. Tap the + and Vyral will build your first one.
                </Text>
                <NeonButton label="Capture now" accent="lime" onPress={() => router.push("/(tabs)/capture")} haptic="medium" />
              </View>
            </GlassCard>
          </Animated.View>
        ) : (
          <View style={{ gap: 10 }}>
            {spaces.map((s, i) => (
              <Animated.View key={s.id} entering={FadeInDown.delay(60 * i).duration(420)} layout={Layout.springify()}>
                <PressableScale onPress={() => router.push({ pathname: "/spaces/[id]", params: { id: s.id } })} haptic="selection">
                  <GlassCard accent={s.accent} rounded="xl" intensity={22}>
                    <View style={{ padding: 16, gap: 8 }}>
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <Pill tone={s.accent} size="sm" dot>{s.kind}</Pill>
                        <Text style={{ color: colors.textXLo, fontSize: 11 }}>
                          {new Date(s.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={{ color: colors.textHi, fontSize: 19, fontWeight: "700", letterSpacing: -0.5 }}>
                        {s.name}
                      </Text>
                      <Text numberOfLines={2} style={{ color: colors.textMid, fontSize: 12, lineHeight: 18 }}>
                        {s.reason}
                      </Text>
                      <View style={{ flexDirection: "row", gap: 16, marginTop: 6 }}>
                        <Stat n={s.tasks.filter((t) => !t.done).length} l="open tasks" />
                        <Stat n={s.summaries.length} l="captures" />
                        <Stat n={s.themes.length} l="themes" />
                      </View>
                    </View>
                  </GlassCard>
                </PressableScale>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ n, l }: { n: number; l: string }) {
  return (
    <View>
      <Text style={{ color: colors.textHi, fontSize: 14, fontWeight: "700" }}>{n}</Text>
      <Text style={{ color: colors.textXLo, fontSize: 9, letterSpacing: 1.2, textTransform: "uppercase" }}>{l}</Text>
    </View>
  );
}
