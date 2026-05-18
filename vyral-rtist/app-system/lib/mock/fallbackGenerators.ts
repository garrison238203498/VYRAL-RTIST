import { generateSpaceImage } from "../ai/imageProvider";
import { sanitizeAIText } from "../ai/textSanitizer";
import type { AnimationTheme, GeneratedSpace, SpaceMakerInput, SpaceTask } from "../ai/types";

type PatternProfile = {
  keywords: string[];
  type: string;
  names: string[];
  description: string;
  patterns: string[];
  tasks: SpaceTask[];
  actions: string[];
  theme: AnimationTheme;
  visual: string;
};

const profiles: PatternProfile[] = [
  {
    keywords: ["biology", "test", "study", "exam", "quiz", "homework", "notes"],
    type: "school_focus",
    names: ["Exam Week Control", "Biology Sprint Room", "Study Signal Deck"],
    description: "A focused Space for upcoming school pressure, notes, review tasks, and test prep.",
    patterns: ["upcoming deadline", "study material uploaded", "review needed", "task urgency"],
    tasks: [
      { title: "Review key terms", priority: "high", estimatedMinutes: 20 },
      { title: "Make 10 practice questions", priority: "medium", estimatedMinutes: 15 },
      { title: "Sort messy notes into three sections", priority: "medium", estimatedMinutes: 12 },
    ],
    actions: ["Start a 25-minute study sprint", "Generate review questions", "Save summary to Life & Legacy"],
    theme: "space_bloom",
    visual: "A futuristic neon study control room with floating biology diagrams, organized cards, and calm blue-violet lighting.",
  },
  {
    keywords: ["lyrics", "song", "beat", "verse", "hook", "music", "melody", "studio"],
    type: "creative_music",
    names: ["Late Night Studio", "Hook Lab", "Blue Hour Drafts"],
    description: "A creative Space for lyric fragments, beat ideas, melodies, and late-night drafts.",
    patterns: ["scattered creative fragments", "repeat theme forming", "music sketch ready"],
    tasks: [
      { title: "Choose one hook direction", priority: "high", estimatedMinutes: 10 },
      { title: "Group lyrics into verse and chorus piles", priority: "medium", estimatedMinutes: 18 },
    ],
    actions: ["Open Conductor Mode", "Save the strongest line", "Turn fragments into a session board"],
    theme: "rotist_trace",
    visual: "A cinematic neon studio desk with floating lyric fragments, subtle waveform light, and violet-blue atmosphere.",
  },
  {
    keywords: ["overwhelmed", "tired", "reset", "breathe", "stress", "too much", "anxious", "burned"],
    type: "reset_reflection",
    names: ["Reset Mode", "Quiet Return", "One Step Room"],
    description: "A calm Space for overload, reflection, recovery, and one clear next step.",
    patterns: ["task overload", "reset needed", "energy drop", "reduce friction"],
    tasks: [
      { title: "Pick one visible next action", priority: "high", estimatedMinutes: 5 },
      { title: "Move non-urgent tasks out of today", priority: "medium", estimatedMinutes: 8 },
    ],
    actions: ["Start a 60-second DIVE", "Create one next action", "Save reset to Life & Legacy"],
    theme: "koi_ripple",
    visual: "A calm neon koi pond with soft cyan and pink ripples, dark glass, and one clear glowing action card.",
  },
  {
    keywords: ["pen", "handwriting", "stroke", "pressure", "spacing", "rotist", "written", "write"],
    type: "rotist_trace",
    names: ["Trace Lab", "Stroke Intelligence", "Handwriting Signal Room"],
    description: "A ROTIST Space for handwriting sessions, pressure patterns, summaries, and writing support.",
    patterns: ["writing rhythm signal", "pressure change", "spatial gesture", "notes ready for structure"],
    tasks: [
      { title: "Review handwriting summary", priority: "medium", estimatedMinutes: 8 },
      { title: "Convert circled section into tasks", priority: "high", estimatedMinutes: 10 },
    ],
    actions: ["Open confidence heatmap", "Send notes to VYRAL", "Try Summary Lift"],
    theme: "rotist_trace",
    visual: "A smart pen trace visualization with graphite glass, pressure waveforms, handwriting heatmap, and violet-lime glow.",
  },
  {
    keywords: ["project", "group", "presentation", "team", "slides", "meeting"],
    type: "collaboration",
    names: ["Project Orbit", "Group Project Orbit", "Presentation Dock"],
    description: "A collaboration Space for project materials, shared responsibilities, deadlines, and presentation prep.",
    patterns: ["multiple people involved", "deadline coordination", "materials need grouping"],
    tasks: [
      { title: "List each person's responsibility", priority: "high", estimatedMinutes: 12 },
      { title: "Build presentation outline", priority: "medium", estimatedMinutes: 20 },
    ],
    actions: ["Make a role map", "Create a shared task list", "Save project milestone"],
    theme: "space_bloom",
    visual: "A clean futuristic collaboration orbit with floating project cards, cyan lines, and organized presentation panels.",
  },
  {
    keywords: ["run", "track", "workout", "practice", "training", "race"],
    type: "training_growth",
    names: ["Track Season Engine", "Practice Loop", "Growth Pace"],
    description: "A training Space for routines, workouts, recovery notes, and progress signals.",
    patterns: ["routine forming", "training progression", "recovery timing"],
    tasks: [
      { title: "Log last practice notes", priority: "medium", estimatedMinutes: 6 },
      { title: "Choose tomorrow's recovery action", priority: "medium", estimatedMinutes: 5 },
    ],
    actions: ["Build a weekly rhythm", "Save progress to Life & Legacy", "Add recovery checkpoint"],
    theme: "legacy_memory",
    visual: "A premium dark training dashboard with subtle lime paths, progress arcs, and calm recovery markers.",
  },
];

export async function fallbackGenerateSpace(input: SpaceMakerInput): Promise<GeneratedSpace> {
  const signalText = [
    input.text,
    ...input.files.map((file) => `${file.name} ${file.extractedText}`),
    input.koiReflection || "",
    input.rotistSessionSummary || "",
  ].join(" ").toLowerCase();
  const profile = chooseProfile(signalText);
  const variantIndex = Math.abs(hash(signalText)) % profile.names.length;
  const spaceName = profile.names[variantIndex];
  const cleanInput = sanitizeAIText(input.text);
  const relatedFiles = input.files.map((file) => file.name);
  const sourceSignals = buildSignals(cleanInput, relatedFiles, input);
  const visualPrompt = profile.visual;
  const visual = await generateSpaceImage(visualPrompt, { spaceType: profile.type });

  return {
    id: `space-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    spaceName,
    spaceType: profile.type,
    description: profile.description,
    reason: buildReason(spaceName, profile, sourceSignals),
    detectedPatterns: profile.patterns,
    sourceSignals,
    tasks: profile.tasks,
    nextActions: profile.actions,
    relatedFiles,
    relatedRotistSessions: input.rotistSessionSummary ? ["Current ROTIST writing session"] : [],
    relatedKoiSessions: input.koiReflection ? ["Latest KOI DIVE reflection"] : [],
    lifeLegacyEntry: `Created ${spaceName} from ${sourceSignals.slice(0, 2).join(" and ")}.`,
    visualPrompt,
    animationTheme: profile.theme,
    visual,
    createdAt: new Date().toISOString(),
  };
}

export function classifyFile(name: string, type = "") {
  const lower = `${name} ${type}`.toLowerCase();
  if (lower.includes("bio") || lower.includes("study") || lower.includes("exam")) {
    return "Detected study material with key terms, review pressure, and upcoming test signals.";
  }
  if (lower.includes("lyric") || lower.includes("song") || lower.includes("beat")) {
    return "Detected creative fragments, possible hook ideas, and draft material.";
  }
  if (lower.includes("note") || lower.includes("handwriting") || lower.includes("scan")) {
    return "Detected note material that can become summaries, tasks, and a writing Space.";
  }
  if (lower.includes("project") || lower.includes("slides")) {
    return "Detected project material with roles, presentation prep, and coordination needs.";
  }
  return "Detected uploaded material ready for summary, task extraction, and Space grouping.";
}

function chooseProfile(text: string) {
  let best = profiles[0];
  let bestScore = -1;
  for (const profile of profiles) {
    const score = profile.keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
    if (score > bestScore) {
      best = profile;
      bestScore = score;
    }
  }
  return bestScore <= 0 ? profiles[Math.abs(hash(text || "default")) % profiles.length] : best;
}

function buildSignals(text: string, files: string[], input: SpaceMakerInput) {
  const signals = [];
  if (text) signals.push(text.length > 58 ? `${text.slice(0, 58)}...` : text);
  signals.push(...files);
  if (input.rotistSessionSummary) signals.push("ROTIST writing session");
  if (input.koiReflection) signals.push("KOI reflection");
  if (signals.length === 0) signals.push("quick capture");
  return signals.slice(0, 5);
}

function buildReason(spaceName: string, profile: PatternProfile, signals: string[]) {
  return `${spaceName} exists because ${signals.join(", ")} point toward ${profile.patterns.slice(0, 3).join(", ")}.`;
}

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i += 1) {
    h = Math.imul(31, h) + value.charCodeAt(i) | 0;
  }
  return h;
}
