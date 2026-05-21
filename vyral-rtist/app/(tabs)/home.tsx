// Vyral social Home — wired to Supabase.
// Trending Now, Daily Challenge, and For You feed all read from real tables.

import { useCallback, useEffect, useState } from "react";
import { RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import Svg, { Circle, Path, Rect } from "react-native-svg";
import PressableScale from "../../components/PressableScale";
import Shimmer from "../../components/Shimmer";
import {
  fetchActiveChallenge,
  fetchForYouFeed,
  fetchTrendingHashtags,
  formatChallengeCountdown,
  type FeedPost,
} from "../../lib/social";
import type { Challenge, Hashtag } from "../../lib/database.types";
import { useAccent } from "../../lib/themeContext";

const DEFAULT_ACCENT = "#a855f7";
const DEFAULT_ACCENT_DEEP = "#7c3aed";

const TRENDING_GRADIENTS: Array<[string, string]> = [
  ["#3b0764", "#a855f7"],
  ["#1e1b4b", "#7c3aed"],
  ["#2e1065", "#c084fc"],
  ["#0f0820", "#6d28d9"],
];

const FEED_GRADIENTS: Array<[string, string]> = [
  ["#1e1b4b", "#7c3aed"],
  ["#3b0764", "#a855f7"],
  ["#2e1065", "#6d28d9"],
];

export default function Home() {
  const router = useRouter();
  const ACCENT = useAccent("homeHero", DEFAULT_ACCENT);
  const ACCENT_DEEP = useAccent("feedCard", DEFAULT_ACCENT_DEEP);
  const [trending, setTrending] = useState<Hashtag[]>([]);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [countdown, setCountdown] = useState<string>("—:—:—");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    const [t, c, f] = await Promise.all([
      fetchTrendingHashtags(3),
      fetchActiveChallenge(),
      fetchForYouFeed(10),
    ]);
    setTrending(t);
    setChallenge(c);
    setFeed(f);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  useEffect(() => {
    if (!challenge) { setCountdown("—:—:—"); return; }
    const tick = () => setCountdown(formatChallengeCountdown(challenge.ends_at));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [challenge]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  function handleSearchSubmit() {
    if (query.trim().length > 0) router.push("/(tabs)/discover" as any);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={ACCENT} />
        }
      >
        <Animated.View entering={FadeInUp.duration(500)} style={{ paddingHorizontal: 20, paddingTop: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: ACCENT, fontSize: 30, fontWeight: "800", letterSpacing: -1.2 }}>vyral</Text>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <PressableScale haptic="light" style={iconBtnStyle} onPress={() => router.push("/(tabs)/inbox" as any)}>
                <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 8a6 6 0 0112 0v5l1.5 3h-15L6 13V8z" stroke="#fff" strokeWidth={1.6} strokeLinejoin="round" />
                  <Path d="M10 19a2 2 0 004 0" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
                </Svg>
              </PressableScale>
              <PressableScale
                haptic="light"
                onPress={() => router.push("/(tabs)/profile" as any)}
                style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.08)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}
              >
                <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
                  <Circle cx={12} cy={9} r={3} stroke="rgba(255,255,255,0.7)" strokeWidth={1.6} />
                  <Path d="M5 20a7 7 0 0114 0" stroke="rgba(255,255,255,0.7)" strokeWidth={1.6} strokeLinecap="round" />
                </Svg>
              </PressableScale>
            </View>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInUp.duration(500).delay(80)} style={{ paddingHorizontal: 20, marginTop: 18 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "rgba(255,255,255,0.06)",
              borderRadius: 22,
              paddingHorizontal: 16,
              paddingVertical: 13,
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.06)",
              gap: 10,
            }}
          >
            <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
              <Circle cx={11} cy={11} r={7} stroke="rgba(255,255,255,0.6)" strokeWidth={1.6} />
              <Path d="M16.5 16.5L20 20" stroke="rgba(255,255,255,0.6)" strokeWidth={1.6} strokeLinecap="round" />
            </Svg>
            <TextInput
              placeholder="Search creators, content, challenges…"
              placeholderTextColor="rgba(255,255,255,0.45)"
              style={{ flex: 1, color: "#fff", fontSize: 14 }}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
              blurOnSubmit
            />
            {query.length > 0 && (
              <TouchableOpacity onPress={() => setQuery("")} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                  <Path d="M6 6l12 12M18 6L6 18" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" />
                </Svg>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>

        <Animated.View
          entering={FadeInUp.duration(500).delay(140)}
          style={{ flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 28, marginTop: 24 }}
        >
          <CategoryCircle label="Capture" filled accent={ACCENT} onPress={() => router.push("/(tabs)/capture" as any)}
            icon={<Svg width={26} height={26} viewBox="0 0 24 24" fill="none"><Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="#fff" stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" /></Svg>}
          />
          <CategoryCircle label="Find People" accent={ACCENT} onPress={() => router.push("/(tabs)/discover" as any)}
            icon={<Svg width={26} height={26} viewBox="0 0 24 24" fill="none"><Circle cx={9} cy={9} r={3.5} stroke={ACCENT} strokeWidth={1.8} /><Circle cx={17} cy={10} r={2.5} stroke={ACCENT} strokeWidth={1.8} /><Path d="M3 19a6 6 0 0112 0M14 17a4 4 0 017 0" stroke={ACCENT} strokeWidth={1.8} strokeLinecap="round" /></Svg>}
          />
          <CategoryCircle label="Challenges" accent={ACCENT} onPress={() => router.push("/(tabs)/discover" as any)}
            icon={<Svg width={26} height={26} viewBox="0 0 24 24" fill="none"><Path d="M7 4h10v3a5 5 0 01-10 0V4z" stroke={ACCENT} strokeWidth={1.8} strokeLinejoin="round" /><Path d="M10 14h4v4h-4zM8 20h8" stroke={ACCENT} strokeWidth={1.8} strokeLinecap="round" /></Svg>}
          />
          <CategoryCircle label="Rankings" accent={ACCENT} onPress={() => router.push("/(tabs)/discover" as any)}
            icon={<Svg width={26} height={26} viewBox="0 0 24 24" fill="none"><Rect x={4} y={13} width={4} height={7} stroke={ACCENT} strokeWidth={1.8} rx={1} /><Rect x={10} y={8} width={4} height={12} stroke={ACCENT} strokeWidth={1.8} rx={1} /><Rect x={16} y={4} width={4} height={16} stroke={ACCENT} strokeWidth={1.8} rx={1} /></Svg>}
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(220)} style={{ marginTop: 30, paddingHorizontal: 20 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>Trending Now</Text>
            <Text onPress={() => router.push("/(tabs)/discover" as any)} style={{ color: ACCENT, fontSize: 13, fontWeight: "600" }}>See all</Text>
          </View>
          <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 4 }}>What's popping on Vyral right now</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, marginTop: 14, paddingRight: 20 }} style={{ marginHorizontal: -20, paddingLeft: 20 }}>
            {loading
              ? [0, 1, 2].map((i) => <Shimmer key={i} width={150} height={190} borderRadius={18} />)
              : trending.length === 0
              ? [0, 1, 2].map((i) => <TrendingEmpty key={i} />)
              : trending.map((t, i) => (
                  <TrendingCard key={t.id} rank={i + 1} tag={`#${t.tag}`} posts={`${formatCount(t.post_count)} posts`} gradient={TRENDING_GRADIENTS[i % TRENDING_GRADIENTS.length]} />
                ))}
          </ScrollView>
        </Animated.View>

        {challenge ? (
          <Animated.View entering={FadeInDown.duration(500).delay(280)} style={{ marginTop: 24, paddingHorizontal: 20 }}>
            <View style={{ borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: `${ACCENT}4d`, backgroundColor: "rgba(20,10,40,0.6)", padding: 18, flexDirection: "row", alignItems: "center", gap: 14 }}>
              <LinearGradient colors={[`${ACCENT}33`, `${ACCENT}0d`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", inset: 0 } as any} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>{challenge.title}</Text>
                <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 2 }}>Ends in</Text>
                <Text style={{ color: ACCENT, fontSize: 22, fontWeight: "800", marginTop: 6, letterSpacing: 1 }}>{countdown}</Text>
                <PressableScale haptic="medium" onPress={() => router.push("/(tabs)/capture" as any)} style={{ marginTop: 12, alignSelf: "flex-start", borderRadius: 14, overflow: "hidden" }}>
                  <LinearGradient colors={[ACCENT, ACCENT_DEEP]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 18, paddingVertical: 10, flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Join Challenge</Text>
                    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none"><Path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
                  </LinearGradient>
                </PressableScale>
              </View>
              <View style={{ width: 60, height: 60, borderRadius: 16, backgroundColor: `${ACCENT}2e`, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: `${ACCENT}66` }}>
                <Svg width={28} height={28} viewBox="0 0 24 24" fill="none">
                  <Path d="M4 8h16v3a3 3 0 01-3 3H7a3 3 0 01-3-3V8zM6 8V6a2 2 0 012-2h8a2 2 0 012 2v2" stroke={ACCENT} strokeWidth={1.8} strokeLinejoin="round" />
                  <Path d="M10 14v6h4v-6" stroke={ACCENT} strokeWidth={1.8} />
                </Svg>
              </View>
            </View>
          </Animated.View>
        ) : null}

        <Animated.View entering={FadeInDown.duration(500).delay(340)} style={{ marginTop: 24, paddingHorizontal: 20, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>For You</Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, marginTop: 2 }}>Curated for your vibe</Text>
          </View>
          <PressableScale haptic="light" onPress={() => router.push("/(tabs)/discover" as any)} style={{ flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.14)", backgroundColor: "rgba(255,255,255,0.04)" }}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>Filter</Text>
            <Svg width={12} height={12} viewBox="0 0 24 24" fill="none"><Path d="M4 6h16M7 12h10M10 18h4" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" /></Svg>
          </PressableScale>
        </Animated.View>

        <View style={{ paddingHorizontal: 20, marginTop: 14, gap: 14 }}>
          {loading
            ? [0, 1].map((i) => <Shimmer key={i} height={220} borderRadius={22} />)
            : feed.length === 0
            ? <FeedEmpty onCreate={() => router.push("/(tabs)/capture" as any)} accent={ACCENT} accentDeep={ACCENT_DEEP} />
            : feed.map((post, i) => <FeedCard key={post.id} post={post} gradient={FEED_GRADIENTS[i % FEED_GRADIENTS.length]} />)}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function CategoryCircle({ label, icon, filled, onPress, accent }: { label: string; icon: React.ReactNode; filled?: boolean; onPress?: () => void; accent: string }) {
  return (
    <View style={{ alignItems: "center", gap: 8 }}>
      <PressableScale haptic="light" onPress={onPress} style={{ width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: filled ? "transparent" : `${accent}66`, backgroundColor: filled ? "transparent" : `${accent}14`, overflow: "hidden", shadowColor: accent, shadowOpacity: filled ? 0.5 : 0, shadowRadius: 14, shadowOffset: { width: 0, height: 0 } }}>
        {filled && <LinearGradient colors={[accent, `${accent}cc`]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ position: "absolute", inset: 0 } as any} />}
        {icon}
      </PressableScale>
      <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: "500" }}>{label}</Text>
    </View>
  );
}

function TrendingCard({ rank, tag, posts, gradient }: { rank: number; tag: string; posts: string; gradient: [string, string] }) {
  return (
    <PressableScale haptic="light" style={{ width: 150, height: 190, borderRadius: 18, overflow: "hidden", borderWidth: 1, borderColor: "rgba(168,85,247,0.18)" }}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, padding: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>{rank}</Text>
          </View>
          <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
            <Svg width={11} height={11} viewBox="0 0 24 24" fill="none"><Path d="M7 17L17 7M9 7h8v8" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" /></Svg>
          </View>
        </View>
        <View style={{ flex: 1 }} />
        <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{tag}</Text>
        <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11, marginTop: 2 }}>{posts}</Text>
      </LinearGradient>
    </PressableScale>
  );
}

function TrendingEmpty() {
  return (
    <View style={{ width: 150, height: 190, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.025)", borderWidth: 1, borderColor: "rgba(255,255,255,0.06)", alignItems: "center", justifyContent: "center", padding: 14 }}>
      <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, textAlign: "center" }}>Trending tags will land here once people start posting.</Text>
    </View>
  );
}

function FeedCard({ post, gradient }: { post: FeedPost; gradient: [string, string] }) {
  const handle = post.author?.username || post.author?.display_name || "someone";
  return (
    <PressableScale haptic="light" style={{ borderRadius: 22, overflow: "hidden", borderWidth: 1, borderColor: "rgba(255,255,255,0.08)", backgroundColor: "rgba(255,255,255,0.03)" }}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 18, minHeight: 220, justifyContent: "flex-end" }}>
        <Text style={{ color: "rgba(255,255,255,0.75)", fontSize: 11, letterSpacing: 1 }}>@{handle}</Text>
        <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700", marginTop: 4 }} numberOfLines={2}>{post.caption?.trim() || `New ${post.kind} post`}</Text>
        <View style={{ flexDirection: "row", gap: 14, marginTop: 10 }}>
          <Meta n={post.like_count} label="likes" />
          <Meta n={post.comment_count} label="comments" />
        </View>
      </LinearGradient>
    </PressableScale>
  );
}

function FeedEmpty({ onCreate, accent, accentDeep }: { onCreate: () => void; accent: string; accentDeep: string }) {
  return (
    <View style={{ padding: 22, borderRadius: 22, backgroundColor: `${accent}0f`, borderWidth: 1, borderColor: `${accent}38`, alignItems: "center" }}>
      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>No posts yet.</Text>
      <Text style={{ color: "rgba(255,255,255,0.55)", fontSize: 12, marginTop: 6, textAlign: "center" }}>Be the first to drop something vyral. Tap the + below or use Capture.</Text>
      <PressableScale haptic="medium" onPress={onCreate} style={{ marginTop: 14, borderRadius: 14, overflow: "hidden" }}>
        <LinearGradient colors={[accent, accentDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ paddingHorizontal: 18, paddingVertical: 10 }}>
          <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>Start capturing</Text>
        </LinearGradient>
      </PressableScale>
    </View>
  );
}

function Meta({ n, label }: { n: number; label: string }) {
  return (
    <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>
      <Text style={{ color: "#fff", fontWeight: "700" }}>{formatCount(n)}</Text> {label}
    </Text>
  );
}

const iconBtnStyle = { width: 36, height: 36, borderRadius: 18, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)" };

function formatCount(n: number): string {
  if (n < 1000) return n.toString();
  if (n < 10_000) return `${(n / 1000).toFixed(1)}K`;
  if (n < 1_000_000) return `${Math.round(n / 1000)}K`;
  return `${(n / 1_000_000).toFixed(1)}M`;
}
