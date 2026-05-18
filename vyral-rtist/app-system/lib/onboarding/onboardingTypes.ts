import type { GeneratedSpace } from "../ai/types";

export type PrimaryUseCase = "School" | "Creative projects" | "Focus" | "Resetting" | "Writing / notes" | "Everything at once";
export type SystemVibe = "Calm" | "Focused" | "High-energy" | "Minimal" | "Cinematic" | "Adaptive";
export type AutomationLevel = "Suggest only" | "Ask before creating" | "Auto-create drafts" | "Fully adaptive, but always reversible";

export type OnboardingProfile = {
  displayName: string;
  primaryUseCase: PrimaryUseCase;
  patternPreferences: string[];
  systemVibe: SystemVibe;
  automationLevel: AutomationLevel;
  reduceMotion: boolean;
  dyslexiaSpacing: boolean;
  highContrast: boolean;
  slowReadPacing: boolean;
  starterSpaces: GeneratedSpace[];
};
