import "../global.css";
import { Stack, Redirect } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { AuthProvider, useAuth } from "../lib/auth";
import AmbientBackground from "../components/AmbientBackground";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#05060d" }}>
      <SafeAreaProvider>
        <AuthProvider>
          <View style={{ flex: 1, backgroundColor: "#05060d" }}>
            <AmbientBackground />
            <AuthGate />
            <StatusBar style="light" />
          </View>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Renders the stack; redirects unauthenticated users to /login when Supabase is configured.
function AuthGate() {
  const { user, loading, configured } = useAuth();

  // While loading + Supabase configured, show nothing (the Boot screen flashes via index).
  if (loading && configured) return null;

  // When Supabase isn't configured at all, let the user roam — dev preview mode.
  if (!configured) {
    return (
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
          animation: "fade",
        }}
      />
    );
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "transparent" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="spaces/[id]"
          options={{ animation: "slide_from_right", presentation: "card" }}
        />
        <Stack.Screen
          name="koi"
          options={{
            animation: "slide_from_right",
            presentation: "card",
            gestureEnabled: true,
            gestureDirection: "horizontal",
          }}
        />
      </Stack>
      {!user && <Redirect href="/login" />}
    </>
  );
}
