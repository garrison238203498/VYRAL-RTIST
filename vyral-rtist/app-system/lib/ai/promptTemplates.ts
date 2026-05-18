import type { SpaceMakerInput } from "./types";

export function buildSpaceMakerPrompt(input: SpaceMakerInput) {
  return {
    system:
      "You are the Space Maker engine for VYRAL, an AI-native teen life operating system. You do not chat. You structure messy input into clean JSON only. No markdown. No asterisks. No code fences.",
    user: JSON.stringify({
      userInput: input.text,
      uploadedFileSummary: input.files.map((file) => ({
        name: file.name,
        type: file.type,
        extractedText: file.extractedText,
      })),
      recentActivity: input.recentActivity,
      rotistSessionData: input.rotistSessionSummary,
      koiSessionData: input.koiReflection,
      returnShape: {
        spaceName: "",
        spaceType: "",
        description: "",
        reason: "",
        detectedPatterns: [],
        sourceSignals: [],
        tasks: [{ title: "", priority: "", estimatedMinutes: 0 }],
        nextActions: [],
        lifeLegacyEntry: "",
        visualPrompt: "",
        animationTheme: "",
      },
    }),
  };
}
