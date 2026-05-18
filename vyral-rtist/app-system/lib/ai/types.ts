export type SpacePriority = "low" | "medium" | "high";
export type AnimationTheme = "space_bloom" | "koi_ripple" | "rotist_trace" | "legacy_memory";
export type SpaceVisualStatus = "idle" | "generating" | "ready" | "error";

export type UploadedFileSignal = {
  id: string;
  name: string;
  type: string;
  size?: number;
  extractedText: string;
  status: "received" | "detecting" | "patterns" | "tasks" | "suggested" | "ready";
};

export type SpaceTask = {
  title: string;
  priority: SpacePriority;
  estimatedMinutes: number;
};

export type GeneratedVisual = {
  id: string;
  prompt: string;
  provider: "local-placeholder" | "external";
  status: SpaceVisualStatus;
  aura: [string, string, string];
  icon: string;
};

export type GeneratedSpace = {
  id: string;
  spaceName: string;
  spaceType: string;
  description: string;
  reason: string;
  detectedPatterns: string[];
  sourceSignals: string[];
  tasks: SpaceTask[];
  nextActions: string[];
  relatedFiles: string[];
  relatedRotistSessions: string[];
  relatedKoiSessions: string[];
  lifeLegacyEntry: string;
  visualPrompt: string;
  animationTheme: AnimationTheme;
  visual: GeneratedVisual;
  createdAt: string;
};

export type RecentActivity = {
  spaces: Pick<GeneratedSpace, "spaceName" | "spaceType" | "detectedPatterns">[];
  koiSessions: string[];
  rotistSessions: string[];
  legacyEntries: string[];
};

export type SpaceMakerInput = {
  text: string;
  files: UploadedFileSignal[];
  recentActivity: RecentActivity;
  koiReflection?: string;
  rotistSessionSummary?: string;
};

export type SpaceMakerResult = GeneratedSpace;

export type KoiSession = {
  id: string;
  prompt: string;
  reflection: string;
  insight: string;
  nextAction: string;
  saved: boolean;
};

export type RotistSession = {
  id: string;
  title: string;
  pressure: number;
  fatigue: number;
  spacing: "tight" | "steady" | "wide";
  summary: string;
  extractedTasks: SpaceTask[];
};
