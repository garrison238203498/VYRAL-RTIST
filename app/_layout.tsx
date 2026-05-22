import "../global.css";
import { Stack, Redirect } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { View } from "react-native";
import { AuthProvider, useAuth } from "../lib/auth";
import { ThemeProvider } from "../lib/themeContext";
import AmbientBackground from "../components/AmbientBackground";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#05060d" }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <View style={{ flex: 1, backgroundColor: "#05060d" }}>
              <AmbientBackground />
              <AuthGate />
              <StatusBar style="light" />
            </View>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AuthGate() {
  const { user, loading, configured } = useAuth();

  if (loading && configured) return null;

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
