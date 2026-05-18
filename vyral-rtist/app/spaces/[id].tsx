import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import GlassCard from "../../components/GlassCard";
import Pill from "../../components/Pill";
import PressableScale from "../../components/PressableScale";
import { accentBorder, accentHex, accentTint, colors } from "../../components/theme";
import { readJson, STORE_KEYS, writeJson, type ApprovedSpace } from "../../lib/store";

export default function SpaceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [space, setSpace] = useState<ApprovedSpace | null>(null);

  const load = useCallback(async () => {
    const all = await readJson<ApprovedSpace[]>(STORE_KEYS.approvedSpaces, []);
    setSpace(all.find((s) => s.id === id) ?? null);
  }, [id]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function toggleTask(taskId: string) {
    const all = await readJson<ApprovedSpace[]>(STORE_KEYS.approvedSpaces, []);
    const next = all.map((s) =>
      s.id === id
        ? { ...s, tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, done: !t.done } : t)) }
        : s
    );
    await writeJson(STORE_KEYS.approvedSpaces, next);
    setSpace(next.find((s) => s.id === id) ?? null);
  }

  if (!space) {
    return (
      <SafeAreaView style={{ flex: 1, alignItems: "center", justifyContent: "center" }} edges={["top"]}>
        <Text style={{ color: colors.textLo, fontSize: 13 }}>Loading…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <View style={{ flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingTop: 4, paddingBottom: 8 }}>
        <PressableScale onPress={() => router.back()} haptic="light" scaleTo={0.9}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              backgroundColor: "rgba(255,255,255,0.04)",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
              <Path d="M15 6l-6 6 6 6" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
            </Svg>
          </View>
        </PressableScale>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 4, paddingBottom: 120, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(500)}>
          <Pill tone={space.accent} size="sm" dot>{space.kind}</Pill>
          <Text style={{ color: colors.textHi, fontSize: 28, fontWeight: "700", letterSpacing: -1, marginTop: 10, lineHeight: 32 }}>
            {space.name}
          </Text>
          <Text style={{ color: colors.textLo, fontSize: 13, lineHeight: 19, marginTop: 6 }}>{space.reason}</Text>
        </Animated.View>

        {/* Tasks */}
        <Animated.View entering={FadeInDown.delay(80).duration(500)}>
          <Section label={`Tasks · ${space.tasks.filter((t) => !t.done).length} open`} />
          <View style={{ gap: 8 }}>
            {space.tasks.map((t) => (
              <Animated.View key={t.id} layout={Layout.springify()}>
                <PressableScale onPress={() => toggleTask(t.id)} haptic="selection">
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      borderRadius: 14,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: t.done ? accentBorder.lime : colors.border,
                      backgroundColor: t.done ? accentTint.lime : "rgba(255,255,255,0.03)",
                    }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 6,
                        borderWidth: 1.5,
                        borderColor: t.done ? accentHex.lime : "rgba(255,255,255,0.25)",
                        backgroundColor: t.done ? accentHex.lime : "transparent",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {t.done && (
                        <Svg width={12} height={12} viewBox="0 0 24 24">
                          <Path d="M5 13l4 4L19 7" stroke={colors.bg} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
                        </Svg>
                      )}
                    </View>
                    <Text
                      style={{
                        color: t.done ? colors.textLo : colors.textHi,
                        fontSize: 13,
                        flex: 1,
                        textDecorationLine: t.done ? "line-through" : undefined,
                      }}
                    >
                      {t.text}
                    </Text>
                    {t.due_relative && !t.done && (
                      <Text style={{ color: accentHex.cyan, fontSize: 11 }}>{t.due_relative}</Text>
                    )}
                  </View>
                </PressableScale>
              </Animated.View>
            ))}
            {space.tasks.length === 0 && (
              <Text style={{ color: colors.textLo, fontSize: 12 }}>No tasks here yet.</Text>
            )}
          </View>
        </Animated.View>

        {/* Captures / Summaries */}
        <Animated.View entering={FadeInDown.delay(140).duration(500)}>
          <Section label={`Captures · ${space.summaries.length}`} />
          <View style={{ gap: 8 }}>
            {space.summaries.map((s, i) => (
              <GlassCard key={i} rounded="lg" intensity={18}>
                <View style={{ padding: 12 }}>
                  <Text style={{ color: colors.textXLo, fontSize: 10, letterSpacing: 1.2 }}>
                    {new Date(s.savedAt).toLocaleString()}
                  </Text>
                  <Text style={{ color: colors.textHi, fontSize: 14, fontWeight: "600", marginTop: 4 }}>{s.title}</Text>
                  <Text style={{ color: colors.textMid, fontSize: 12, lineHeight: 18, marginTop: 4 }}>{s.body}</Text>
                </View>
              </GlassCard>
            ))}
          </View>
        </Animated.View>

        {/* Themes */}
        {space.themes.length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Section label="Themes" />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
              {space.themes.map((t) => (
                <Pill key={t.name} tone={space.accent} size="sm">{t.name}</Pill>
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ label }: { label: string }) {
  return (
    <Text
      style={{
        color: colors.textLo,
        fontSize: 10,
        letterSpacing: 2,
        textTransform: "uppercase",
        fontWeight: "600",
        marginBottom: 8,
      }}
    >
      {label}
    </Text>
  );
}
