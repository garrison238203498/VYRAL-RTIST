// First-run seed: gives a brand-new account a believable, lived-in starting state.
// Designed for the kind of teen Vyral is built for — creator, builder, artist, neurodivergent.

import { supabase } from "./supabase";

export async function seedNewAccount(userId: string) {
  // Skip if any spaces already exist for this user
  const existing = await supabase.from("spaces").select("id").eq("user_id", userId).limit(1);
  if (existing.data && existing.data.length > 0) return;

  const now = new Date();
  const minutesAgo = (m: number) => new Date(now.getTime() - m * 60_000).toISOString();
  const daysAgo = (d: number) => new Date(now.getTime() - d * 86_400_000).toISOString();

  // Spaces — diverse, real-teen archetypes
  const { data: spacesData, error: spacesErr } = await supabase
    .from("spaces")
    .insert([
      {
        user_id: userId,
        name: "Late Night Studio",
        kind: "creative",
        accent: "pink",
        pinned: true,
        reason: "Lyric fragments and beat notes that keep landing between 11:40 PM and 1:30 AM.",
        signals: ["14 fragments this week", "3 voice memo refs", "peak 12:48 AM"],
        next_action: "Open Conductor Mode on Hook A",
        last_activity_at: minutesAgo(120),
        evolution: [
          { date: "Apr 14", note: "Created from 4 scattered captures" },
          { date: "Apr 22", note: "Hook Lab merged in" },
        ],
      },
      {
        user_id: userId,
        name: "Build Log",
        kind: "build",
        accent: "lime",
        pinned: true,
        reason: "ESP32 sensor rig, code snippets, debug notes, and a plan for the spring demo.",
        signals: ["6 commits this week", "1 schematic sketch", "demo · May 18"],
        next_action: "Wire IMU pin → GPIO 26",
        last_activity_at: minutesAgo(35),
        evolution: [
          { date: "Mar 30", note: "Created from solo project sprint" },
        ],
      },
      {
        user_id: userId,
        name: "Exam Week Control",
        kind: "school",
        accent: "cyan",
        reason: "Three tests, two ROTIST sessions imported, one assignment flagged urgent.",
        signals: ["bio test · Fri", "chem quiz · Wed", "essay rev · Thu"],
        next_action: "Review 6 Biology cards",
        last_activity_at: minutesAgo(12),
      },
      {
        user_id: userId,
        name: "Lighthouse",
        kind: "memory",
        accent: "violet",
        reason: "A long-term archive for the things you don't want to lose track of — quotes, observations, the small wins your memory holds onto.",
        signals: ["48 entries", "Most recalled: 'discipline is coming back'", "Synced w/ Life & Legacy"],
        next_action: "Tag this week's three sharpest fragments",
        last_activity_at: daysAgo(1),
      },
      {
        user_id: userId,
        name: "Carry the Day",
        kind: "reset",
        accent: "violet",
        status: "suggested",
        reason: "Grip pressure rose for two long sessions and the task list grew without breaks. A pacing layer might help today.",
        signals: ["grip +18%", "tasks +9 in 4h", "last reset 3h ago"],
        next_action: "Try a 12-minute paced reset",
        last_activity_at: minutesAgo(5),
      },
      {
        user_id: userId,
        name: "Group Project Orbit",
        kind: "social",
        accent: "lime",
        reason: "Renewable-energy debate with Maya and Jordan. Outline due Friday.",
        signals: ["3 collaborators", "5 shared tasks", "deadline · Fri"],
        next_action: "Send outline draft to Maya",
        last_activity_at: minutesAgo(60 * 5),
      },
    ] as any)
    .select();

  if (spacesErr || !spacesData) return;

  const byName = (n: string) => spacesData.find((s: any) => s.name === n)?.id;
  const studio = byName("Late Night Studio");
  const build = byName("Build Log");
  const exam = byName("Exam Week Control");
  const orbit = byName("Group Project Orbit");
  const lighthouse = byName("Lighthouse");

  // Notes — actual content, not lorem
  await supabase.from("notes").insert([
    { user_id: userId, space_id: studio, text: "halflight stretches under the kitchen door", handwritten: true, source: "rotist", captured_at: minutesAgo(60 * 13) },
    { user_id: userId, space_id: studio, text: "static where the chorus should be", handwritten: true, source: "rotist", captured_at: minutesAgo(60 * 12) },
    { user_id: userId, space_id: studio, text: "the silence is doing most of the work", handwritten: true, source: "rotist", captured_at: minutesAgo(60 * 11) },
    { user_id: userId, space_id: studio, text: "voice memo · Hook A · 0:42", source: "voice", captured_at: minutesAgo(60 * 24) },
    { user_id: userId, space_id: build, text: "IMU mount: 3-point contact, M2 screws — print the bracket at 0.16", source: "quick", captured_at: minutesAgo(40) },
    { user_id: userId, space_id: build, text: "BLE pairing dropped after deep sleep wake — debounce HF interrupt", handwritten: true, source: "rotist", captured_at: minutesAgo(70) },
    { user_id: userId, space_id: build, text: "stroke FFT window 64 → 128 made the gesture classifier 6% better", source: "quick", captured_at: minutesAgo(180) },
    { user_id: userId, space_id: exam, text: "Mitosis: prophase, metaphase, anaphase, telophase", handwritten: true, source: "rotist", captured_at: minutesAgo(60 * 4) },
    { user_id: userId, space_id: exam, text: "Spindle fibers pull chromatids apart in anaphase", handwritten: true, source: "rotist", captured_at: minutesAgo(60 * 4) },
    { user_id: userId, space_id: lighthouse, text: "Discipline isn't intensity. It's coming back.", source: "quick", captured_at: daysAgo(35) },
    { user_id: userId, space_id: lighthouse, text: "The weeks I show up quietly are the ones that compound.", source: "quick", captured_at: daysAgo(18) },
  ] as any);

  // Tasks — concrete, with due dates
  await supabase.from("tasks").insert([
    { user_id: userId, space_id: exam, text: "Review 6 Biology cards", due_at: now.toISOString(), done: false },
    { user_id: userId, space_id: orbit, text: "Send outline draft to Maya", due_at: now.toISOString(), done: false },
    { user_id: userId, space_id: studio, text: "Cut Hook A intro by 4 bars", done: false },
    { user_id: userId, space_id: build, text: "Solder GPIO26 → IMU SDA", due_at: new Date(now.getTime() + 2 * 86_400_000).toISOString(), done: false },
    { user_id: userId, space_id: studio, text: "Capture one lyric idea today", done: true, done_at: minutesAgo(120) },
  ] as any);

  // Sessions — ROTIST writing sessions with transcripts
  await supabase.from("sessions").insert([
    {
      user_id: userId,
      space_id: exam,
      title: "Biology Notes",
      started_at: minutesAgo(60 * 4),
      ended_at: minutesAgo(60 * 4 - 42),
      duration_min: 42,
      strokes: 812,
      word_count: 218,
      hesitation_clusters: 3,
      grip_pressure_change: 18,
      confidence_drop: "Diagram region",
      fatigue_score: 0.62,
      mood_delta: -0.12,
      summary_lifts: 1,
      tasks_extracted: 4,
      review_cards_suggested: 2,
      transcript: [
        "Mitosis — a single cell divides into two genetically identical cells.",
        "Phases: prophase, metaphase, anaphase, telophase.",
        "Spindle fibers pull chromatids apart during anaphase.",
        "Centromere holds sister chromatids together until anaphase.",
        "Compare to meiosis — meiosis creates four non-identical cells.",
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
      user_id: userId,
      space_id: studio,
      title: "Lyric Fragments — 'Halflight'",
      started_at: minutesAgo(60 * 13),
      duration_min: 31,
      strokes: 460,
      word_count: 96,
      hesitation_clusters: 2,
      grip_pressure_change: 6,
      fatigue_score: 0.38,
      mood_delta: 0.34,
      transcript: [
        "halflight stretches under the kitchen door",
        "static where the chorus should be",
        "we keep the lights low for a reason",
        "the silence is doing most of the work",
      ],
      summary: {
        title: "Halflight · fragment cluster",
        body: "Four lyric fragments captured between 12:48 and 1:39 AM. Same hand, same tempo. Vyral grouped them.",
        keyTerms: ["halflight", "static", "silence", "low light"],
        questions: [],
      },
    },
    {
      user_id: userId,
      space_id: build,
      title: "Build Log — IMU debug",
      started_at: minutesAgo(180),
      duration_min: 22,
      strokes: 410,
      word_count: 140,
      hesitation_clusters: 1,
      grip_pressure_change: 4,
      fatigue_score: 0.28,
      mood_delta: 0.22,
      transcript: [
        "FFT window changed 64 → 128.",
        "Classifier accuracy +6%, latency +9 ms.",
        "Acceptable for v0.2.",
        "TODO: add gesture cancel on grip drop.",
      ],
      summary: {
        title: "IMU · v0.2 notes",
        body: "Doubling FFT window improved gesture classifier accuracy at the cost of small latency.",
        keyTerms: ["FFT", "gesture", "classifier"],
        questions: [],
      },
    },
  ] as any);

  // Goals — the user-set targets the celebration animation triggers on
  await supabase.from("goals").insert([
    {
      user_id: userId,
      space_id: studio,
      title: "Draft 'Halflight' — full song",
      kind: "draft_words",
      target_value: 320,
      current_value: 96,
      unit: "words",
      why: "I keep half-finishing this. I want one full draft I can record.",
    },
    {
      user_id: userId,
      space_id: exam,
      title: "Bio review — 6 cards before Friday",
      kind: "task_count",
      target_value: 6,
      current_value: 3,
      unit: "cards",
      deadline: new Date(now.getTime() + 3 * 86_400_000).toISOString().slice(0, 10),
      why: "Friday's test. I do better with cards than re-reading.",
    },
    {
      user_id: userId,
      space_id: build,
      title: "ROTIST v0.3 firmware — 4 study sessions logged",
      kind: "session_count",
      target_value: 4,
      current_value: 1,
      unit: "sessions",
      why: "Need real data before the spring demo.",
    },
  ] as any);

  // Life & Legacy
  await supabase.from("life_legacy").insert([
    {
      user_id: userId,
      space_id: exam,
      kind: "session",
      title: "Biology Notes became 4 tasks and 2 review cards",
      body: "42 minutes, 812 strokes, 3 hesitation clusters. Linked to Exam Week Control.",
      accent: "cyan",
      occurred_at: minutesAgo(60 * 3),
    },
    {
      user_id: userId,
      space_id: studio,
      kind: "summary",
      title: "Late Night Studio · most active Space this week",
      body: "14 fragments, 3 voice memos, 2 ROTIST sessions. Peaks 11:40 PM – 1:20 AM.",
      accent: "pink",
      occurred_at: minutesAgo(60 * 6),
    },
    {
      user_id: userId,
      space_id: build,
      kind: "milestone",
      title: "Gesture classifier hit 92% on the validation set",
      body: "After the FFT window change. First metric Build Log has tracked end-to-end.",
      accent: "lime",
      occurred_at: daysAgo(2),
    },
    {
      user_id: userId,
      space_id: lighthouse,
      kind: "pattern",
      title: "Recurring theme across reflections: discipline as return",
      body: "9 reflections in the last 90 days circle the same idea — that consistency is showing up after the gap, not avoiding the gap.",
      accent: "violet",
      occurred_at: daysAgo(5),
    },
  ] as any);

  // AI insights
  await supabase.from("ai_insights").insert([
    {
      user_id: userId,
      tone: "supportive",
      title: "Your grip pressure rose during the last 12 minutes",
      body: "Try guided layout, or take a 2-minute reset. You control what gets saved.",
      cta_label: "Try guided layout",
      cta_secondary: "Not now",
    },
    {
      user_id: userId,
      tone: "creative",
      title: "This fragment overlaps two earlier ones in Late Night Studio",
      body: "Want me to expand it as a hook?",
      cta_label: "Expand as hook",
      cta_secondary: "Keep as note",
    },
  ] as any);

  // Pen state
  await supabase.from("pen_state").upsert({
    user_id: userId,
    serial: "ROTIST-A047-9F",
    battery: 76,
    ink_remaining_percent: 41,
    ink_predicted_days: 6,
    refill_id: "ROT-INK-FINE-01",
    haptic: 60,
    tip_glow: "violet",
    thermal_avg_c: 31.6,
    echo_grip_auth: "matched",
    pressure_signature_lock: "active",
    cap_orientation: "horizontal-rest",
    knock_shortcuts: [
      { pattern: "·· ·", action: "Summary Lift" },
      { pattern: "··", action: "New task" },
      { pattern: "···", action: "Conductor Mode" },
    ],
  } as any);

  // Profile fill-in
  await supabase
    .from("profiles")
    .update({
      pattern: "Late-night creativity + a builder's pace",
      energy: "medium-high",
      streak_days: 11,
      weekly_focus_blocks: 14,
      rotist_serial: "ROTIST-A047-9F",
    })
    .eq("id", userId);
}
