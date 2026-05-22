// Vyral Capture — viewfinder with live recording state.

import { useEffect, useState } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path, Circle } from "react-native-svg";
import Animated, {
  FadeIn,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing,
} from "react-native-reanimated";
import PressableScale from "../../components/PressableScale";
import { useAccent } from "../../lib/themeContext";

type Mode = "video" | "photo" | "text" | "voice";

function useRecordingTimer(isRecording: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!isRecording) { setSeconds(0); return; }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [isRecording]);
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

export default function Capture() {
  const router = useRouter();
  const ACCENT = useAccent("captureViewfinder", "#a855f7");
  const RECORD_ACCENT = useAccent("captureRecord", "#a855f7");
  const [mode, setMode] = useState<Mode>("video");
  const [isRecording, setIsRecording] = useState(false);
  const timerLabel = useRecordingTimer(isRecording);

  const pulseScale = useSharedValue(0.97);

  useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.0, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.97, { duration: 2200, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }} edges={["top"]}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 8 }}>
        <PressableScale haptic="light" onPress={() => router.replace("/(tabs)/home" as any)} style={iconBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M6 6l12 12M18 6L6 18" stroke="#fff" strokeWidth={2} strokeLinecap="round" />
          </Svg>
        </PressableScale>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isRecording ? (
            <>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: "#ef4444" }} />
              <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", letterSpacing: 1 }}>{timerLabel}</Text>
            </>
          ) : (
            <Text style={{ color: "#fff", fontSize: 17, fontWeight: "700" }}>Capture</Text>
          )}
        </View>
        <PressableScale haptic="light" style={iconBtn}>
          <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
            <Path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" fill="#fff" stroke="#fff" strokeWidth={1.2} strokeLinejoin="round" />
          </Svg>
        </PressableScale>
      </View>

      <Animated.View
        entering={FadeIn.duration(500)}
        style={{ marginHorizontal: 20, marginTop: 8, flex: 1, maxHeight: 540, borderRadius: 24, overflow: "hidden", borderWidth: 1, borderColor: isRecording ? "rgba(239,68,68,0.5)" : `${ACCENT}2e` }}
      >
        <LinearGradient colors={["#0a0418", "#1e1340", "#0a0418"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, position: "relative" }}>
          <CornerBracket position="tl" recording={isRecording} accent={ACCENT} />
          <CornerBracket position="tr" recording={isRecording} accent={ACCENT} />
          <CornerBracket position="bl" recording={isRecording} accent={ACCENT} />
          <CornerBracket position="br" recording={isRecording} accent={ACCENT} />
          <Animated.View style={[{ flex: 1, alignItems: "center", justifyContent: "center" }, !isRecording && pulseStyle]}>
            {!isRecording ? (
              <>
                <Svg width={56} height={56} viewBox="0 0 120 120">
                  <Path d="M22 22 L 60 92 L 98 22" stroke={ACCENT} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </Svg>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "600", marginTop: 18 }}>start something</Text>
                <Text style={{ color: ACCENT, fontSize: 20, fontWeight: "700", marginTop: 2 }}>vyral.</Text>
              </>
            ) : (
              <View style={{ alignItems: "center", gap: 12 }}>
                <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(239,68,68,0.18)", borderWidth: 2, borderColor: "rgba(239,68,68,0.6)", alignItems: "center", justifyContent: "center" }}>
                  <View style={{ width: 22, height: 22, borderRadius: 4, backgroundColor: "#ef4444" }} />
                </View>
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 13 }}>Recording…</Text>
              </View>
            )}
          </Animated.View>
        </LinearGradient>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(120)} style={{ flexDirection: "row", justifyContent: "center", gap: 18, marginTop: 16 }}>
        {(["video", "photo", "text", "voice"] as Mode[]).map((m) => (
          <PressableScale key={m} haptic="selection" onPress={() => { setMode(m); setIsRecording(false); }}
            style={{ paddingHorizontal: mode === m ? 16 : 6, paddingVertical: mode === m ? 7 : 6, borderRadius: 20, backgroundColor: mode === m ? `${ACCENT}2e` : "transparent", borderWidth: mode === m ? 1 : 0, borderColor: `${ACCENT}66` }}
          >
            <Text style={{ color: mode === m ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: mode === m ? "700" : "500", textTransform: "capitalize" }}>{m}</Text>
          </PressableScale>
        ))}
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(180)} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-around", marginTop: 18, paddingHorizontal: 30 }}>
        <SideControl label="Effects" icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3zM19 14l.8 2.2L22 17l-2.2.8L19 20l-.8-2.2L16 17l2.2-.8L19 14z" fill="#fff" /></Svg>} />
        <RecordButton isRecording={isRecording} onPress={() => setIsRecording((r) => !r)} accent={RECORD_ACCENT} />
        <SideControl label="Flip" icon={<Svg width={22} height={22} viewBox="0 0 24 24" fill="none"><Path d="M4 8a4 4 0 014-4h8M20 16a4 4 0 01-4 4H8" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" /><Path d="M14 2l2 2-2 2M10 22l-2-2 2-2" stroke="#fff" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" /></Svg>} />
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(400).delay(240)} style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 24, marginBottom: 96, paddingHorizontal: 20 }}>
        <BottomControl label="Sounds" icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M9 18V6l10-2v12" stroke="rgba(255,255,255,0.85)" strokeWidth={1.8} strokeLinejoin="round" /><Circle cx={7} cy={18} r={2.4} stroke="rgba(255,255,255,0.85)" strokeWidth={1.8} /><Circle cx={17} cy={16} r={2.4} stroke="rgba(255,255,255,0.85)" strokeWidth={1.8} /></Svg>} />
        <BottomControl label="Speed" icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M5 14a7 7 0 1114 0" stroke="rgba(255,255,255,0.85)" strokeWidth={1.8} strokeLinecap="round" /><Path d="M12 14l4-4" stroke="rgba(255,255,255,0.85)" strokeWidth={1.8} strokeLinecap="round" /><Circle cx={12} cy={14} r={1.4} fill="rgba(255,255,255,0.85)" /></Svg>} />
        <BottomControl label="Timer" icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Circle cx={12} cy={13} r={7} stroke="rgba(255,255,255,0.85)" strokeWidth={1.8} /><Path d="M12 9v4l3 2M9 3h6" stroke="rgba(255,255,255,0.85)" strokeWidth={1.8} strokeLinecap="round" /></Svg>} />
        <BottomControl label="Canvas" icon={<Svg width={20} height={20} viewBox="0 0 24 24" fill="none"><Path d="M4 5h16v14H4zM4 9h16M9 9v10" stroke="rgba(255,255,255,0.85)" strokeWidth={1.8} strokeLinejoin="round" /></Svg>} />
      </Animated.View>
    </SafeAreaView>
  );
}

function CornerBracket({ position, recording, accent }: { position: "tl" | "tr" | "bl" | "br"; recording: boolean; accent: string }) {
  const color = recording ? "rgba(239,68,68,0.8)" : `${accent}99`;
  const base: any = { position: "absolute", width: 22, height: 22, borderColor: color };
  if (position === "tl") return <View style={{ ...base, top: 14, left: 14, borderTopWidth: 2, borderLeftWidth: 2, borderTopLeftRadius: 6 }} />;
  if (position === "tr") return <View style={{ ...base, top: 14, right: 14, borderTopWidth: 2, borderRightWidth: 2, borderTopRightRadius: 6 }} />;
  if (position === "bl") return <View style={{ ...base, bottom: 14, left: 14, borderBottomWidth: 2, borderLeftWidth: 2, borderBottomLeftRadius: 6 }} />;
  return <View style={{ ...base, bottom: 14, right: 14, borderBottomWidth: 2, borderRightWidth: 2, borderBottomRightRadius: 6 }} />;
}

function RecordButton({ isRecording, onPress, accent }: { isRecording: boolean; onPress: () => void; accent: string }) {
  const innerRadius = useSharedValue(32);
  const innerSize = useSharedValue(62);

  useEffect(() => {
    innerRadius.value = withSpring(isRecording ? 6 : 32, { damping: 14, stiffness: 200 });
    innerSize.value = withSpring(isRecording ? 26 : 62, { damping: 14, stiffness: 200 });
  }, [isRecording, innerRadius, innerSize]);

  const innerStyle = useAnimatedStyle(() => ({
    borderRadius: innerRadius.value,
    width: innerSize.value,
    height: innerSize.value,
    backgroundColor: isRecording ? "#ef4444" : "#fff",
  }));

  return (
    <PressableScale haptic="heavy" scaleTo={0.92} onPress={onPress}
      style={{ width: 78, height: 78, borderRadius: 40, borderWidth: 3, borderColor: isRecording ? "#ef4444" : accent, alignItems: "center", justifyContent: "center", shadowColor: isRecording ? "#ef4444" : accent, shadowOpacity: 0.6, shadowRadius: 18, shadowOffset: { width: 0, height: 0 } }}
    >
      <Animated.View style={innerStyle} />
    </PressableScale>
  );
}

function SideControl({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <PressableScale haptic="light" style={{ alignItems: "center", gap: 6 }}>
      <View style={{ width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)", borderWidth: 1, borderColor: "rgba(255,255,255,0.12)" }}>
        {icon}
      </View>
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{label}</Text>
    </PressableScale>
  );
}

function BottomControl({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <PressableScale haptic="light" style={{ alignItems: "center", gap: 6 }}>
      {icon}
      <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>{label}</Text>
    </PressableScale>
  );
}

const iconBtn = { width: 36, height: 36, borderRadius: 18, alignItems: "center" as const, justifyContent: "center" as const, backgroundColor: "rgba(255,255,255,0.04)" };
