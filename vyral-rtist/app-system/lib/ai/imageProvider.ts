import type { GeneratedVisual } from "./types";

const auraByType: Record<string, [string, string, string]> = {
  school_focus: ["#101a34", "#2540a8", "#73f2ff"],
  creative_music: ["#160b2d", "#7b3dff", "#ff62b3"],
  reset_reflection: ["#061722", "#18b8e8", "#ff86b8"],
  rotist_trace: ["#080b12", "#7f6bff", "#b7f75a"],
  collaboration: ["#071b2a", "#26d6e8", "#9b5cff"],
  training_growth: ["#08190f", "#45d878", "#d7ff72"],
  writing_focus: ["#12101f", "#8e74ff", "#6ff0ff"],
};

const iconByType: Record<string, string> = {
  school_focus: "book-outline",
  creative_music: "musical-notes-outline",
  reset_reflection: "water-outline",
  rotist_trace: "pencil-outline",
  collaboration: "people-outline",
  training_growth: "trail-sign-outline",
  writing_focus: "document-text-outline",
};

export async function generateSpaceImage(prompt: string, styleContext: { spaceType: string }): Promise<GeneratedVisual> {
  await wait(420);
  return {
    id: `visual-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    prompt,
    provider: "local-placeholder",
    status: "ready",
    aura: auraByType[styleContext.spaceType] || ["#090b1f", "#6f5cff", "#26d6e8"],
    icon: iconByType[styleContext.spaceType] || "sparkles-outline",
  };
}

export async function generateKoiScene(prompt: string) {
  await wait(260);
  return {
    id: `koi-${Date.now()}`,
    prompt,
    aura: ["#051623", "#27d9ff", "#ff7bb8"] as [string, string, string],
  };
}

export async function generateRotistVisualization(prompt: string) {
  await wait(260);
  return {
    id: `rotist-${Date.now()}`,
    prompt,
    aura: ["#070910", "#7b5cff", "#b7f75a"] as [string, string, string],
  };
}

function wait(ms: number) {
  return new Promise<void>((resolve) => setTimeout(() => resolve(), ms));
}
