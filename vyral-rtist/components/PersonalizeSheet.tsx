import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { BlurView } from "expo-blur";
import Animated, { FadeInUp } from "react-native-reanimated";
import PressableScale from "./PressableScale";
import { type ComponentId, useTheme } from "../lib/themeContext";

const PALETTE = [
  "#a855f7",
  "#22d3ee",
  "#a3e635",
  "#f59e0b",
  "#ef4444",
  "#ec4899",
  "#3b82f6",
  "#10b981",
  "#f97316",
  "#e2e8f0",
];

const COMPONENTS: { id: ComponentId; label: string; desc: string }[] = [
  { id: "navAccent", label: "Navigation accent", desc: "Tab bar icons, FAB, active indicators" },
  { id: "tabBar", label: "Tab bar tint", desc: "Background glow of the floating nav" },
  { id: "homeHero", label: "Home header", desc: "The vyral wordmark and header accent" },
  { id: "feedCard", label: "Feed cards", desc: "Gradient tone of For You cards" },
  { id: "captureViewfinder", label: "Viewfinder", desc: "Capture screen frame and brackets" },
  { id: "captureRecord", label: "Record button", desc: "The record circle ring and glow" },
  { id: "profileOrb", label: "Profile orb", desc: "Avatar gradient and outer ring" },
  { id: "inboxTab", label: "Inbox tabs", desc: "Active filter pill in Inbox" },
  { id: "discoverTag", label: "Discover tags", desc: "Hashtag and challenge pills" },
  { id: "spaceCard", label: "Space cards", desc: "AI Spaces card accent" },
];

export default function PersonalizeSheet({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { overrides, setOverride, resetAll } = useTheme();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
        <View
          style={{
            maxHeight: "84%",
            borderTopLeftRadius: 30,
            borderTopRightRadius: 30,
            backgroundColor: "#070412",
            borderTopWidth: 1,
            borderColor: "rgba(168,85,247,0.22)",
            overflow: "hidden",
          }}
        >
          <BlurView intensity={50} tint="dark" style={{ position: "absolute", inset: 0 } as any} />

          <View
            style={{
              padding: 20,
              paddingBottom: 8,
              borderBottomWidth: 1,
              borderBottomColor: "rgba(255,255,255,0.06)",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <View>
                <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: -0.5 }}>
                  Personalize
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12, marginTop: 2 }}>
                  Color every surface. Changes save instantly.
                </Text>
              </View>
              <PressableScale
                haptic="light"
                onPress={onClose}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "rgba(255,255,255,0.07)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.1)",
                }}
              >
                <Text style={{ color: "rgba(255,255,255,0.7)", fontSize: 20, lineHeight: 22 }}>×</Text>
              </PressableScale>
            </View>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 20, gap: 26, paddingBottom: 52 }}
            showsVerticalScrollIndicator={false}
          >
            {COMPONENTS.map((comp, i) => {
              const current = overrides[comp.id]?.accentColor;
              return (
                <Animated.View key={comp.id} entering={FadeInUp.duration(300).delay(i * 35)}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: 10,
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>{comp.label}</Text>
                      <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 11, marginTop: 2 }}>
                        {comp.desc}
                      </Text>
                    </View>
                    {current && (
                      <PressableScale
                        haptic="selection"
                        onPress={() => setOverride(comp.id, { accentColor: undefined })}
                        style={{
                          paddingHorizontal: 10,
                          paddingVertical: 5,
                          borderRadius: 10,
                          borderWidth: 1,
                          borderColor: "rgba(255,255,255,0.12)",
                          backgroundColor: "rgba(255,255,255,0.04)",
                        }}
                      >
                        <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>Reset</Text>
                      </PressableScale>
                    )}
                  </View>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                    {PALETTE.map((color) => {
                      const isActive = current === color;
                      return (
                        <PressableScale
                          key={color}
                          haptic="selection"
                          scaleTo={0.88}
                          onPress={() => setOverride(comp.id, { accentColor: color })}
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 17,
                            backgroundColor: color,
                            borderWidth: isActive ? 3 : 1.5,
                            borderColor: isActive ? "#fff" : "rgba(255,255,255,0.18)",
                            shadowColor: isActive ? color : "transparent",
                            shadowOpacity: isActive ? 0.8 : 0,
                            shadowRadius: 10,
                          }}
                        />
                      );
                    })}
                  </View>
                </Animated.View>
              );
            })}

            <PressableScale
              haptic="medium"
              onPress={resetAll}
              style={{
                paddingVertical: 13,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: "rgba(239,68,68,0.28)",
                backgroundColor: "rgba(239,68,68,0.05)",
                alignItems: "center",
                marginTop: 4,
              }}
            >
              <Text style={{ color: "#fca5a5", fontSize: 13, fontWeight: "700" }}>Reset all to defaults</Text>
            </PressableScale>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
