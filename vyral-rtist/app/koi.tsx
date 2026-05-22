// KOI — the calm game layer of Vyral.
// Adapted from the Claude Design handoff bundle (vyral-koi/project/KOI Landing.html).
// Reached by swiping from the right edge of the tab shell.

import { useEffect } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient as SvgGradient,
  Path,
  Rect,
  Stop,
} from "react-native-svg";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import PressableScale from "../components/PressableScale";

const C = {
  bg0: "#050b14",
  bg1: "#0a1522",
  bg2: "#0f1e30",
  ink0: "#e8f4ff",
  ink1: "#a6bfd4",
  ink2: "#5a7390",
  accent: "#4dd8ff",
  accent2: "#7b5cff",
  accentDeep: "#1f8fb8",
  accentWarm: "#ff9f6e",
  koiRed: "#ff6b4a",
  koiGold: "#ffc24a",
  line: "rgba(166,191,212,0.12)",
  card: "rgba(255,255,255,0.025)",
};

export default function KoiLanding() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: C.bg0 }}>
      {/* Ambient radial wash */}
      <LinearGradient
        colors={["rgba(77,216,255,0.12)", "transparent", "rgba(31,143,184,0.10)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", inset: 0 } as any}
      />
      <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
        <NavBar onBack={() => router.back()} />
        <ScrollView contentContainerStyle={{ paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
          <Hero />
          <Pond />
          <Minigames />
          <Evyre />
          <Loop />
          <CTA />
          <Footer />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

function NavBar({ onBack }: { onBack: () => void }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.line,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
        <BrandMark />
        <Text style={{ color: C.ink0, fontSize: 20, fontWeight: "600", letterSpacing: 0.3 }}>KOI</Text>
      </View>
      <PressableScale
        haptic="light"
        onPress={onBack}
        style={{
          paddingHorizontal: 12,
          paddingVertical: 7,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: "rgba(77,216,255,0.4)",
          backgroundColor: "rgba(77,216,255,0.06)",
        }}
      >
        <Text style={{ color: C.accent, fontSize: 12, fontWeight: "600" }}>← Back to Vyral</Text>
      </PressableScale>
    </View>
  );
}

function BrandMark() {
  return (
    <Svg width={28} height={28} viewBox="0 0 28 28">
      <Defs>
        <SvgGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0%" stopColor={C.accent} />
          <Stop offset="60%" stopColor={C.accentDeep} />
          <Stop offset="100%" stopColor={C.bg0} />
        </SvgGradient>
      </Defs>
      <Circle cx="14" cy="14" r="13" fill="url(#brandGrad)" />
      <Circle cx="14" cy="14" r="13" fill="none" stroke={C.accent} strokeOpacity={0.4} />
    </Svg>
  );
}

function Hero() {
  return (
    <Animated.View entering={FadeInUp.duration(600)} style={{ paddingHorizontal: 22, paddingTop: 28 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent }} />
        <Text
          style={{
            color: C.ink1,
            fontSize: 11,
            letterSpacing: 2.2,
            textTransform: "uppercase",
            fontWeight: "600",
          }}
        >
          Closed beta · Summer 2026
        </Text>
      </View>

      <Text
        style={{
          color: C.ink0,
          fontSize: 44,
          lineHeight: 50,
          fontWeight: "300",
          letterSpacing: -1.4,
          marginTop: 16,
        }}
      >
        Guide the <Text style={{ fontStyle: "italic", color: C.accent }}>koi</Text>.{"\n"}
        <Text style={{ color: C.ink2 }}>Move with the</Text> current.
      </Text>

      <Text style={{ color: C.ink1, fontSize: 14.5, lineHeight: 22, marginTop: 16 }}>
        KOI is the calm game layer of Vyral — fluid minigames, wave control, and a living trading card ecosystem. Every
        swipe feeds a flow state; every match shapes your deck; every card you earn flows across the network.
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginTop: 22 }}>
        <PressableScale
          haptic="light"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: C.accent,
            shadowColor: C.accent,
            shadowOpacity: 0.5,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 0 },
          }}
        >
          <Text style={{ color: C.bg0, fontSize: 13, fontWeight: "700", letterSpacing: 0.3 }}>
            Join the closed beta →
          </Text>
        </PressableScale>
        <PressableScale
          haptic="light"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(166,191,212,0.25)",
            backgroundColor: "rgba(255,255,255,0.03)",
          }}
        >
          <Text style={{ color: C.ink0, fontSize: 13, fontWeight: "600" }}>Watch gameplay ▸</Text>
        </PressableScale>
      </View>

      <View style={{ flexDirection: "row", marginTop: 28, gap: 0, justifyContent: "space-between" }}>
        <MetaItem num="2" unit="minigames" label="Flow · Wave" />
        <MetaItem num="148" unit="cards" label="Evyre, season one" />
        <MetaItem num="1" unit="resource" label="Shared flow economy" />
      </View>
    </Animated.View>
  );
}

function MetaItem({ num, unit, label }: { num: string; unit: string; label: string }) {
  return (
    <View style={{ flex: 1 }}>
      <Text style={{ color: C.ink0, fontSize: 24, fontWeight: "300", letterSpacing: -0.6 }}>
        {num}
        <Text style={{ color: C.ink2, fontSize: 10, marginLeft: 4, letterSpacing: 1.5 }}> {unit.toUpperCase()}</Text>
      </Text>
      <Text style={{ color: C.ink2, fontSize: 11, marginTop: 4 }}>{label}</Text>
    </View>
  );
}

function Pond() {
  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }), -1, true);
  }, [pulse]);
  const ringStyle = useAnimatedStyle(() => ({ opacity: 0.5 + pulse.value * 0.3 }));

  return (
    <Animated.View entering={FadeIn.duration(700).delay(200)} style={{ marginTop: 30, alignItems: "center" }}>
      <Animated.View style={ringStyle}>
        <Svg width={320} height={320} viewBox="0 0 540 540">
          <Defs>
            <SvgGradient id="currentGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0%" stopColor={C.accent} stopOpacity="0.05" />
              <Stop offset="50%" stopColor={C.accent} stopOpacity="0.95" />
              <Stop offset="100%" stopColor={C.accent} stopOpacity="0.05" />
            </SvgGradient>
            <SvgGradient id="pondBg" cx="50%" cy="50%" r="60%">
              <Stop offset="0%" stopColor={C.bg2} />
              <Stop offset="100%" stopColor={C.bg0} stopOpacity="0" />
            </SvgGradient>
          </Defs>
          <Circle cx="270" cy="270" r="240" fill="url(#pondBg)" />
          {[180, 220, 260].map((r) => (
            <Circle key={r} cx="270" cy="270" r={r} fill="none" stroke={C.accent} strokeOpacity={0.18} strokeWidth={0.5} />
          ))}
          <Path
            d="M 40 140 Q 180 80 270 180 T 500 260"
            fill="none"
            stroke="url(#currentGrad)"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <Path
            d="M 60 440 Q 220 480 320 380 T 510 440"
            fill="none"
            stroke="url(#currentGrad)"
            strokeWidth={3}
            strokeLinecap="round"
            opacity={0.7}
          />
          <Path
            d="M 270 520 Q 200 380 280 280 Q 360 200 280 60"
            fill="none"
            stroke={C.accent}
            strokeOpacity={0.4}
            strokeWidth={2}
            strokeLinecap="round"
          />
          {[
            [180, 200],
            [350, 320],
            [240, 420],
          ].map(([cx, cy], i) => (
            <G key={i}>
              <Circle cx={cx} cy={cy} r={4} fill={C.accent} />
              <Circle cx={cx} cy={cy} r={12} fill="none" stroke={C.accent} strokeOpacity={0.35} />
              <Circle cx={cx} cy={cy} r={22} fill="none" stroke={C.accent} strokeOpacity={0.15} />
            </G>
          ))}
          <G transform="translate(258, 245)">
            <Ellipse cx={14} cy={9} rx={20} ry={7} fill="#ffffff" />
            <Ellipse cx={8} cy={9} rx={7} ry={5} fill={C.koiRed} />
            <Ellipse cx={22} cy={7} rx={4} ry={3} fill={C.koiGold} />
            <Path d="M 34 9 L 50 2 L 50 16 Z" fill="#ffffff" />
            <Circle cx={6} cy={8} r={1.4} fill="#111" />
          </G>
        </Svg>
      </Animated.View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: -12 }}>
        <HudPill label="Flow state" value="charged" tone="accent" />
        <HudPill label="Streak" value="14,820" tone="warm" />
        <HudPill label="Alignment" value="98%" tone="accent" />
      </View>
    </Animated.View>
  );
}

function HudPill({ label, value, tone }: { label: string; value: string; tone: "accent" | "warm" }) {
  const accent = tone === "accent" ? C.accent : C.accentWarm;
  return (
    <View
      style={{
        minWidth: 96,
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: `${accent}40`,
        backgroundColor: "rgba(10,21,34,0.7)",
      }}
    >
      <Text style={{ color: C.ink2, fontSize: 9, letterSpacing: 1, textTransform: "uppercase" }}>{label}</Text>
      <Text style={{ color: accent, fontSize: 12, fontWeight: "700", marginTop: 1 }}>{value}</Text>
    </View>
  );
}

function Minigames() {
  return (
    <View style={{ paddingHorizontal: 22, marginTop: 56 }}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <SectionLabel n="01" label="The Minigames" />
        <SectionTitle>
          Two ways to move.{"\n"}
          <Text style={{ fontStyle: "italic", color: C.accent }}>One rhythm.</Text>
        </SectionTitle>
      </Animated.View>

      <View style={{ gap: 14, marginTop: 22 }}>
        <GameCard
          title="Flow Currents"
          subtitle="Guide a koi through living water."
          body="Swipe along glowing paths to stay aligned. Build momentum, lock into a flow state, and earn rhythm rewards that scale with precision — not speed."
          tags={["Alignment", "Rhythm", "Flow state"]}
          art={<FlowArt />}
        />
        <GameCard
          title="Wave Control"
          subtitle="Ripple, redirect, restrain."
          body="Generate ripples to deflect threats. Push too hard and turbulence breaks the field. Push too little and you're overwhelmed. The game is balance, not force."
          tags={["Restraint", "Awareness", "Balance"]}
          art={<WaveArt />}
        />
      </View>
    </View>
  );
}

function FlowArt() {
  return (
    <Svg width="100%" height={140} viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice">
      <Rect width="280" height="140" fill={C.bg2} />
      <Path d="M 0 80 Q 70 30 140 80 T 280 80" fill="none" stroke={C.accent} strokeWidth={1.6} opacity={0.7} />
      <Path d="M 0 100 Q 70 50 140 100 T 280 100" fill="none" stroke={C.accent} strokeWidth={1.2} opacity={0.4} />
      <G transform="translate(120, 64)">
        <Ellipse cx={14} cy={9} rx={18} ry={6} fill="#fff" />
        <Ellipse cx={8} cy={9} rx={6} ry={4} fill={C.koiRed} />
        <Path d="M 32 9 L 44 3 L 44 15 Z" fill="#fff" />
      </G>
    </Svg>
  );
}

function WaveArt() {
  return (
    <Svg width="100%" height={140} viewBox="0 0 280 140" preserveAspectRatio="xMidYMid slice">
      <Rect width="280" height="140" fill={C.bg2} />
      {[40, 60, 80].map((y, i) => (
        <Circle key={i} cx={140} cy={70} r={20 + i * 16} fill="none" stroke={C.accent} strokeOpacity={0.5 - i * 0.12} strokeWidth={1.2} />
      ))}
      <Circle cx={140} cy={70} r={5} fill={C.accent} />
      <Circle cx={60} cy={40} r={2.5} fill={C.koiGold} />
      <Circle cx={220} cy={100} r={2.5} fill={C.koiRed} />
    </Svg>
  );
}

function GameCard({
  title,
  subtitle,
  body,
  tags,
  art,
}: {
  title: string;
  subtitle: string;
  body: string;
  tags: string[];
  art: React.ReactNode;
}) {
  return (
    <View
      style={{
        borderRadius: 18,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: C.line,
        backgroundColor: C.bg1,
      }}
    >
      {art}
      <View style={{ padding: 18 }}>
        <Text
          style={{
            color: C.ink0,
            fontSize: 22,
            fontWeight: "300",
            letterSpacing: -0.4,
          }}
        >
          <Text style={{ fontStyle: "italic", color: C.accent }}>{title}</Text>
          {" — "}
          {subtitle}
        </Text>
        <Text style={{ color: C.ink1, fontSize: 13.5, lineHeight: 20, marginTop: 10 }}>{body}</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
          {tags.map((t) => (
            <View
              key={t}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 5,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: "rgba(77,216,255,0.25)",
                backgroundColor: "rgba(77,216,255,0.05)",
              }}
            >
              <Text style={{ color: C.accent, fontSize: 10, letterSpacing: 1, textTransform: "uppercase" }}>{t}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

function Evyre() {
  return (
    <View style={{ paddingTop: 60 }}>
      <View style={{ paddingHorizontal: 22 }}>
        <SectionLabel n="02" label="Evyre · The Trading Card Game" />
        <SectionTitle>
          Collect the current.{"\n"}
          <Text style={{ fontStyle: "italic", color: C.accent2 }}>Build a deck that flows.</Text>
        </SectionTitle>
        <Text style={{ color: C.ink1, fontSize: 14, lineHeight: 21, marginTop: 14 }}>
          Every match of Flow Currents and Wave Control feeds into Evyre — a calm, strategic TCG where you place cards
          using a shared <Text style={{ color: C.accent2, fontWeight: "700" }}>flow</Text> resource, build synergies,
          and shape the field. No burst damage. No pressure plays. Just control, earned one ripple at a time.
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 22, gap: 14, marginTop: 22, paddingVertical: 6 }}
      >
        <TcgCard
          name="Pale Drift"
          rarity="rare"
          cost={2}
          type="Koi · Aligned"
          text="When placed, adjacent cards gain +1 flow. Drift toward the strongest current."
          atk="2"
          def="4"
          art={
            <Svg width="100%" height={120} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
              <Rect width={200} height={120} fill="#071628" />
              <Path d="M 0 80 Q 50 50 100 80 T 200 80" fill="none" stroke={C.accent} strokeWidth={1.2} opacity={0.6} />
              <G transform="translate(70, 50)">
                <Ellipse cx={14} cy={9} rx={18} ry={6} fill="#fff" />
                <Ellipse cx={9} cy={9} rx={6} ry={4} fill={C.koiRed} />
                <Path d="M 32 9 L 44 3 L 44 15 Z" fill="#fff" />
              </G>
            </Svg>
          }
        />
        <TcgCard
          name="Tidebreaker"
          rarity="legendary"
          cost={5}
          type="Leviathan · Legendary"
          text="Surge: spend 3 flow to clear turbulence on one lane. Generates +2 flow each turn it holds."
          atk="6"
          def="7"
          art={
            <Svg width="100%" height={140} viewBox="0 0 200 140" preserveAspectRatio="xMidYMid slice">
              <Rect width={200} height={140} fill="#0a1326" />
              <Path d="M 0 80 Q 50 30 100 80 T 200 80" fill="none" stroke={C.koiRed} strokeWidth={1.6} opacity={0.8} />
              <Path d="M 0 100 Q 50 50 100 100 T 200 100" fill="none" stroke={C.koiGold} strokeWidth={1.3} opacity={0.6} />
              <G transform="translate(55, 40)">
                <Ellipse cx={22} cy={14} rx={32} ry={10} fill="#fff" />
                <Ellipse cx={14} cy={14} rx={10} ry={6} fill={C.koiRed} />
                <Ellipse cx={34} cy={14} rx={5} ry={4} fill={C.koiRed} />
                <Ellipse cx={24} cy={11} rx={5} ry={3} fill={C.koiGold} />
                <Path d="M 54 14 L 72 5 L 72 23 Z" fill="#fff" />
                <Circle cx={8} cy={13} r={1.5} fill="#111" />
              </G>
              <Circle cx={100} cy={20} r={4} fill={C.koiGold} opacity={0.9} />
            </Svg>
          }
        />
        <TcgCard
          name="Still Water"
          rarity="epic"
          cost={3}
          type="Field · Control"
          text="Halt all turbulence effects for 2 turns. Opponents' wave cards cost +1 flow."
          atk="—"
          def="5"
          art={
            <Svg width="100%" height={120} viewBox="0 0 200 120" preserveAspectRatio="xMidYMid slice">
              <Rect width={200} height={120} fill="#06121f" />
              {[46, 32, 18].map((r, i) => (
                <Circle
                  key={i}
                  cx={100}
                  cy={60}
                  r={r}
                  fill="none"
                  stroke={C.accent}
                  strokeWidth={1.2 - i * 0.15}
                  opacity={0.7 - i * 0.18}
                />
              ))}
              <Circle cx={100} cy={60} r={5} fill={C.accent} />
            </Svg>
          }
        />
      </ScrollView>

      <View style={{ paddingHorizontal: 22, marginTop: 28 }}>
        <Text
          style={{
            color: C.accentWarm,
            fontSize: 10,
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: "600",
          }}
        >
          The deck / your signature
        </Text>
        <Text
          style={{
            color: C.ink0,
            fontSize: 28,
            lineHeight: 34,
            fontWeight: "300",
            letterSpacing: -0.7,
            marginTop: 10,
          }}
        >
          A small deck.{"\n"}A <Text style={{ color: C.accent2, fontStyle: "italic" }}>long</Text> conversation.
        </Text>
        <Text style={{ color: C.ink1, fontSize: 13.5, lineHeight: 20, marginTop: 12 }}>
          Decks are lean — 24 cards, shaped around a style rather than an archetype. Cards earned from minigames carry
          their origin: a koi earned in a perfect-flow run arrives with a calm animation and a subtle stat bloom.
        </Text>

        <View style={{ marginTop: 18, gap: 10 }}>
          <Mech num="01" name="Flow economy" desc="One shared resource — spend it, regenerate it, control the pace." />
          <Mech num="02" name="Earn & trade" desc="Cards drop from gameplay across Vyral. Trade freely." />
          <Mech num="03" name="Digital & physical" desc="Season-one cards designed for a future physical print run." />
        </View>
      </View>
    </View>
  );
}

function TcgCard({
  name,
  rarity,
  cost,
  type,
  text,
  atk,
  def,
  art,
}: {
  name: string;
  rarity: "rare" | "epic" | "legendary";
  cost: number;
  type: string;
  text: string;
  atk: string;
  def: string;
  art: React.ReactNode;
}) {
  const glow = rarity === "legendary" ? C.koiGold : rarity === "epic" ? C.accent2 : C.accent;
  return (
    <View
      style={{
        width: 220,
        borderRadius: 16,
        overflow: "hidden",
        borderWidth: 1.5,
        borderColor: `${glow}55`,
        backgroundColor: "#0a1326",
        shadowColor: glow,
        shadowOpacity: 0.45,
        shadowRadius: 22,
        shadowOffset: { width: 0, height: 0 },
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 14,
          paddingTop: 12,
          paddingBottom: 8,
        }}
      >
        <Text style={{ color: C.ink0, fontSize: 15, fontWeight: "600", letterSpacing: 0.2 }}>{name}</Text>
        <View
          style={{
            width: 26,
            height: 26,
            borderRadius: 13,
            backgroundColor: `${glow}22`,
            borderWidth: 1,
            borderColor: `${glow}66`,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: glow, fontSize: 12, fontWeight: "700" }}>{cost}</Text>
        </View>
      </View>
      <View style={{ marginHorizontal: 12, borderRadius: 10, overflow: "hidden" }}>{art}</View>
      <View style={{ padding: 12 }}>
        <Text
          style={{
            color: C.ink2,
            fontSize: 9.5,
            letterSpacing: 1.6,
            textTransform: "uppercase",
            fontWeight: "600",
          }}
        >
          {type}
        </Text>
        <Text style={{ color: C.ink1, fontSize: 12, lineHeight: 17, marginTop: 8 }}>{text}</Text>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 12,
            paddingTop: 10,
            borderTopWidth: 1,
            borderTopColor: C.line,
          }}
        >
          <Text style={{ color: C.koiRed, fontSize: 13, fontWeight: "700" }}>◆ {atk}</Text>
          <Text style={{ color: C.accent, fontSize: 13, fontWeight: "700" }}>◌ {def}</Text>
        </View>
      </View>
    </View>
  );
}

function Mech({ num, name, desc }: { num: string; name: string; desc: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        gap: 14,
        padding: 14,
        borderRadius: 14,
        borderWidth: 1,
        borderColor: C.line,
        backgroundColor: C.card,
      }}
    >
      <Text
        style={{
          color: C.accent2,
          fontSize: 10,
          letterSpacing: 1.5,
          fontWeight: "700",
          width: 36,
        }}
      >
        / {num}
      </Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: C.ink0, fontSize: 13, fontWeight: "600" }}>{name}</Text>
        <Text style={{ color: C.ink1, fontSize: 12, lineHeight: 17, marginTop: 3 }}>{desc}</Text>
      </View>
    </View>
  );
}

function Loop() {
  const nodes = [
    { glyph: "≈≈≈", name: "Flow", desc: "Guide the koi. Earn rhythm points and rare drops." },
    { glyph: "◌", name: "Wave", desc: "Defend the pond. Unlock control cards and fragments." },
    { glyph: "◇", name: "Collect", desc: "Forge cards, refine your deck, trade across Vyral." },
    { glyph: "⟳", name: "Match", desc: "Play Evyre. Wins feed back into new minigame modes." },
  ];
  return (
    <View style={{ paddingHorizontal: 22, marginTop: 56 }}>
      <SectionLabel n="03" label="The Loop" />
      <SectionTitle>
        Play shapes collection.{"\n"}
        <Text style={{ fontStyle: "italic", color: C.accent }}>Collection shapes play.</Text>
      </SectionTitle>

      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 22, gap: 12 }}>
        {nodes.map((n, i) => (
          <View
            key={n.name}
            style={{
              width: "47.5%",
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: C.line,
              backgroundColor: C.card,
            }}
          >
            <Text style={{ color: C.accent, fontSize: 28, marginBottom: 8 }}>{n.glyph}</Text>
            <Text style={{ color: C.ink0, fontSize: 14, fontWeight: "600" }}>{n.name}</Text>
            <Text style={{ color: C.ink1, fontSize: 11.5, lineHeight: 16, marginTop: 4 }}>{n.desc}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function CTA() {
  return (
    <View style={{ marginTop: 60, paddingHorizontal: 22, paddingVertical: 30, alignItems: "center" }}>
      <Svg width="100%" height={70} viewBox="0 0 1200 140" preserveAspectRatio="none" style={{ position: "absolute", top: 0, opacity: 0.45 } as any}>
        <Path
          d="M0 60 Q 150 0 300 60 T 600 60 T 900 60 T 1200 60 L 1200 140 L 0 140 Z"
          fill={C.accent}
          opacity={0.15}
        />
        <Path
          d="M0 80 Q 150 20 300 80 T 600 80 T 900 80 T 1200 80 L 1200 140 L 0 140 Z"
          fill={C.accent}
          opacity={0.1}
        />
      </Svg>
      <Text
        style={{
          color: C.ink0,
          fontSize: 36,
          fontWeight: "300",
          letterSpacing: -1,
          textAlign: "center",
          marginTop: 20,
        }}
      >
        Slip into <Text style={{ color: C.accent, fontStyle: "italic" }}>the pond</Text>.
      </Text>
      <Text
        style={{
          color: C.ink1,
          fontSize: 13.5,
          lineHeight: 20,
          textAlign: "center",
          marginTop: 12,
          maxWidth: 320,
        }}
      >
        Closed beta opens with season one of Evyre and both minigames unlocked from day one. Founding players receive an
        embossed starter card, honored in the eventual physical print.
      </Text>
      <View style={{ flexDirection: "row", gap: 10, marginTop: 20 }}>
        <PressableScale
          haptic="light"
          style={{
            paddingHorizontal: 18,
            paddingVertical: 12,
            borderRadius: 12,
            backgroundColor: C.accent,
          }}
        >
          <Text style={{ color: C.bg0, fontSize: 13, fontWeight: "700" }}>Request beta access →</Text>
        </PressableScale>
        <PressableScale
          haptic="light"
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "rgba(166,191,212,0.25)",
          }}
        >
          <Text style={{ color: C.ink0, fontSize: 13, fontWeight: "600" }}>Browse spoilers</Text>
        </PressableScale>
      </View>
    </View>
  );
}

function Footer() {
  return (
    <View
      style={{
        marginTop: 40,
        paddingHorizontal: 22,
        paddingVertical: 22,
        borderTopWidth: 1,
        borderTopColor: C.line,
      }}
    >
      <Text style={{ color: C.ink2, fontSize: 11, textAlign: "center" }}>
        © 2026 VYRAL // KOI · Evyre TCG — season one
      </Text>
    </View>
  );
}

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <Text
      style={{
        color: C.ink2,
        fontSize: 10,
        letterSpacing: 2,
        textTransform: "uppercase",
        fontWeight: "600",
      }}
    >
      {n} · {label}
    </Text>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        color: C.ink0,
        fontSize: 32,
        lineHeight: 38,
        fontWeight: "300",
        letterSpacing: -0.9,
        marginTop: 12,
      }}
    >
      {children}
    </Text>
  );
}
