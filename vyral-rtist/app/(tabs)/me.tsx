import { useCallback, useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import GlassCard from "../../components/GlassCard";
import Pill from "../../components/Pill";
import NeonButton from "../../components/NeonButton";
import PressableScale from "../../components/PressableScale";
import { accentHex, colors } from "../../components/theme";
import { runAffinity, type AffinityProfile } from "../../lib/intake";
import { readJson, STORE_KEYS, writeJson, type ApprovedSpace } from "../../lib/store";
import { useAuth } from "../../lib/auth";

export default function Me() {
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [profile, setProfile] = useState<AffinityProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ spaces: 0, themes: 0, intakes: 0 });
  const [name, setName] = useState("");

  const load = useCallback(async () => {
    const [cached, n, sp, th, ints] = await Promise.all([
      readJson<AffinityProfile | null>(STORE_KEYS.affinityProfile, null),
      readJson<string>(STORE_KEYS.userName, ""),
      readJson<ApprovedSpace[]>(STORE_KEYS.approvedSpaces, []),
      readJson<Array<{ name: string; weight: number }>>(STORE_KEYS.themes, []),
      readJson<Array<{ vibe: string; summary_title: string }>>(STORE_KEYS.recentIntakes, []),
    ]);
    setProfile(cached);
    setName(n || (user?.email?.split("@")[0] ?? "you"));
    setStats({ spaces: sp.length, themes: th.length, intakes: ints.length });
  }, [user]);

  useEffect(() => { load(); }, [load]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function generateProfile() {
    setLoading(true);
    setError(null);
    try {
      const [themes, spaces, recent, nav] = await Promise.all([
        readJson<Array<{ name: string; weight: number }>>(STORE_KEYS.themes, []),
        readJson<ApprovedSpace[]>(STORE_KEYS.approvedSpaces, []),
        readJson<Array<{ vibe: string; summary_title: string }>>(STORE_KEYS.recentIntakes, []),
        readJson<{
          first_screens?: string[];
          last_screens?: string[];
          most_visited?: string[];
        }>(STORE_KEYS.navigationPattern, {}),
      ]);

      const result = await runAffinity({
        userName: name || "you",
        userData: {
          themes,
          spaces: spaces.map((s) => ({
            name: s.name,
            kind: s.kind,
            reason: s.reason,
            signals: s.themes.map((t) => t.name),
          })),
          recent_intakes: recent,
          navigation_pattern: nav,
        },
      });
      setProfile(result);
      await writeJson(STORE_KEYS.affinityProfile, result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not read affinity.");
    } finally {
      setLoading(false);
    }
  }

  const initial = (name || "?").trim()[0]?.toUpperCase() ?? "?";

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 8, paddingBottom: 120, gap: 14 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile header */}
        <Animated.View entering={FadeInUp.duration(500)}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            <View
              style={{
                width: 64,
                height: 64,
                borderRadius: 22,
                overflow: "hidden",
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1.5,
                borderColor: "rgba(168,85,247,0.5)",
              }}
            >
              <LinearGradient
                colors={["#a855f7", "#22d3ee", "#a3e635"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: "absolute", inset: 0 } as any}
              />
              <Text style={{ color: "#fff", fontSize: 26, fontWeight: "700", letterSpacing: -1 }}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.textHi, fontSize: 22, fontWeight: "700", letterSpacing: -0.5 }}>
                {name || "you"}
              </Text>
              <Text style={{ color: colors.textLo, fontSize: 12, marginTop: 2 }}>
                {user?.email || "running in local mode"}
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Stats strip */}
        <Animated.View entering={FadeInUp.delay(80).duration(500)}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <Stat label="Spaces" value={stats.spaces} tone="violet" />
            <Stat label="Themes" value={stats.themes} tone="cyan" />
            <Stat label="Captures" value={stats.intakes} tone="lime" />
          </View>
        </Animated.View>

        {/* Affinity profile */}
        <Animated.View entering={FadeInDown.delay(140).duration(500)}>
          <GlassCard accent="violet" rounded="xl" intensity={26} glow={!!profile}>
            <View style={{ padding: 18, gap: 12 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Pill tone="violet" size="sm" dot>Resonance · honest read</Pill>
                {profile && (
                  <Text style={{ color: colors.textXLo, fontSize: 10 }}>
                    {profile.data_points} data points
                  </Text>
                )}
              </View>

              {profile ? (
                <>
                  <Text style={{ color: colors.textXLo, fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase" }}>
                    Archetype
                  </Text>
                  <Text style={{ color: colors.textHi, fontSize: 22, fontWeight: "700", letterSpacing: -0.5 }}>
                    {profile.archetype}
                  </Text>
                  <Text style={{ color: colors.textMid, fontSize: 13, lineHeight: 19 }}>
                    {profile.resonance_pattern}
                  </Text>

                  {profile.signals?.length > 0 && (
                    <View style={{ gap: 8, marginTop: 4 }}>
                      {profile.signals.map((s, i) => (
                        <View
                          key={i}
                          style={{
                            borderLeftWidth: 2,
                            borderLeftColor: accentHex.violet,
                            paddingLeft: 10,
                          }}
                        >
                          <Text style={{ color: accentHex.violet, fontSize: 11, fontWeight: "600", letterSpacing: 0.4 }}>
                            {s.name}
                          </Text>
                          <Text style={{ color: colors.textMid, fontSize: 12, lineHeight: 17, marginTop: 2 }}>
                            {s.evidence}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {profile.ideal_collaborator_traits?.length > 0 && (
                    <View style={{ marginTop: 4 }}>
                      <Text style={{ color: colors.textXLo, fontSize: 10, letterSpacing: 1.6, textTransform: "uppercase", marginBottom: 6 }}>
                        Would resonate with
                      </Text>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
                        {profile.ideal_collaborator_traits.map((t) => (
                          <Pill key={t} tone="cyan" size="sm">{t}</Pill>
                        ))}
                      </View>
                    </View>
                  )}

                  <View
                    style={{
                      marginTop: 4,
                      borderRadius: 14,
                      padding: 12,
                      backgroundColor: "rgba(163,230,53,0.08)",
                      borderWidth: 1,
                      borderColor: "rgba(163,230,53,0.22)",
                    }}
                  >
                    <Text style={{ color: accentHex.lime, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", fontWeight: "600" }}>
                      One thing to build on
                    </Text>
                    <Text style={{ color: colors.textHi, fontSize: 13, lineHeight: 19, marginTop: 4 }}>
                      {profile.one_thing_to_build_on}
                    </Text>
                  </View>

                  <Text style={{ color: colors.textXLo, fontSize: 10, fontStyle: "italic" }}>
                    {profile.honesty_note}
                  </Text>

                  <View style={{ marginTop: 4 }}>
                    <NeonButton
                      label={loading ? "Reading…" : "Re-read with latest data"}
                      onPress={generateProfile}
                      variant="outline"
                      disabled={loading}
                      haptic="light"
                    />
                  </View>
                </>
              ) : (
                <>
                  <Text style={{ color: colors.textMid, fontSize: 13, lineHeight: 19 }}>
                    {stats.spaces === 0
                      ? "Capture a few things first. Vyral builds your resonance from real behavior — never made-up archetypes."
                      : "Vyral can read your patterns now. The more you capture, the sharper this gets."}
                  </Text>
                  <NeonButton
                    label={loading ? "Reading…" : "Read my resonance"}
                    onPress={generateProfile}
                    accent="violet"
                    disabled={loading || stats.spaces === 0}
                    haptic="medium"
                  />
                </>
              )}
              {error && (
                <Text style={{ color: "#fb7185", fontSize: 12, marginTop: 4 }}>{error}</Text>
              )}
            </View>
          </GlassCard>
        </Animated.View>

        {/* Honest framing */}
        <Animated.View entering={FadeInDown.delay(220).duration(500)}>
          <GlassCard rounded="lg" intensity={16}>
            <View style={{ padding: 14, gap: 6 }}>
              <Pill tone="lime" size="sm">When friends join</Pill>
              <Text style={{ color: colors.textMid, fontSize: 12, lineHeight: 18, marginTop: 4 }}>
                This profile becomes your match key — only with your explicit consent. Vyral never sells data, never publishes anything, never matches you anonymously.
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Sign out */}
        {user && (
          <Animated.View entering={FadeInDown.delay(280).duration(500)}>
            <PressableScale onPress={() => signOut()} haptic="light">
              <View
                style={{
                  borderRadius: 14,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.08)",
                  backgroundColor: "rgba(255,255,255,0.025)",
                  paddingVertical: 12,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.textLo, fontSize: 12 }}>Sign out</Text>
              </View>
            </PressableScale>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone: "violet" | "cyan" | "pink" | "lime" }) {
  return (
    <View
      style={{
        flex: 1,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.08)",
        backgroundColor: "rgba(255,255,255,0.03)",
        padding: 14,
      }}
    >
      <Text style={{ color: accentHex[tone], fontSize: 22, fontWeight: "700" }}>{value}</Text>
      <Text style={{ color: colors.textLo, fontSize: 10, letterSpacing: 1.4, textTransform: "uppercase", marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
}
