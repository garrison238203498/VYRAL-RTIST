import { useState } from "react";
import { Keyboard, Pressable, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import NeonButton from "../components/NeonButton";
import GlassCard from "../components/GlassCard";
import { colors } from "../components/theme";
import { useAuth } from "../lib/auth";

export default function Login() {
  const router = useRouter();
  const { signInWithPassword, signUp } = useAuth();
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!email || !password) {
      setError("Email and password required.");
      return;
    }
    setBusy(true);
    setError(null);
    const fn = mode === "sign-in" ? signInWithPassword : signUp;
    const { error: err } = await fn(email.trim(), password);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace("/(tabs)/home");
  }

  function skip() {
    router.replace("/(tabs)/home");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <LinearGradient
        colors={["#0a0010", "#05000a", "#000"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ position: "absolute", inset: 0 } as any}
      />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1, paddingHorizontal: 22, paddingTop: 24, justifyContent: "center" }}>
          <Animated.View entering={FadeInUp.duration(600)} style={{ marginBottom: 30 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 18 }}>
              <View
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  borderWidth: 1,
                  borderColor: "rgba(168,85,247,0.5)",
                }}
              >
                <LinearGradient
                  colors={["#a855f7", "#22d3ee", "#a3e635"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{ position: "absolute", inset: 0, opacity: 0.25 } as any}
                />
                <Text style={{ color: "#fff", fontSize: 18, fontWeight: "700" }}>V</Text>
              </View>
              <Text style={{ color: colors.textLo, fontSize: 11, letterSpacing: 3, textTransform: "uppercase" }}>
                Vyral · your reality as lived
              </Text>
            </View>
            <Text
              style={{
                color: colors.textHi,
                fontSize: 32,
                fontWeight: "700",
                letterSpacing: -1,
                lineHeight: 36,
              }}
            >
              {mode === "sign-in" ? "Welcome back." : "Start your file."}
            </Text>
            <Text style={{ color: colors.textLo, fontSize: 14, marginTop: 8, lineHeight: 20 }}>
              {mode === "sign-in"
                ? "Vyral is your AI life OS. Drop a thought, a photo, a PDF — Vyral organizes it for you."
                : "We don't share what you save. Spaces, themes, and reflections stay yours."}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(700)}>
            <GlassCard accent="violet" rounded="xl" intensity={28} inlinePadding={18}>
              <View style={{ gap: 12 }}>
                <Field
                  label="Email"
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setError(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <Field
                  label="Password"
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setError(null);
                  }}
                  secureTextEntry
                />
                {error ? (
                  <Text style={{ color: "#fb7185", fontSize: 12 }}>{error}</Text>
                ) : null}
                <NeonButton
                  label={busy ? "..." : mode === "sign-in" ? "Sign in" : "Create account"}
                  onPress={submit}
                  disabled={busy}
                  haptic="medium"
                />
                <View style={{ flexDirection: "row", justifyContent: "center", gap: 4, marginTop: 2 }}>
                  <Text style={{ color: colors.textLo, fontSize: 12 }}>
                    {mode === "sign-in" ? "New here?" : "Already have an account?"}
                  </Text>
                  <Text
                    onPress={() => setMode(mode === "sign-in" ? "sign-up" : "sign-in")}
                    style={{ color: "#22d3ee", fontSize: 12, fontWeight: "600" }}
                  >
                    {mode === "sign-in" ? "Make one" : "Sign in"}
                  </Text>
                </View>
              </View>
            </GlassCard>

            <Pressable
              onPress={skip}
              style={({ pressed }) => ({
                marginTop: 16,
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#22d3ee",
                backgroundColor: pressed ? "rgba(34,211,238,0.18)" : "rgba(34,211,238,0.08)",
                alignItems: "center",
                justifyContent: "center",
              })}
            >
              <Text
                style={{
                  color: "#22d3ee",
                  fontSize: 14,
                  fontWeight: "700",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                }}
              >
                Skip for now
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

function Field({
  label,
  ...rest
}: { label: string } & React.ComponentProps<typeof TextInput>) {
  return (
    <View>
      <Text
        style={{
          color: "rgba(255,255,255,0.5)",
          fontSize: 10,
          letterSpacing: 2.5,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </Text>
      <TextInput
        placeholderTextColor="rgba(255,255,255,0.3)"
        {...rest}
        style={{
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.14)",
          backgroundColor: "rgba(255,255,255,0.04)",
          paddingHorizontal: 14,
          paddingVertical: 12,
          borderRadius: 14,
          color: "#fff",
          fontSize: 15,
        }}
      />
    </View>
  );
}
