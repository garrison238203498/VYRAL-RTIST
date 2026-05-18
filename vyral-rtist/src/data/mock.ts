// Mock data for the Vyral + ROTIST mobile prototype.
// Designed to feel like a real running system — every entity references the others.

export type SpaceKind =
  | "creative"
  | "school"
  | "writing"
  | "social"
  | "reset"
  | "legacy";

export type SpaceNote = {
  id: string;
  text: string;
  handwritten?: boolean;
  capturedAt: string;
  source: "rotist" | "quick" | "voice";
};

export type SpaceTask = {
  id: string;
  text: string;
  due?: string;
  done: boolean;
};

export type Space = {
  id: string;
  name: string;
  kind: SpaceKind;
  status: "active" | "suggested" | "archived";
  reason: string;
  signals: string[];
  linkedSessions: string[];
  pinned?: boolean;
  lastActivity: string;
  itemCount: { notes: number; tasks: number; sessions: number; people: number };
  nextAction: string;
  accent: "violet" | "cyan" | "pink" | "lime";
  evolution: { date: string; note: string }[];
  notes: SpaceNote[];
  tasks: SpaceTask[];
  people?: string[];
};

export type RotistSession = {
  id: string;
  title: string;
  date: string;
  durationMin: number;
  strokes: number;
  hesitationClusters: number;
  gripPressureChange: number;
  confidenceDrop?: string;
  summaryLifts: number;
  tasksExtracted: number;
  reviewCardsSuggested: number;
  fatigueScore: number;
  moodDelta: number;
  spaceId?: string;
  transcript: string[];
  summary: { title: string; body: string; keyTerms: string[]; questions: string[] };
};

export type LifeLegacyEntry = {
  id: string;
  date: string;
  kind: "milestone" | "summary" | "pattern" | "session" | "evolution";
  title: string;
  body: string;
  spaceId?: string;
  accent: "violet" | "cyan" | "pink" | "lime";
};

export type AIInsight = {
  id: string;
  tone: "supportive" | "creative" | "study" | "system";
  title: string;
  body: string;
  cta?: { label: string; secondary?: string };
};

export type SpaceSuggestion = {
  id: string;
  type: "create" | "merge" | "split" | "archive";
  title: string;
  reason: string;
  actions: string[];
  related: string[];
};

export const user = {
  name: "Garrison",
  initials: "G",
  energy: "medium-high" as const,
  pattern: "Late-night creativity + exam pressure",
  lastSession: "Biology Notes",
  recentCreative: "Lyric fragments",
  pendingSuggestion: "Exam Week Control",
  streak: 11,
  weeklyFocusBlocks: 14,
  rotistSerial: "ROTIST-A047-9F",
};

export const spaces: Space[] = [
  {
    id: "sp-late-night",
    name: "Late Night Studio",
    kind: "creative",
    status: "active",
    reason:
      "Generated from repeated lyric fragments, music concepts, and late-night quick captures.",
    signals: [
      "14 fragments this week",
      "3 voice-memo references",
      "Activity peak 11:40 PM",
    ],
    linkedSessions: ["rs-lyrics-04", "rs-lyrics-03"],
    pinned: true,
    lastActivity: "2h ago",
    itemCount: { notes: 22, tasks: 4, sessions: 6, people: 2 },
    nextAction: "Open Conductor Mode on Hook A",
    accent: "pink",
    evolution: [
      { date: "Apr 14", note: "Created from 4 scattered captures" },
      { date: "Apr 22", note: "Hook Lab merged in" },
      { date: "May 06", note: "Voice memo Lyrics-07 imported" },
    ],
    notes: [
      { id: "n1", text: "halflight stretches under the kitchen door", handwritten: true, capturedAt: "12:48 AM", source: "rotist" },
      { id: "n2", text: "static where the chorus should be", handwritten: true, capturedAt: "1:12 AM", source: "rotist" },
      { id: "n3", text: "the silence is doing most of the work", handwritten: true, capturedAt: "2:26 AM", source: "rotist" },
      { id: "n4", text: "voice memo · Hook A · 0:42", capturedAt: "Yesterday", source: "voice" },
      { id: "n5", text: "we keep the lights low for a reason", capturedAt: "Today", source: "quick" },
    ],
    tasks: [
      { id: "t1", text: "Cut Hook A intro by 4 bars", done: false },
      { id: "t2", text: "Record verse 2 demo", done: false },
      { id: "t3", text: "Finish bridge lyric", done: true },
      { id: "t4", text: "Send draft to Maya", done: false },
    ],
    people: ["Maya"],
  },
  {
    id: "sp-exam-week",
    name: "Exam Week Control",
    kind: "school",
    status: "active",
    reason:
      "Generated from upcoming tests, ROTIST study notes, and task urgency.",
    signals: ["3 upcoming tests", "2 ROTIST sessions", "1 urgent assignment"],
    linkedSessions: ["rs-bio-01", "rs-chem-02"],
    pinned: true,
    lastActivity: "12m ago",
    itemCount: { notes: 18, tasks: 11, sessions: 2, people: 3 },
    nextAction: "Review 6 cards from Biology Notes",
    accent: "cyan",
    evolution: [
      { date: "May 04", note: "Created after 3 deadlines added" },
      { date: "May 06", note: "Biology Notes session imported" },
    ],
    notes: [
      { id: "n6", text: "Mitosis: prophase, metaphase, anaphase, telophase", handwritten: true, capturedAt: "Today 4:42 PM", source: "rotist" },
      { id: "n7", text: "Spindle fibers pull chromatids apart in anaphase", handwritten: true, capturedAt: "Today 4:51 PM", source: "rotist" },
      { id: "n8", text: "Reaction maps: combustion, synthesis, decomp", handwritten: true, capturedAt: "Yesterday", source: "rotist" },
    ],
    tasks: [
      { id: "t5", text: "Review 6 Biology cards", due: "Today", done: false },
      { id: "t6", text: "Chemistry diagram practice", due: "Wed", done: false },
      { id: "t7", text: "English reflection draft", due: "Thu", done: false },
      { id: "t8", text: "Biology test prep — 1 hour", due: "Fri", done: false },
      { id: "t9", text: "Re-read Mitosis chapter", done: true },
    ],
    people: ["Mr. Alvarez", "Maya", "Jordan"],
  },
  {
    id: "sp-trace-lab",
    name: "Trace Lab",
    kind: "writing",
    status: "active",
    reason:
      "Generated from ROTIST writing sessions, handwriting insights, and spatial gestures.",
    signals: ["12 sessions analyzed", "Confidence stabilizing", "4 gestures saved"],
    linkedSessions: ["rs-bio-01", "rs-lyrics-04", "rs-essay-02"],
    lastActivity: "Yesterday",
    itemCount: { notes: 9, tasks: 1, sessions: 12, people: 0 },
    nextAction: "Compare confidence vs. last week",
    accent: "violet",
    evolution: [
      { date: "Mar 02", note: "Created from first 3 sessions" },
      { date: "Apr 17", note: "Guided layout improved consistency" },
    ],
    notes: [
      { id: "n9", text: "Guided layout dropped pressure 11%", capturedAt: "Apr 17", source: "quick" },
      { id: "n10", text: "Confidence heatmap covers wider area now", capturedAt: "May 02", source: "quick" },
    ],
    tasks: [{ id: "t10", text: "Recalibrate grip profile", done: false }],
  },
  {
    id: "sp-group-orbit",
    name: "Group Project Orbit",
    kind: "social",
    status: "active",
    reason: "Generated from shared tasks, collaboration notes, and group deadlines.",
    signals: ["3 collaborators", "5 shared tasks", "Deadline Friday"],
    linkedSessions: [],
    lastActivity: "Today",
    itemCount: { notes: 7, tasks: 5, sessions: 0, people: 3 },
    nextAction: "Send outline draft to Maya",
    accent: "lime",
    evolution: [
      { date: "Apr 28", note: "Created from shared task pattern" },
      { date: "May 02", note: "Outline submitted milestone" },
    ],
    notes: [
      { id: "n11", text: "Project: Renewable energy debate", capturedAt: "Apr 28", source: "quick" },
      { id: "n12", text: "Maya owns intro · Jordan owns counter-arg", capturedAt: "May 01", source: "quick" },
    ],
    tasks: [
      { id: "t11", text: "Send outline draft to Maya", due: "Today", done: false },
      { id: "t12", text: "Review Jordan's counter-arg", due: "Tomorrow", done: false },
      { id: "t13", text: "Group sync · Thursday 4 PM", done: false },
    ],
    people: ["Maya", "Jordan", "Sam"],
  },
  {
    id: "sp-reset-mode",
    name: "Reset Mode",
    kind: "reset",
    status: "suggested",
    reason: "Your writing pressure increased during two long sessions and your task list grew without breaks.",
    signals: ["Grip +18%", "Tasks +9 in 4h", "Last break 3h ago"],
    linkedSessions: ["rs-bio-01"],
    lastActivity: "—",
    itemCount: { notes: 0, tasks: 0, sessions: 1, people: 0 },
    nextAction: "Start a 12-min paced reset",
    accent: "violet",
    evolution: [],
    notes: [],
    tasks: [],
  },
  {
    id: "sp-legacy",
    name: "Legacy Thread",
    kind: "legacy",
    status: "active",
    reason: "Long-running reflection Space — collects milestones, repeated themes, and personal evolution.",
    signals: ["9 reflections in 3 months", "Theme: discipline", "2 long-form journals"],
    linkedSessions: ["rs-essay-02"],
    lastActivity: "3d ago",
    itemCount: { notes: 12, tasks: 0, sessions: 2, people: 0 },
    nextAction: "Write a short reflection on this week",
    accent: "violet",
    evolution: [
      { date: "Feb 10", note: "First reflection added" },
      { date: "Apr 03", note: "Theme detected: discipline" },
    ],
    notes: [
      { id: "n13", text: "Discipline isn't intensity. It's coming back.", capturedAt: "Apr 03", source: "quick" },
      { id: "n14", text: "The weeks I show up quietly are the ones that compound.", capturedAt: "Apr 21", source: "quick" },
    ],
    tasks: [],
  },
];

export const archivedSpaces: Space[] = [
  {
    id: "sp-track",
    name: "Track Season Engine",
    kind: "social",
    status: "archived",
    reason: "Track season ended — archived to Life & Legacy.",
    signals: ["Goal hit: sub 5:10"],
    linkedSessions: [],
    lastActivity: "21d ago",
    itemCount: { notes: 14, tasks: 0, sessions: 0, people: 4 },
    nextAction: "View archive",
    accent: "lime",
    evolution: [
      { date: "Feb 22", note: "Created at start of season" },
      { date: "Apr 18", note: "Goal hit, marked milestone" },
    ],
    notes: [],
    tasks: [],
  },
];

export const suggestions: SpaceSuggestion[] = [
  {
    id: "sg-create-exam",
    type: "create",
    title: "New Space: Exam Week Control",
    reason: "3 upcoming tests, 2 ROTIST sessions imported, 1 urgent task.",
    actions: ["Create Space", "Rename", "Dismiss"],
    related: ["3 deadlines", "2 sessions", "1 urgent"],
  },
  {
    id: "sg-merge-studio",
    type: "merge",
    title: "Merge Late Night Studio + Hook Lab",
    reason: "Both contain lyric drafts and ROTIST sessions from the same time window.",
    actions: ["Merge", "Keep separate", "Rename both"],
    related: ["Time overlap 88%"],
  },
];

export const sessions: RotistSession[] = [
  {
    id: "rs-bio-01",
    title: "Biology Notes",
    date: "Today, 4:42 PM",
    durationMin: 42,
    strokes: 812,
    hesitationClusters: 3,
    gripPressureChange: 18,
    confidenceDrop: "Diagram region",
    summaryLifts: 1,
    tasksExtracted: 4,
    reviewCardsSuggested: 2,
    fatigueScore: 0.62,
    moodDelta: -0.12,
    spaceId: "sp-exam-week",
    transcript: [
      "Mitosis — a single cell divides into two genetically identical cells.",
      "Phases: prophase, metaphase, anaphase, telophase.",
      "Spindle fibers pull chromatids apart during anaphase.",
      "Centromere holds sister chromatids together until anaphase.",
      "Compare to meiosis — meiosis creates 4 non-identical cells.",
    ],
    summary: {
      title: "Mitosis · key phases",
      body: "A single cell divides into two genetically identical cells. Phases: prophase, metaphase, anaphase, telophase.",
      keyTerms: ["chromatid", "spindle", "anaphase", "centromere"],
      questions: [
        "What separates chromatids during anaphase?",
        "Which phase aligns chromosomes at the equator?",
      ],
    },
  },
  {
    id: "rs-lyrics-04",
    title: "Lyric Fragments — 'Halflight'",
    date: "Last night, 12:48 AM",
    durationMin: 31,
    strokes: 460,
    hesitationClusters: 2,
    gripPressureChange: 6,
    summaryLifts: 0,
    tasksExtracted: 0,
    reviewCardsSuggested: 0,
    fatigueScore: 0.38,
    moodDelta: 0.34,
    spaceId: "sp-late-night",
    transcript: [
      "halflight stretches under the kitchen door",
      "static where the chorus should be",
      "we keep the lights low for a reason",
      "the silence is doing most of the work",
    ],
    summary: {
      title: "Halflight · fragment cluster",
      body: "4 lyric fragments captured 12:48–1:39 AM. Same hand, same tempo. Vyral grouped them.",
      keyTerms: ["halflight", "static", "silence", "low light"],
      questions: [],
    },
  },
  {
    id: "rs-chem-02",
    title: "Chemistry — Reaction Maps",
    date: "Yesterday, 6:10 PM",
    durationMin: 28,
    strokes: 540,
    hesitationClusters: 1,
    gripPressureChange: 9,
    summaryLifts: 2,
    tasksExtracted: 3,
    reviewCardsSuggested: 1,
    fatigueScore: 0.41,
    moodDelta: 0.08,
    spaceId: "sp-exam-week",
    transcript: [
      "Combustion reactions release energy.",
      "Synthesis: A + B → AB.",
      "Decomposition: AB → A + B.",
    ],
    summary: {
      title: "Reaction types · summary",
      body: "Combustion releases energy. Synthesis combines reactants. Decomposition splits a compound.",
      keyTerms: ["combustion", "synthesis", "decomposition"],
      questions: ["Give an everyday example of synthesis."],
    },
  },
];

export const insights: AIInsight[] = [
  {
    id: "ai-1",
    tone: "supportive",
    title: "Your grip pressure rose during the last 12 minutes",
    body: "Try guided layout, or take a 2-minute reset. You control what gets saved.",
    cta: { label: "Try guided layout", secondary: "Not now" },
  },
  {
    id: "ai-2",
    tone: "study",
    title: "Three notes were grouped into a Space",
    body: "Vyral noticed the same biology terms across three captures.",
    cta: { label: "Open Space", secondary: "Dismiss" },
  },
  {
    id: "ai-3",
    tone: "creative",
    title: "This fragment overlaps two earlier ones in Late Night Studio",
    body: "Want me to expand it as a hook?",
    cta: { label: "Expand as hook", secondary: "Keep as note" },
  },
];

export const lifeLegacy: LifeLegacyEntry[] = [
  {
    id: "ll-1",
    date: "Today",
    kind: "session",
    title: "Biology Notes became 4 tasks and 2 review cards",
    body: "42 minutes, 812 strokes, 3 hesitation clusters. Auto-linked to Exam Week Control.",
    spaceId: "sp-exam-week",
    accent: "cyan",
  },
  {
    id: "ll-2",
    date: "Today",
    kind: "summary",
    title: "Late Night Studio · most active Space this week",
    body: "14 fragments, 3 voice memos, 2 ROTIST sessions. Peaks 11:40 PM – 1:20 AM.",
    spaceId: "sp-late-night",
    accent: "pink",
  },
  {
    id: "ll-3",
    date: "Yesterday",
    kind: "pattern",
    title: "Writing pressure stabilized after guided layout",
    body: "Pressure dropped 11% over 4 sessions. Confidence heatmap covers a wider area.",
    spaceId: "sp-trace-lab",
    accent: "violet",
  },
  {
    id: "ll-4",
    date: "May 6",
    kind: "milestone",
    title: "Exam Week Control created from 2 sessions + 3 deadlines",
    body: "First Space generated entirely from ROTIST signals plus calendar items.",
    spaceId: "sp-exam-week",
    accent: "cyan",
  },
  {
    id: "ll-5",
    date: "May 4",
    kind: "milestone",
    title: "First completed song draft — Halflight v1",
    body: "4 verses, 2 hooks, 1 bridge. Created from 11 lyric fragments.",
    spaceId: "sp-late-night",
    accent: "pink",
  },
  {
    id: "ll-6",
    date: "Apr 28",
    kind: "summary",
    title: "5 focus blocks completed in Exam Week Control",
    body: "Average 24 minutes. Most consistent: 5–6 PM.",
    spaceId: "sp-exam-week",
    accent: "cyan",
  },
  {
    id: "ll-7",
    date: "Apr 17",
    kind: "evolution",
    title: "Late Night Studio absorbed Hook Lab",
    body: "88% time overlap and shared tag set. Merge approved by you.",
    spaceId: "sp-late-night",
    accent: "pink",
  },
];

export const todayFocus = [
  { id: "tf-1", text: "Review 6 Biology cards", space: "sp-exam-week", done: false },
  { id: "tf-2", text: "Outline draft → Maya", space: "sp-group-orbit", done: false },
  { id: "tf-3", text: "Capture one lyric idea", space: "sp-late-night", done: true },
];

export const hardware = {
  battery: 76,
  inkRemainingPercent: 41,
  inkPredictedDays: 6,
  refillId: "ROT-INK-FINE-01",
  haptic: 60,
  tipGlow: "violet",
  scratchPrintCalibrated: true,
  thermalAvgC: 31.6,
  echoGripAuth: "matched",
  pressureSignatureLock: "active",
  capOrientation: "horizontal-rest",
  sleepState: "ready",
  knockShortcuts: [
    { pattern: "·· ·", action: "Summary Lift" },
    { pattern: "··", action: "New task" },
    { pattern: "···", action: "Conductor Mode" },
  ],
};

export const accessibility = {
  spaceAutomationLevel: 2,
  hapticIntensity: 60,
  guidedLayout: true,
  slowReadPacing: 1.0,
  dyslexiaFont: false,
  textSpacing: 1.1,
  reducedMotion: false,
  privacyShareInsights: true,
  storeMoodSignals: false,
  aiNamingControl: "Suggest, I confirm",
  insightSensitivity: 2,
};

export const conductorState = {
  bpm: 84,
  bpmDelta: 12,
  intensity: 0.78,
  loop: "Hook A · 4 bars",
  lastGesture: "rising arc",
  duration: "1:42",
};

export const findSpace = (id?: string) => spaces.find((s) => s.id === id) ?? archivedSpaces.find((s) => s.id === id);
export const findSession = (id?: string) => sessions.find((s) => s.id === id);
