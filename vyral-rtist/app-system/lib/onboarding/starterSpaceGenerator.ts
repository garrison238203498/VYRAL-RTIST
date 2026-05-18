import { fallbackGenerateSpace } from "../mock/fallbackGenerators";
import type { GeneratedSpace, RecentActivity } from "../ai/types";
import type { OnboardingProfile } from "./onboardingTypes";

const emptyActivity: RecentActivity = {
  spaces: [],
  koiSessions: [],
  rotistSessions: [],
  legacyEntries: [],
};

export async function generateStarterSpaces(profile: Omit<OnboardingProfile, "starterSpaces">): Promise<GeneratedSpace[]> {
  const prompts = buildStarterPrompts(profile);
  const spaces = await Promise.all(
    prompts.map((text) =>
      fallbackGenerateSpace({
        text,
        files: [],
        recentActivity: emptyActivity,
      })
    )
  );
  const unique = new Map<string, GeneratedSpace>();
  spaces.forEach((space) => unique.set(space.spaceName, space));
  return Array.from(unique.values()).slice(0, 3);
}

function buildStarterPrompts(profile: Omit<OnboardingProfile, "starterSpaces">) {
  const pieces = [
    `${profile.primaryUseCase} ${profile.patternPreferences.join(" ")} ${profile.systemVibe}`,
  ];
  if (profile.primaryUseCase.includes("School") || profile.patternPreferences.includes("deadlines")) {
    pieces.push("biology test Friday study notes exam deadlines focused planning");
  }
  if (profile.primaryUseCase.includes("Creative") || profile.patternPreferences.includes("creative ideas")) {
    pieces.push("lyrics hook beat verse scattered ideas cinematic studio");
  }
  if (profile.primaryUseCase.includes("Reset") || profile.patternPreferences.includes("repeated stress points")) {
    pieces.push("overwhelmed tired reset breathe one next action");
  }
  if (profile.primaryUseCase.includes("Writing") || profile.patternPreferences.includes("writing patterns")) {
    pieces.push("ROTIST handwriting pressure spacing stroke notes");
  }
  return pieces;
}
