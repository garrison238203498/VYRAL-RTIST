import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";
import GlassCard from "../../components/GlassCard";
import Pill from "../../components/Pill";
import { colors } from "../../components/theme";
import { readJson, STORE_KEYS, type LegacyEntry } from "../../lib/store";

export default function Legacy() {
  const [entries, setEntries] = useState<LegacyEntry[]>([]);

  const load = useCallback(async () => {
    const l = await readJson<LegacyEntry[]>(STORE_KEYS.legacy, []);
    setEntries(l);
  }, []);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 120, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInUp.duration(500)}>
          <Pill tone="pink" dot size="sm">Life & Legacy</Pill>
          <Text style={{ color: colors.textHi, fontSize: 30, fontWeight: "700", letterSpacing: -1, marginTop: 8, lineHeight: 32 }}>
            Long-term memory.
          </Text>
          <Text style={{ color: colors.textLo, fontSize: 13, lineHeight: 19, marginTop: 4 }}>
            Quiet record of what you became. Nothing here was added without your approval.
          </Text>
        </Animated.View>

        {entries.length === 0 ? (
          <Animated.View entering={FadeInDown.delay(120).duration(500)}>
            <GlassCard rounded="xl" intensity={20}>
              <View style={{ padding: 22, alignItems: "center", gap: 8 }}>
                <Text style={{ color: colors.textHi, fontSize: 15, fontWeight: "600" }}>Empty for now</Text>
                <Text style={{ color: colors.textLo, fontSize: 12, lineHeight: 18, textAlign: "center" }}>
                  When you Approve a capture and toggle "Save to Legacy", it lives here.
                </Text>
              </View>
            </GlassCard>
          </Animated.View>
        ) : (
          <View style={{ gap: 12 }}>
            {entries.map((e, i) => (
              <Animated.View key={e.id} entering={FadeInDown.delay(60 * i).duration(420)} layout={Layout.springify()}>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <View style={{ alignItems: "center", paddingTop: 18 }}>
                    <View
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: "#a855f7",
                        shadowColor: "#a855f7",
                        shadowOpacity: 0.7,
                        shadowRadius: 8,
                      }}
                    />
                    {i < entries.length - 1 && (
                      <View style={{ flex: 1, width: 1, marginTop: 6, backgroundColor: "rgba(168,85,247,0.2)" }} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <GlassCard accent="violet" rounded="lg" intensity={20}>
                      <View style={{ padding: 14 }}>
                        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                          <Pill tone="violet" size="sm">{e.kind}</Pill>
                          <Text style={{ color: colors.textXLo, fontSize: 10 }}>
                            {new Date(e.savedAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <Text style={{ color: colors.textHi, fontSize: 16, fontWeight: "700", marginTop: 8 }}>
                          {e.title}
                        </Text>
                        <Text style={{ color: colors.textMid, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                          {e.body}
                        </Text>
                        {e.sourceVibe && (
                          <Text style={{ color: colors.textXLo, fontSize: 10, marginTop: 6, fontStyle: "italic" }}>
                            vibe · {e.sourceVibe}
                          </Text>
                        )}
                      </View>
                    </GlassCard>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
