/* eslint-disable react-hooks/refs, react-hooks/set-state-in-effect */
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Animated,
  Easing,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { BlurView } from "expo-blur";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { GeneratedVisualLoading, LoadingScreen } from "./app-system/components/loading/LoadingScreens";
import { MotionPreview } from "./app-system/components/motion/MotionPreview";
import { makeSpace } from "./app-system/lib/ai/spaceMaker";
import type { AnimationTheme, GeneratedSpace, KoiSession, RecentActivity, RotistSession, UploadedFileSignal } from "./app-system/lib/ai/types";
import { sanitizeAIText } from "./app-system/lib/ai/textSanitizer";
import { classifyFile } from "./app-system/lib/mock/fallbackGenerators";
import { generateStarterSpaces } from "./app-system/lib/onboarding/starterSpaceGenerator";
import type { AutomationLevel, OnboardingProfile, PrimaryUseCase, SystemVibe } from "./app-system/lib/onboarding/onboardingTypes";

type ModeKey = "vyral" | "koi" | "rotist" | "legacy" | "settings";
type IntakePhase = "idle" | "received" | "detecting" | "patterns" | "tasks" | "suggested" | "ready";

type ModeMeta = {
  label: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
  glow: string;
  gradient: [string, string, string];
};

type LegacyEntry = {
  id: string;
  title: string;
  source: "VYRAL" | "KOI" | "ROTIST";
  body: string;
  theme: AnimationTheme;
};

const modeOrder: ModeKey[] = ["vyral", "koi", "rotist"];
const modes: Record<ModeKey, ModeMeta> = {
  vyral: {
    label: "VYRAL",
    subtitle: "Life OS",
    icon: "sparkles-outline",
    accent: "#9b5cff",
    glow: "#26d6e8",
    gradient: ["#050713", "#081126", "#120b24"],
  },
  koi: {
    label: "KOI",
    subtitle: "DIVE reset",
    icon: "water-outline",
    accent: "#27d9ff",
    glow: "#ff7bb8",
    gradient: ["#03111c", "#071a2d", "#100a20"],
  },
  rotist: {
    label: "ROTIST",
    subtitle: "Writing signal",
    icon: "pencil-outline",
    accent: "#b7f75a",
    glow: "#7b5cff",
    gradient: ["#05070b", "#0c1322", "#071b24"],
  },
  legacy: {
    label: "LEGACY",
    subtitle: "Memory archive",
    icon: "time-outline",
    accent: "#ffd36a",
    glow: "#9b5cff",
    gradient: ["#070814", "#11111f", "#1a1424"],
  },
  settings: {
    label: "CONTROL",
    subtitle: "Privacy and motion",
    icon: "options-outline",
    accent: "#f7f7ff",
    glow: "#26d6e8",
    gradient: ["#070814", "#0d1220", "#090c18"],
  },
};

const defaultProfile: OnboardingProfile = {
  displayName: "Garrison",
  primaryUseCase: "Everything at once",
  patternPreferences: ["deadlines", "scattered notes", "creative ideas", "writing patterns"],
  systemVibe: "Cinematic",
  automationLevel: "Ask before creating",
  reduceMotion: false,
  dyslexiaSpacing: false,
  highContrast: false,
  slowReadPacing: false,
  starterSpaces: [],
};

const seedLegacy: LegacyEntry[] = [
  {
    id: "legacy-seed-1",
    title: "Study milestone created",
    source: "VYRAL",
    body: "Biology guide, handwritten notes, and review questions were grouped into one starting shape.",
    theme: "legacy_memory",
  },
];

export default function App() {
  const { width } = useWindowDimensions();
  const [booting, setBooting] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [mode, setMode] = useState<ModeKey>("vyral");
  const [coreOpen, setCoreOpen] = useState(false);
  const [profile, setProfile] = useState<OnboardingProfile>(defaultProfile);
  const [quickCapture, setQuickCapture] = useState("I have a biology test Friday and my notes are a mess.");
  const [files, setFiles] = useState<UploadedFileSignal[]>([]);
  const [intakePhase, setIntakePhase] = useState<IntakePhase>("idle");
  const [spaces, setSpaces] = useState<GeneratedSpace[]>([]);
  const [candidate, setCandidate] = useState<GeneratedSpace | null>(null);
  const [legacy, setLegacy] = useState<LegacyEntry[]>(seedLegacy);
  const [koiSessions, setKoiSessions] = useState<KoiSession[]>([]);
  const [rotistSessions, setRotistSessions] = useState<RotistSession[]>([]);
  const [koiLoading, setKoiLoading] = useState(false);
  const [rotistLoading, setRotistLoading] = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);
  const transition = useRef(new Animated.Value(1)).current;
  const glass = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const meta = modes[mode];
  const maxWidth = Math.min(width - 32, 560);

  useEffect(() => {
    const bootTimer = setTimeout(() => setBooting(false), 1250);
    return () => clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    if (profile.starterSpaces.length > 0 && spaces.length === 0) {
      setSpaces(profile.starterSpaces);
    }
  }, [profile.starterSpaces, spaces.length]);

  useEffect(() => {
    if (profile.reduceMotion) {
      pulse.setValue(1);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1900, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [profile.reduceMotion, pulse]);

  const switchMode = useCallback(
    (next: ModeKey) => {
      if (next === mode) {
        setCoreOpen(false);
        return;
      }
      Haptics.selectionAsync();
      setCoreOpen(false);
      transition.setValue(0);
      glass.setValue(1);
      setMode(next);
      Animated.parallel([
        Animated.timing(transition, { toValue: 1, duration: profile.reduceMotion ? 1 : 320, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(glass, { toValue: 0, duration: profile.reduceMotion ? 1 : 440, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]).start();
    },
    [glass, mode, profile.reduceMotion, transition]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 22 && Math.abs(gesture.dy) < 30,
        onPanResponderRelease: (_, gesture) => {
          const index = modeOrder.indexOf(mode);
          if (index < 0) return;
          if (gesture.dx < -60) switchMode(modeOrder[Math.min(modeOrder.length - 1, index + 1)]);
          if (gesture.dx > 60) switchMode(modeOrder[Math.max(0, index - 1)]);
        },
      }),
    [mode, switchMode]
  );

  const recentActivity: RecentActivity = useMemo(
    () => ({
      spaces: spaces.map((space) => ({
        spaceName: space.spaceName,
        spaceType: space.spaceType,
        detectedPatterns: space.detectedPatterns,
      })),
      koiSessions: koiSessions.map((session) => session.insight),
      rotistSessions: rotistSessions.map((session) => session.summary),
      legacyEntries: legacy.map((entry) => entry.title),
    }),
    [koiSessions, legacy, rotistSessions, spaces]
  );

  async function runSpaceMaker(sourceText = quickCapture, sourceFiles = files, extra?: { koi?: string; rotist?: string }) {
    const text = sanitizeAIText(sourceText);
    if (!text && sourceFiles.length === 0 && !extra?.koi && !extra?.rotist) return;
    setIntakePhase("received");
    setCandidate(null);
    await wait(280);
    setIntakePhase("detecting");
    await wait(280);
    setIntakePhase("patterns");
    await wait(320);
    setIntakePhase("tasks");
    const generated = await makeSpace({
      text,
      files: sourceFiles,
      recentActivity,
      koiReflection: extra?.koi,
      rotistSessionSummary: extra?.rotist,
    });
    setIntakePhase("suggested");
    setCandidate(generated);
    setVisualLoading(true);
    await wait(420);
    setVisualLoading(false);
    setIntakePhase("ready");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function pickFile() {
    Haptics.selectionAsync();
    const result = await DocumentPicker.getDocumentAsync({
      type: ["image/*", "application/pdf", "text/plain"],
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    let extractedText = classifyFile(asset.name || "upload", asset.mimeType || "");
    if (asset.mimeType === "text/plain" && asset.uri) {
      try {
        extractedText = sanitizeAIText(await FileSystem.readAsStringAsync(asset.uri));
      } catch {
        extractedText = classifyFile(asset.name || "text upload", asset.mimeType);
      }
    }
    const upload: UploadedFileSignal = {
      id: `file-${Date.now()}`,
      name: asset.name || `upload-${Date.now()}`,
      type: asset.mimeType || "unknown",
      size: asset.size,
      extractedText,
      status: "received",
    };
    const nextFiles = [upload, ...files].slice(0, 4);
    setFiles(nextFiles);
    runSpaceMaker(quickCapture, nextFiles);
  }

  function createCandidateSpace() {
    if (!candidate) return;
    setSpaces((current) => [candidate, ...current.filter((space) => space.id !== candidate.id)]);
    setLegacy((current) => [
      {
        id: `legacy-${Date.now()}`,
        title: candidate.spaceName,
        source: "VYRAL",
        body: candidate.lifeLegacyEntry,
        theme: "legacy_memory",
      },
      ...current,
    ]);
    setCandidate(null);
    setIntakePhase("idle");
    setMode("vyral");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function startDive() {
    setKoiLoading(true);
    await wait(1200);
    const session: KoiSession = {
      id: `koi-${Date.now()}`,
      prompt: "What are you carrying that does not need to become your whole day?",
      reflection: "I need one visible next action instead of trying to solve everything at once.",
      insight: "KOI noticed an overload pattern and converted the reset into one next action.",
      nextAction: "Start with the smallest biology review task.",
      saved: true,
    };
    setKoiSessions((current) => [session, ...current]);
    setLegacy((current) => [
      { id: `legacy-koi-${Date.now()}`, title: "60-second DIVE completed", source: "KOI", body: session.nextAction, theme: "legacy_memory" },
      ...current,
    ]);
    setKoiLoading(false);
    runSpaceMaker("", [], { koi: session.reflection });
  }

  async function startRotistSession() {
    setRotistLoading(true);
    await wait(1200);
    const pressure = 52 + Math.round(Math.random() * 34);
    const fatigue = Math.round(pressure * 0.72);
    const session: RotistSession = {
      id: `rotist-${Date.now()}`,
      title: pressure > 72 ? "High-pressure notes session" : "Handwriting signal session",
      pressure,
      fatigue,
      spacing: pressure > 72 ? "tight" : "steady",
      summary: pressure > 72
        ? "Grip pressure rose while notes got tighter. ROTIST recommends guided spacing and a short KOI reset."
        : "ROTIST captured a steady notes session with one summary lift ready for VYRAL.",
      extractedTasks: [
        { title: "Convert circled section into a summary", priority: "high", estimatedMinutes: 8 },
        { title: "Send handwriting insights to Trace Lab", priority: "medium", estimatedMinutes: 5 },
      ],
    };
    setRotistSessions((current) => [session, ...current]);
    setLegacy((current) => [
      { id: `legacy-rotist-${Date.now()}`, title: "ROTIST writing session saved", source: "ROTIST", body: session.summary, theme: "legacy_memory" },
      ...current,
    ]);
    setRotistLoading(false);
    runSpaceMaker("", [], { rotist: session.summary });
  }

  async function finishOnboarding(nextProfile: OnboardingProfile) {
    const starterSpaces = await generateStarterSpaces(nextProfile);
    const finished = { ...nextProfile, starterSpaces };
    setProfile(finished);
    setSpaces(starterSpaces);
    setShowOnboarding(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  if (booting) {
    return <RootChrome meta={modes.vyral}><LoadingScreen kind="boot" /></RootChrome>;
  }

  if (showOnboarding) {
    return (
      <RootChrome meta={modes.vyral}>
        <OnboardingFlow initial={profile} onComplete={finishOnboarding} />
      </RootChrome>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.app}>
        <LinearGradient colors={meta.gradient} style={StyleSheet.absoluteFill} />
        <AmbientLayer meta={meta} pulse={pulse} reduceMotion={profile.reduceMotion} />
        <SafeAreaView style={styles.safe}>
          <View style={styles.shell} {...panResponder.panHandlers}>
            <TopBar profile={profile} meta={meta} onSettings={() => switchMode("settings")} />
            <Animated.View
              style={[
                styles.screen,
                {
                  opacity: transition,
                  transform: [
                    { translateY: transition.interpolate({ inputRange: [0, 1], outputRange: [18, 0] }) },
                    { scale: transition.interpolate({ inputRange: [0, 1], outputRange: [0.985, 1] }) },
                  ],
                },
              ]}
            >
              {mode === "vyral" && (
                <VyralHome
                  width={maxWidth}
                  profile={profile}
                  quickCapture={quickCapture}
                  setQuickCapture={setQuickCapture}
                  files={files}
                  phase={intakePhase}
                  candidate={candidate}
                  spaces={spaces}
                  visualLoading={visualLoading}
                  onAnalyze={() => runSpaceMaker()}
                  onUpload={pickFile}
                  onCreate={createCandidateSpace}
                  onOpenLegacy={() => switchMode("legacy")}
                />
              )}
              {mode === "koi" && (
                <KoiHome
                  width={maxWidth}
                  profile={profile}
                  loading={koiLoading}
                  latest={koiSessions[0]}
                  candidate={candidate}
                  onDive={startDive}
                />
              )}
              {mode === "rotist" && (
                <RotistHome
                  width={maxWidth}
                  profile={profile}
                  loading={rotistLoading}
                  latest={rotistSessions[0]}
                  candidate={candidate}
                  onStart={startRotistSession}
                />
              )}
              {mode === "legacy" && <LegacyHome width={maxWidth} entries={legacy} profile={profile} />}
              {mode === "settings" && (
                <SettingsHome
                  width={maxWidth}
                  profile={profile}
                  setProfile={setProfile}
                  onResetOnboarding={() => setShowOnboarding(true)}
                />
              )}
            </Animated.View>
          </View>
        </SafeAreaView>
        <Animated.View pointerEvents="none" style={[styles.transitionGlass, { opacity: glass }]}>
          <BlurView intensity={42} tint="dark" style={StyleSheet.absoluteFill} />
        </Animated.View>
        <VCoreNav mode={mode} open={coreOpen} onOpen={() => setCoreOpen(true)} onClose={() => setCoreOpen(false)} onMode={switchMode} />
      </View>
    </SafeAreaProvider>
  );
}

function RootChrome({ meta, children }: { meta: ModeMeta; children: ReactNode }) {
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.app}>
        <LinearGradient colors={meta.gradient} style={StyleSheet.absoluteFill} />
        <SafeAreaView style={styles.centerSafe}>{children}</SafeAreaView>
      </View>
    </SafeAreaProvider>
  );
}

function OnboardingFlow({ initial, onComplete }: { initial: OnboardingProfile; onComplete: (profile: OnboardingProfile) => void }) {
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<OnboardingProfile>(initial);
  const [building, setBuilding] = useState(false);
  const screens = [
    {
      title: "Drop in the chaos.",
      body: "VYRAL turns your notes, files, thoughts, writing, and resets into adaptive Spaces.",
      visual: <MotionPreview theme="space_bloom" reduceMotion={profile.reduceMotion} />,
    },
    {
      title: "Your life does not fit in fixed tabs.",
      body: "VYRAL notices patterns and builds Spaces around how you actually work, create, study, and grow.",
      visual: <MiniSpaceFormation />,
    },
    {
      title: "When everything gets loud, DIVE.",
      body: "KOI helps you reset, breathe, reflect, and return with one clear next step.",
      visual: <MotionPreview theme="koi_ripple" reduceMotion={profile.reduceMotion} />,
    },
    {
      title: "Your writing has a signal.",
      body: "ROTIST captures pressure, rhythm, hesitation, spacing, and motion so handwritten thought can become action.",
      visual: <MotionPreview theme="rotist_trace" reduceMotion={profile.reduceMotion} />,
    },
    {
      title: "You stay in control.",
      body: "Approve Spaces, rename them, delete data, turn off insights, and decide what gets remembered.",
      visual: <PrivacyControlsStep profile={profile} setProfile={setProfile} />,
    },
  ];

  async function complete() {
    setBuilding(true);
    await onComplete(profile);
    setBuilding(false);
  }

  if (building) {
    return <View style={styles.onboardingWrap}><LoadingScreen kind="space" /></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.onboardingWrap} showsVerticalScrollIndicator={false}>
      {screens[step].visual}
      <Text style={styles.onboardingTitle}>{screens[step].title}</Text>
      <Text style={styles.onboardingBody}>{screens[step].body}</Text>
      {step === 0 && <NameStep profile={profile} setProfile={setProfile} />}
      {step === 1 && <ChoiceStep profile={profile} setProfile={setProfile} />}
      {step === 4 && <StarterSpacePreview profile={profile} />}
      <View style={styles.onboardingButtons}>
        {step > 0 && <SecondaryButton label="Back" onPress={() => setStep(step - 1)} />}
        <PrimaryButton label={step === screens.length - 1 ? "Enter VYRAL" : step === 0 ? "Begin" : "Next"} onPress={step === screens.length - 1 ? complete : () => setStep(step + 1)} />
      </View>
      <View style={styles.dots}>
        {screens.map((_, index) => <View key={index} style={[styles.dot, index === step && styles.dotActive]} />)}
      </View>
    </ScrollView>
  );
}

function NameStep({ profile, setProfile }: { profile: OnboardingProfile; setProfile: (profile: OnboardingProfile) => void }) {
  return (
    <GlassCard>
      <Text style={styles.kicker}>What should VYRAL call you?</Text>
      <TextInput
        value={profile.displayName}
        onChangeText={(displayName) => setProfile({ ...profile, displayName })}
        placeholder="Garrison"
        placeholderTextColor="rgba(247,247,255,0.36)"
        style={styles.input}
      />
    </GlassCard>
  );
}

function ChoiceStep({ profile, setProfile }: { profile: OnboardingProfile; setProfile: (profile: OnboardingProfile) => void }) {
  return (
    <GlassCard>
      <Text style={styles.kicker}>What do you want help organizing first?</Text>
      <ChipGrid
        values={["School", "Creative projects", "Focus", "Resetting", "Writing / notes", "Everything at once"]}
        selected={[profile.primaryUseCase]}
        onToggle={(value) => setProfile({ ...profile, primaryUseCase: value as PrimaryUseCase })}
      />
      <Text style={styles.kicker}>What should VYRAL notice?</Text>
      <ChipGrid
        values={["deadlines", "scattered notes", "creative ideas", "repeated stress points", "writing patterns", "group projects", "routines", "milestones"]}
        selected={profile.patternPreferences}
        onToggle={(value) => {
          const exists = profile.patternPreferences.includes(value);
          setProfile({
            ...profile,
            patternPreferences: exists
              ? profile.patternPreferences.filter((item) => item !== value)
              : [...profile.patternPreferences, value],
          });
        }}
      />
      <Text style={styles.kicker}>How should the system feel?</Text>
      <ChipGrid
        values={["Calm", "Focused", "High-energy", "Minimal", "Cinematic", "Adaptive"]}
        selected={[profile.systemVibe]}
        onToggle={(value) => setProfile({ ...profile, systemVibe: value as SystemVibe })}
      />
      <Text style={styles.kicker}>Automation comfort</Text>
      <ChipGrid
        values={["Suggest only", "Ask before creating", "Auto-create drafts", "Fully adaptive, but always reversible"]}
        selected={[profile.automationLevel]}
        onToggle={(value) => setProfile({ ...profile, automationLevel: value as AutomationLevel })}
      />
    </GlassCard>
  );
}

function PrivacyControlsStep({ profile, setProfile }: { profile: OnboardingProfile; setProfile: (profile: OnboardingProfile) => void }) {
  return (
    <GlassCard>
      <ToggleLine label="Ask before creating Spaces" value={profile.automationLevel === "Ask before creating"} onPress={() => setProfile({ ...profile, automationLevel: "Ask before creating" })} />
      <ToggleLine label="Save reflections to Life & Legacy" value onPress={() => undefined} />
      <ToggleLine label="Use ROTIST writing insights" value onPress={() => undefined} />
      <ToggleLine label="Enable KOI reset suggestions" value onPress={() => undefined} />
      <ToggleLine label="Reduce motion" value={profile.reduceMotion} onPress={() => setProfile({ ...profile, reduceMotion: !profile.reduceMotion })} />
      <ToggleLine label="Dyslexia-friendly spacing" value={profile.dyslexiaSpacing} onPress={() => setProfile({ ...profile, dyslexiaSpacing: !profile.dyslexiaSpacing })} />
      <ToggleLine label="High contrast" value={profile.highContrast} onPress={() => setProfile({ ...profile, highContrast: !profile.highContrast })} />
    </GlassCard>
  );
}

function StarterSpacePreview({ profile }: { profile: OnboardingProfile }) {
  return (
    <GlassCard>
      <Text style={styles.kicker}>VYRAL found a starting shape</Text>
      <Text style={styles.cardTitle}>{starterSpaceName(profile)}</Text>
      <Text style={styles.bodyText}>Suggested from {profile.primaryUseCase.toLowerCase()}, {profile.patternPreferences.slice(0, 2).join(", ")}, and a {profile.systemVibe.toLowerCase()} workspace.</Text>
    </GlassCard>
  );
}

function VyralHome({
  width,
  profile,
  quickCapture,
  setQuickCapture,
  files,
  phase,
  candidate,
  spaces,
  visualLoading,
  onAnalyze,
  onUpload,
  onCreate,
  onOpenLegacy,
}: {
  width: number;
  profile: OnboardingProfile;
  quickCapture: string;
  setQuickCapture: (text: string) => void;
  files: UploadedFileSignal[];
  phase: IntakePhase;
  candidate: GeneratedSpace | null;
  spaces: GeneratedSpace[];
  visualLoading: boolean;
  onAnalyze: () => void;
  onUpload: () => void;
  onCreate: () => void;
  onOpenLegacy: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={[styles.scroll, profile.dyslexiaSpacing && styles.dyslexiaSpacing]} showsVerticalScrollIndicator={false}>
      <Hero width={width} title={`Good evening, ${profile.displayName}.`} body="Drop in the chaos. VYRAL builds the Space." icon="sparkles-outline" accent="#9b5cff" />
      <GlassCard>
        <Text style={styles.kicker}>Space Maker</Text>
        <TextInput value={quickCapture} onChangeText={setQuickCapture} multiline style={styles.textArea} placeholder="Type a messy thought, task, lyric, note, or plan." placeholderTextColor="rgba(247,247,255,0.36)" />
        <View style={styles.buttonRow}>
          <SecondaryButton label="Upload File" icon="cloud-upload-outline" onPress={onUpload} />
          <PrimaryButton label="Build Space" icon="sparkles-outline" onPress={onAnalyze} />
        </View>
      </GlassCard>
      {files.length > 0 && (
        <GlassCard>
          <Text style={styles.kicker}>File intake</Text>
          {files.map((file) => <FileRow key={file.id} file={file} />)}
        </GlassCard>
      )}
      {phase !== "idle" && !candidate && <SpaceMakerPanel phase={phase} />}
      {candidate && (
        <GlassCard>
          <Text style={styles.kicker}>Generated Space</Text>
          {visualLoading ? <GeneratedVisualLoading /> : <GeneratedVisual visual={candidate.visual} title={candidate.spaceName} />}
          <Text style={styles.cardTitle}>{candidate.spaceName}</Text>
          <Text style={styles.bodyText}>{candidate.description}</Text>
          <InfoList title="Why this exists" items={[candidate.reason]} />
          <InfoList title="Detected patterns" items={candidate.detectedPatterns} />
          <TaskList tasks={candidate.tasks} />
          <InfoList title="Next actions" items={candidate.nextActions} />
          <MotionPreview theme={candidate.animationTheme} space={candidate} reduceMotion={profile.reduceMotion} />
          <PrimaryButton label="Create Space" icon="checkmark-circle-outline" onPress={onCreate} />
        </GlassCard>
      )}
      <SectionHeader title="Active Spaces" action="Generated from real inputs" />
      {spaces.map((space) => <SpaceCard key={space.id} space={space} />)}
      <PrimaryButton label="Open Life & Legacy" icon="time-outline" onPress={onOpenLegacy} />
    </ScrollView>
  );
}

function KoiHome({ width, profile, loading, latest, candidate, onDive }: { width: number; profile: OnboardingProfile; loading: boolean; latest?: KoiSession; candidate: GeneratedSpace | null; onDive: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Hero width={width} title="When everything gets loud, DIVE." body="KOI helps you reset, breathe, reflect, and return with one clear next step." icon="water-outline" accent="#27d9ff" />
      {loading ? <LoadingScreen kind="koi" reduceMotion={profile.reduceMotion} /> : <MotionPreview theme="koi_ripple" koi={latest} reduceMotion={profile.reduceMotion} />}
      <PrimaryButton label="Start 60-second DIVE" icon="water-outline" onPress={onDive} />
      {latest && (
        <GlassCard>
          <Text style={styles.kicker}>Reflection prompt</Text>
          <Text style={styles.cardTitle}>{latest.prompt}</Text>
          <Text style={styles.bodyText}>{latest.reflection}</Text>
          <InfoList title="Clean next action" items={[latest.nextAction]} />
        </GlassCard>
      )}
      {candidate?.spaceType === "reset_reflection" && <SpaceCard space={candidate} />}
    </ScrollView>
  );
}

function RotistHome({ width, profile, loading, latest, candidate, onStart }: { width: number; profile: OnboardingProfile; loading: boolean; latest?: RotistSession; candidate: GeneratedSpace | null; onStart: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Hero width={width} title="Your writing has a signal." body="ROTIST turns pressure, rhythm, hesitation, spacing, and motion into structure." icon="pencil-outline" accent="#b7f75a" />
      {loading ? <LoadingScreen kind="rotist" reduceMotion={profile.reduceMotion} /> : <MotionPreview theme="rotist_trace" rotist={latest} reduceMotion={profile.reduceMotion} />}
      <PrimaryButton label="Start Writing Session" icon="pencil-outline" onPress={onStart} />
      {latest && (
        <GlassCard>
          <Text style={styles.kicker}>Writing intelligence</Text>
          <Text style={styles.cardTitle}>{latest.title}</Text>
          <MetricRow values={[["Pressure", `${latest.pressure}%`], ["Fatigue", `${latest.fatigue}%`], ["Spacing", latest.spacing]]} />
          <Text style={styles.bodyText}>{latest.summary}</Text>
          <TaskList tasks={latest.extractedTasks} />
        </GlassCard>
      )}
      {candidate?.spaceType === "rotist_trace" && <SpaceCard space={candidate} />}
      <FeatureBubble title="Ghost Word" body="Looks like you are writing environment. Accept with a forward flick?" />
      <FeatureBubble title="Spatial Undo" body="Move backward through the air to undo your last annotation." />
      <FeatureBubble title="Summary Lift" body="Circle a paragraph, lift the pen, and flick upward to create a summary card." />
    </ScrollView>
  );
}

function LegacyHome({ width, entries, profile }: { width: number; entries: LegacyEntry[]; profile: OnboardingProfile }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Hero width={width} title="Remember what matters." body="Life & Legacy keeps approved milestones, breakthroughs, resets, and writing sessions." icon="time-outline" accent="#ffd36a" />
      {entries[0] && <MotionPreview theme="legacy_memory" legacy={entries[0]} reduceMotion={profile.reduceMotion} />}
      {entries.map((entry) => (
        <GlassCard key={entry.id}>
          <Text style={styles.kicker}>{entry.source}</Text>
          <Text style={styles.cardTitle}>{entry.title}</Text>
          <Text style={styles.bodyText}>{entry.body}</Text>
        </GlassCard>
      ))}
    </ScrollView>
  );
}

function SettingsHome({ width, profile, setProfile, onResetOnboarding }: { width: number; profile: OnboardingProfile; setProfile: (profile: OnboardingProfile) => void; onResetOnboarding: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <Hero width={width} title="You stay in control." body="Nothing is permanent. Rename, merge, split, archive, or delete any Space." icon="options-outline" accent="#f7f7ff" />
      <GlassCard>
        <ToggleLine label="Reduce motion" value={profile.reduceMotion} onPress={() => setProfile({ ...profile, reduceMotion: !profile.reduceMotion })} />
        <ToggleLine label="Dyslexia-friendly spacing" value={profile.dyslexiaSpacing} onPress={() => setProfile({ ...profile, dyslexiaSpacing: !profile.dyslexiaSpacing })} />
        <ToggleLine label="High contrast" value={profile.highContrast} onPress={() => setProfile({ ...profile, highContrast: !profile.highContrast })} />
        <ToggleLine label="Slow-read pacing" value={profile.slowReadPacing} onPress={() => setProfile({ ...profile, slowReadPacing: !profile.slowReadPacing })} />
      </GlassCard>
      <SecondaryButton label="Reset onboarding" icon="refresh-outline" onPress={onResetOnboarding} />
    </ScrollView>
  );
}

function TopBar({ profile, meta, onSettings }: { profile: OnboardingProfile; meta: ModeMeta; onSettings: () => void }) {
  return (
    <View style={styles.topBar}>
      <View>
        <Text style={styles.kicker}>VYRAL CORE</Text>
        <Text style={styles.topTitle}>{meta.label}</Text>
      </View>
      <Pressable onPress={onSettings} style={[styles.profileOrb, { borderColor: meta.accent }]}>
        <Text style={styles.profileText}>{profile.displayName.slice(0, 1).toUpperCase() || "G"}</Text>
      </Pressable>
    </View>
  );
}

function AmbientLayer({ meta, pulse, reduceMotion }: { meta: ModeMeta; pulse: Animated.Value; reduceMotion: boolean }) {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Animated.View
        style={[
          styles.ambientRing,
          {
            borderColor: meta.accent,
            opacity: reduceMotion ? 0.28 : pulse.interpolate({ inputRange: [0, 1], outputRange: [0.18, 0.42] }),
            transform: [{ scale: reduceMotion ? 1 : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] }) }],
          },
        ]}
      />
      <View style={[styles.ambientGlow, { backgroundColor: meta.glow }]} />
    </View>
  );
}

function VCoreNav({ mode, open, onOpen, onClose, onMode }: { mode: ModeKey; open: boolean; onOpen: () => void; onClose: () => void; onMode: (mode: ModeKey) => void }) {
  const meta = modes[mode];
  return (
    <>
      {open && (
        <Pressable style={styles.navOverlay} onPress={onClose}>
          <BlurView intensity={42} tint="dark" style={StyleSheet.absoluteFill} />
          <View style={styles.radial}>
            {modeOrder.map((key, index) => {
              const item = modes[key];
              const positions = [{ top: 0, left: 104 }, { left: 0, bottom: 0 }, { right: 0, bottom: 0 }];
              return (
                <Pressable key={key} style={[styles.radialCard, positions[index], mode === key && { borderColor: item.accent }]} onPress={() => onMode(key)}>
                  <Ionicons name={item.icon} size={24} color={item.accent} />
                  <Text style={styles.radialTitle}>{item.label}</Text>
                  <Text style={styles.radialSub}>{item.subtitle}</Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      )}
      <SafeAreaView edges={["bottom"]} style={styles.coreSafe}>
        <BlurView intensity={26} tint="dark" style={styles.rail}>
          {modeOrder.map((key) => {
            const item = modes[key];
            const active = key === mode;
            return (
              <Pressable key={key} onPress={() => onMode(key)} style={styles.railItem}>
                <Ionicons name={item.icon} size={18} color={active ? item.accent : "rgba(247,247,255,0.44)"} />
                <Text style={[styles.railText, active && { color: item.accent }]}>{item.label}</Text>
              </Pressable>
            );
          })}
        </BlurView>
        <Pressable onPress={onOpen} style={[styles.coreButton, { borderColor: meta.accent }]}>
          <LinearGradient colors={[meta.accent, meta.glow]} style={StyleSheet.absoluteFill} />
          <Text style={styles.coreText}>V</Text>
        </Pressable>
      </SafeAreaView>
    </>
  );
}

function Hero({ width, title, body, icon, accent }: { width: number; title: string; body: string; icon: keyof typeof Ionicons.glyphMap; accent: string }) {
  return (
    <View style={[styles.hero, { width, borderColor: withAlpha(accent, 0.28) }]}>
      <View style={styles.heroText}>
        <View style={[styles.heroIcon, { borderColor: withAlpha(accent, 0.4) }]}>
          <Ionicons name={icon} size={24} color={accent} />
        </View>
        <Text style={styles.heroTitle}>{title}</Text>
        <Text style={styles.heroBody}>{body}</Text>
      </View>
    </View>
  );
}

function GlassCard({ children }: { children: ReactNode }) {
  return (
    <View style={styles.card}>
      <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.cardInner}>{children}</View>
    </View>
  );
}

function SpaceMakerPanel({ phase }: { phase: IntakePhase }) {
  const phases: IntakePhase[] = ["received", "detecting", "patterns", "tasks", "suggested", "ready"];
  const labels = ["File received", "Content detected", "Patterns detected", "Tasks extracted", "Space suggested", "Ready for review"];
  const active = Math.max(0, phases.indexOf(phase));
  return (
    <GlassCard>
      <Text style={styles.kicker}>Space Maker processing</Text>
      {labels.map((label, index) => (
        <View key={label} style={styles.phaseRow}>
          <View style={[styles.phaseDot, index <= active && styles.phaseDotActive]} />
          <Text style={styles.bodyText}>{label}</Text>
        </View>
      ))}
    </GlassCard>
  );
}

function SpaceCard({ space }: { space: GeneratedSpace }) {
  return (
    <GlassCard>
      <GeneratedVisual visual={space.visual} title={space.spaceName} compact />
      <Text style={styles.cardTitle}>{space.spaceName}</Text>
      <Text style={styles.bodyText}>{space.description}</Text>
      <InfoList title="Patterns" items={space.detectedPatterns.slice(0, 3)} />
      <InfoList title="Next" items={space.nextActions.slice(0, 2)} />
    </GlassCard>
  );
}

function GeneratedVisual({ visual, title, compact }: { visual: GeneratedSpace["visual"]; title: string; compact?: boolean }) {
  return (
    <View style={[styles.visual, compact && styles.visualCompact]}>
      <LinearGradient colors={visual.aura} style={StyleSheet.absoluteFill} />
      <View style={styles.visualOrb}>
        <Ionicons name={visual.icon as keyof typeof Ionicons.glyphMap} size={compact ? 24 : 34} color="#f7f7ff" />
      </View>
      {!compact && <Text style={styles.visualTitle}>{title}</Text>}
    </View>
  );
}

function FileRow({ file }: { file: UploadedFileSignal }) {
  return (
    <View style={styles.fileRow}>
      <Ionicons name="document-text-outline" size={20} color="#26d6e8" />
      <View style={styles.flex}>
        <Text style={styles.fileName}>{file.name}</Text>
        <Text style={styles.bodyText}>{file.extractedText}</Text>
      </View>
    </View>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <View style={styles.infoList}>
      <Text style={styles.kicker}>{title}</Text>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <View style={styles.smallDot} />
          <Text style={styles.bodyText}>{sanitizeAIText(item)}</Text>
        </View>
      ))}
    </View>
  );
}

function TaskList({ tasks }: { tasks: GeneratedSpace["tasks"] }) {
  return (
    <View style={styles.infoList}>
      <Text style={styles.kicker}>Extracted tasks</Text>
      {tasks.map((task) => (
        <View key={task.title} style={styles.taskRow}>
          <Text style={styles.taskPriority}>{task.priority}</Text>
          <Text style={styles.taskText}>{task.title}</Text>
          <Text style={styles.taskTime}>{task.estimatedMinutes}m</Text>
        </View>
      ))}
    </View>
  );
}

function MetricRow({ values }: { values: Array<[string, string]> }) {
  return (
    <View style={styles.metricRow}>
      {values.map(([label, value]) => (
        <View key={label} style={styles.metric}>
          <Text style={styles.metricValue}>{value}</Text>
          <Text style={styles.metricLabel}>{label}</Text>
        </View>
      ))}
    </View>
  );
}

function FeatureBubble({ title, body }: { title: string; body: string }) {
  return (
    <GlassCard>
      <View style={styles.featureRow}>
        <View style={styles.featureIcon}><Ionicons name="sparkles-outline" size={18} color="#b7f75a" /></View>
        <View style={styles.flex}>
          <Text style={styles.fileName}>{title}</Text>
          <Text style={styles.bodyText}>{body}</Text>
        </View>
      </View>
    </GlassCard>
  );
}

function MiniSpaceFormation() {
  return (
    <View style={styles.miniFormation}>
      {["Biology notes", "Friday test", "ROTIST session", "DIVE reflection"].map((item) => <Text key={item} style={styles.miniChip}>{item}</Text>)}
      <View style={styles.miniSpace}><Text style={styles.miniSpaceText}>Exam Week Control</Text></View>
    </View>
  );
}

function ChipGrid({ values, selected, onToggle }: { values: string[]; selected: string[]; onToggle: (value: string) => void }) {
  return (
    <View style={styles.chipGrid}>
      {values.map((value) => {
        const active = selected.includes(value);
        return <Pressable key={value} onPress={() => onToggle(value)} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{value}</Text></Pressable>;
      })}
    </View>
  );
}

function ToggleLine({ label, value, onPress }: { label: string; value: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.toggleLine}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <View style={[styles.toggle, value && styles.toggleOn]}><View style={[styles.toggleThumb, value && styles.toggleThumbOn]} /></View>
    </Pressable>
  );
}

function PrimaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={styles.primaryButton}>
      {icon && <Ionicons name={icon} size={18} color="#07101b" />}
      <Text style={styles.primaryText}>{label}</Text>
    </Pressable>
  );
}

function SecondaryButton({ label, onPress, icon }: { label: string; onPress: () => void; icon?: keyof typeof Ionicons.glyphMap }) {
  return (
    <Pressable onPress={onPress} style={styles.secondaryButton}>
      {icon && <Ionicons name={icon} size={18} color="#f7f7ff" />}
      <Text style={styles.secondaryText}>{label}</Text>
    </Pressable>
  );
}

function SectionHeader({ title, action }: { title: string; action: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionAction}>{action}</Text>
    </View>
  );
}

function starterSpaceName(profile: OnboardingProfile) {
  if (profile.primaryUseCase.includes("School") || profile.patternPreferences.includes("deadlines")) return "Exam Week Control";
  if (profile.primaryUseCase.includes("Creative") || profile.patternPreferences.includes("creative ideas")) return "Late Night Studio";
  if (profile.primaryUseCase.includes("Reset") || profile.patternPreferences.includes("repeated stress points")) return "Reset Mode";
  if (profile.primaryUseCase.includes("Writing") || profile.patternPreferences.includes("writing patterns")) return "Trace Lab";
  return "Adaptive Core";
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}

function withAlpha(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: "#050713" },
  safe: { flex: 1 },
  centerSafe: { flex: 1, justifyContent: "center", padding: 18 },
  shell: { flex: 1 },
  screen: { flex: 1 },
  flex: { flex: 1 },
  scroll: { paddingHorizontal: 16, paddingBottom: 136, gap: 16, alignItems: "center" },
  dyslexiaSpacing: { gap: 22 },
  topBar: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  kicker: { color: "rgba(247,247,255,0.52)", fontSize: 10, letterSpacing: 1.7, textTransform: "uppercase", fontWeight: "800" },
  topTitle: { color: "#f7f7ff", fontSize: 24, fontWeight: "900", letterSpacing: 4 },
  profileOrb: { width: 46, height: 46, borderRadius: 23, borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  profileText: { color: "#f7f7ff", fontWeight: "900", fontSize: 18 },
  ambientRing: { position: "absolute", width: 360, height: 360, borderRadius: 180, borderWidth: 1, right: -150, top: 90 },
  ambientGlow: { position: "absolute", width: 180, height: 180, borderRadius: 90, opacity: 0.08, left: -70, bottom: 190 },
  hero: { minHeight: 220, borderRadius: 32, borderWidth: 1, backgroundColor: "rgba(255,255,255,0.045)", padding: 22, justifyContent: "flex-end", overflow: "hidden" },
  heroText: { maxWidth: 330, gap: 12 },
  heroIcon: { width: 54, height: 54, borderRadius: 18, borderWidth: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.06)" },
  heroTitle: { color: "#f7f7ff", fontSize: 31, lineHeight: 35, fontWeight: "900" },
  heroBody: { color: "rgba(247,247,255,0.68)", fontSize: 14, lineHeight: 21 },
  card: { width: "100%", borderRadius: 26, borderWidth: 1, borderColor: "rgba(255,255,255,0.095)", backgroundColor: "rgba(255,255,255,0.04)", overflow: "hidden" },
  cardInner: { padding: 16, gap: 14 },
  cardTitle: { color: "#f7f7ff", fontSize: 21, lineHeight: 25, fontWeight: "900" },
  bodyText: { color: "rgba(247,247,255,0.66)", fontSize: 13, lineHeight: 19 },
  input: { minHeight: 48, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.055)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", color: "#f7f7ff", paddingHorizontal: 13, fontSize: 15 },
  textArea: { minHeight: 96, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.052)", borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", color: "#f7f7ff", padding: 13, textAlignVertical: "top", fontSize: 15, lineHeight: 21 },
  buttonRow: { flexDirection: "row", gap: 10 },
  primaryButton: { flex: 1, minHeight: 50, borderRadius: 17, backgroundColor: "#b7f75a", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, paddingHorizontal: 12 },
  primaryText: { color: "#07101b", fontWeight: "900", fontSize: 13 },
  secondaryButton: { flex: 1, minHeight: 50, borderRadius: 17, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(255,255,255,0.055)", alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, paddingHorizontal: 12 },
  secondaryText: { color: "#f7f7ff", fontWeight: "900", fontSize: 13 },
  onboardingWrap: { flexGrow: 1, justifyContent: "center", gap: 18, padding: 18 },
  onboardingTitle: { color: "#f7f7ff", fontSize: 34, lineHeight: 38, fontWeight: "900" },
  onboardingBody: { color: "rgba(247,247,255,0.7)", fontSize: 15, lineHeight: 22 },
  onboardingButtons: { flexDirection: "row", gap: 10 },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8 },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(247,247,255,0.22)" },
  dotActive: { backgroundColor: "#26d6e8", width: 22 },
  chipGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(255,255,255,0.045)", paddingHorizontal: 11, paddingVertical: 8 },
  chipActive: { backgroundColor: "rgba(38,214,232,0.15)", borderColor: "rgba(38,214,232,0.34)" },
  chipText: { color: "rgba(247,247,255,0.58)", fontSize: 12, fontWeight: "800" },
  chipTextActive: { color: "#f7f7ff" },
  toggleLine: { minHeight: 50, flexDirection: "row", alignItems: "center", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "rgba(255,255,255,0.07)" },
  toggleLabel: { color: "#f7f7ff", fontSize: 14, fontWeight: "700", flex: 1 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", padding: 3 },
  toggleOn: { backgroundColor: "rgba(183,247,90,0.42)" },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "rgba(247,247,255,0.72)" },
  toggleThumbOn: { transform: [{ translateX: 20 }], backgroundColor: "#b7f75a" },
  miniFormation: { height: 190, borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "rgba(5,8,22,0.62)", padding: 14, justifyContent: "center", gap: 8 },
  miniChip: { alignSelf: "flex-start", borderRadius: 999, backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(247,247,255,0.72)", paddingHorizontal: 12, paddingVertical: 7, fontWeight: "800", fontSize: 12 },
  miniSpace: { alignSelf: "flex-end", borderRadius: 18, borderWidth: 1, borderColor: "rgba(183,247,90,0.34)", backgroundColor: "rgba(183,247,90,0.12)", padding: 13 },
  miniSpaceText: { color: "#f7f7ff", fontWeight: "900" },
  phaseRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  phaseDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "rgba(247,247,255,0.18)" },
  phaseDotActive: { backgroundColor: "#26d6e8" },
  visual: { height: 190, borderRadius: 24, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  visualCompact: { height: 112 },
  visualOrb: { width: 78, height: 78, borderRadius: 39, backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.22)", alignItems: "center", justifyContent: "center" },
  visualTitle: { color: "#f7f7ff", fontSize: 18, fontWeight: "900", marginTop: 13 },
  infoList: { gap: 8 },
  bulletRow: { flexDirection: "row", alignItems: "flex-start", gap: 9 },
  smallDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#26d6e8", marginTop: 7 },
  taskRow: { minHeight: 42, flexDirection: "row", alignItems: "center", gap: 9, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.052)", paddingHorizontal: 10 },
  taskPriority: { color: "#b7f75a", fontSize: 10, fontWeight: "900", textTransform: "uppercase", width: 50 },
  taskText: { flex: 1, color: "#f7f7ff", fontSize: 13, fontWeight: "700" },
  taskTime: { color: "rgba(247,247,255,0.45)", fontSize: 11, fontWeight: "800" },
  fileRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
  fileName: { color: "#f7f7ff", fontSize: 14, fontWeight: "900" },
  metricRow: { flexDirection: "row", gap: 9 },
  metric: { flex: 1, minHeight: 62, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.055)", alignItems: "center", justifyContent: "center" },
  metricValue: { color: "#b7f75a", fontSize: 18, fontWeight: "900" },
  metricLabel: { color: "rgba(247,247,255,0.48)", fontSize: 10, marginTop: 3 },
  featureRow: { flexDirection: "row", gap: 12, alignItems: "center" },
  featureIcon: { width: 42, height: 42, borderRadius: 15, backgroundColor: "rgba(183,247,90,0.12)", alignItems: "center", justifyContent: "center" },
  sectionHeader: { width: "100%", flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", gap: 12 },
  sectionTitle: { color: "#f7f7ff", fontSize: 20, fontWeight: "900" },
  sectionAction: { flex: 1, color: "rgba(247,247,255,0.42)", fontSize: 11, textAlign: "right" },
  transitionGlass: { ...StyleSheet.absoluteFillObject },
  navOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 20, alignItems: "center", justifyContent: "flex-end", paddingBottom: 108 },
  radial: { width: 316, height: 252 },
  radialCard: { position: "absolute", width: 108, height: 108, borderRadius: 28, borderWidth: 1, borderColor: "rgba(255,255,255,0.12)", backgroundColor: "rgba(5,8,22,0.78)", alignItems: "center", justifyContent: "center", gap: 5, padding: 10 },
  radialTitle: { color: "#f7f7ff", fontSize: 13, fontWeight: "900", letterSpacing: 1.3 },
  radialSub: { color: "rgba(247,247,255,0.48)", fontSize: 10, textAlign: "center" },
  coreSafe: { position: "absolute", left: 0, right: 0, bottom: 0, zIndex: 30, alignItems: "center" },
  rail: { width: "91%", minHeight: 74, marginBottom: 12, borderRadius: 29, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", overflow: "hidden", flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  railItem: { flex: 1, alignItems: "center", gap: 4 },
  railText: { color: "rgba(247,247,255,0.44)", fontSize: 10, fontWeight: "900", letterSpacing: 0.5 },
  coreButton: { position: "absolute", bottom: 42, width: 62, height: 62, borderRadius: 31, borderWidth: 2, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  coreText: { color: "#f7f7ff", fontSize: 27, fontWeight: "900" },
});
