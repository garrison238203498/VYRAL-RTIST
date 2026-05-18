import { Tabs, useRouter } from "expo-router";
import { useEffect, useMemo, useCallback } from "react";
import { Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import Svg, { Path, Circle, Rect } from "react-native-svg";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import PressableScale from "../../components/PressableScale";
import { trackScreen } from "../../lib/store";

type TabDef = { name: string; label: string; center?: boolean };
const TABS: readonly TabDef[] = [
  { name: "home", label: "Home" },
  { name: "discover", label: "Discover" },
  { name: "capture", label: "Capture", center: true },
  { name: "inbox", label: "Inbox" },
  { name: "profile", label: "Profile" },
];

// Legacy screens that still exist as files but are no longer in the tab bar.
// Accessible via direct routes (e.g., /spaces from Profile).
const HIDDEN_TABS = ["spaces", "legacy", "me"];

// Right-edge swipe-to-KOI: gesture activates only when the user pans leftward
// from within EDGE_ZONE px of the right edge and crosses DRAG_THRESHOLD px.
const EDGE_ZONE = 18;
const DRAG_THRESHOLD = 70;

export default function TabsLayout() {
  const router = useRouter();
  const { width: screenW } = useWindowDimensions();

  const openKoi = useCallback(() => {
    router.push("/koi" as any);
  }, [router]);

  const edgeSwipe = useMemo(
    () =>
      Gesture.Pan()
        // Only steal the touch once it has clearly moved leftward 12+ px.
        // Right-direction pans never activate, so horizontal scroll views are safe.
        .activeOffsetX([-12, 9999])
        .onEnd((e) => {
          "worklet";
          const startX = e.absoluteX - e.translationX;
          const startedAtEdge = startX > screenW - EDGE_ZONE;
          const swipedLeftFar = e.translationX < -DRAG_THRESHOLD;
          if (startedAtEdge && swipedLeftFar) {
            runOnJS(openKoi)();
          }
        }),
    [screenW, openKoi]
  );

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar state={props.state} navigation={props.navigation} />}
      >
        {TABS.map((t) => (
          <Tabs.Screen key={t.name} name={t.name} options={{ title: t.label }} />
        ))}
        {HIDDEN_TABS.map((name) => (
          <Tabs.Screen key={name} name={name} options={{ href: null }} />
        ))}
      </Tabs>
      <GestureDetector gesture={edgeSwipe}>
        <View
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: EDGE_ZONE,
          }}
          collapsable={false}
          pointerEvents="auto"
        />
      </GestureDetector>
    </View>
  );
}

function CustomTabBar({ state, navigation }: { state: any; navigation: any }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeName = state.routes[state.index]?.name as string | undefined;

  useEffect(() => {
    if (activeName) trackScreen(activeName);
  }, [activeName]);

  return (
    <View
      style={{
        position: "absolute",
        left: 14,
        right: 14,
        bottom: Math.max(insets.bottom, 14),
      }}
    >
      <View
        style={{
          borderRadius: 28,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(168,85,247,0.18)",
          backgroundColor: "rgba(10,8,20,0.72)",
          shadowColor: "#000",
          shadowOpacity: 0.6,
          shadowRadius: 20,
          shadowOffset: { width: 0, height: 12 },
          elevation: 10,
        }}
      >
        <BlurView intensity={45} tint="dark" style={{ position: "absolute", inset: 0 } as any} />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 6,
            paddingVertical: 8,
            gap: 2,
          }}
        >
          {state.routes.map((route: any, idx: number) => {
            const tab = TABS.find((t) => t.name === route.name);
            if (!tab) return null;
            const isActive = state.index === idx;
            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!isActive && !event.defaultPrevented) {
                router.push(`/(tabs)/${route.name}` as any);
              }
            };

            if (tab.center) {
              return (
                <View key={route.key} style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                  <PressableScale
                    onPress={onPress}
                    haptic="heavy"
                    scaleTo={0.92}
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 28,
                      overflow: "hidden",
                      borderWidth: 1.5,
                      borderColor: "rgba(168,85,247,0.6)",
                      marginTop: -22,
                      shadowColor: "#a855f7",
                      shadowOpacity: 0.65,
                      shadowRadius: 18,
                      shadowOffset: { width: 0, height: 0 },
                      elevation: 14,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <LinearGradient
                      colors={["#a855f7", "#7c3aed"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={{ position: "absolute", inset: 0 } as any}
                    />
                    <Svg width={26} height={26} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 5v14M5 12h14" stroke="#fff" strokeWidth={2.8} strokeLinecap="round" />
                    </Svg>
                  </PressableScale>
                </View>
              );
            }

            return (
              <View key={route.key} style={{ flex: 1, alignItems: "center" }}>
                <PressableScale
                  onPress={onPress}
                  haptic="selection"
                  scaleTo={0.94}
                  style={{ alignItems: "center", paddingVertical: 6, width: "100%" }}
                >
                  {isActive && (
                    <View
                      style={{
                        position: "absolute",
                        top: -8,
                        height: 2,
                        width: 24,
                        borderRadius: 1,
                        backgroundColor: "#a855f7",
                        shadowColor: "#a855f7",
                        shadowOpacity: 0.9,
                        shadowRadius: 8,
                      }}
                    />
                  )}
                  <TabIcon name={tab.name} active={isActive} />
                  <Text
                    style={{
                      color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                      fontSize: 10,
                      marginTop: 2,
                      letterSpacing: 0.4,
                    }}
                  >
                    {tab.label}
                  </Text>
                </PressableScale>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabIcon({ name, active }: { name: string; active: boolean }) {
  const color = active ? "#fff" : "rgba(255,255,255,0.45)";
  switch (name) {
    case "home":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill={active ? color : "none"}>
          <Path
            d="M4 11l8-7 8 7v8a2 2 0 01-2 2h-3v-6h-6v6H6a2 2 0 01-2-2v-8z"
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
            fill={active ? "rgba(168,85,247,0.18)" : "none"}
          />
        </Svg>
      );
    case "discover":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx={11} cy={11} r={7} stroke={color} strokeWidth={1.6} />
          <Path d="M16.5 16.5L20 20" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    case "inbox":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Path
            d="M4 7a3 3 0 013-3h10a3 3 0 013 3v8a3 3 0 01-3 3h-7l-4 3v-3H7a3 3 0 01-3-3V7z"
            stroke={color}
            strokeWidth={1.6}
            strokeLinejoin="round"
          />
        </Svg>
      );
    case "profile":
      return (
        <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
          <Circle cx={12} cy={9} r={3.5} stroke={color} strokeWidth={1.6} />
          <Path d="M5 20a7 7 0 0114 0" stroke={color} strokeWidth={1.6} strokeLinecap="round" />
        </Svg>
      );
    default:
      return <Rect width={22} height={22} fill="transparent" />;
  }
}
