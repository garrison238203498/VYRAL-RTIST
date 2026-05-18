import { z } from "zod";

// ─── INTAKE ───────────────────────────────────────────────────────────────

export const SpaceKindEnum = z.enum([
  "creative",
  "school",
  "writing",
  "social",
  "reset",
  "legacy",
  "build",
  "memory",
  "reflection",
]);

export const SpaceAccentEnum = z.enum(["violet", "cyan", "pink", "lime"]);

export const LegacyKindEnum = z.enum([
  "milestone",
  "summary",
  "pattern",
  "session",
  "evolution",
]);

export const IntakeResultSchema = z.object({
  input_read: z.object({
    source_types: z.array(z.string()).describe("Input source types detected, such as typed_text, camera_image, uploaded_image, pdf, text_file."),
    visible_text: z.string().describe("Text or handwriting the model can actually read. If little text is visible, say that directly."),
    file_observations: z.array(z.string()).describe("Concrete observations from uploaded files/images. Do not invent unseen details."),
    confidence: z.number().describe("0 to 1 confidence that the input was read correctly."),
    limitations: z.array(z.string()).describe("Anything uncertain, cropped, blurry, missing, or not readable."),
  }),
  summary: z.object({
    title: z.string().describe("A short, specific 4-7 word title for what was captured."),
    body: z.string().describe("1-3 sentences in plain language. No clichés. No medical or therapy-speak. Reflect the user's actual voice when possible."),
    key_terms: z.array(z.string()).describe("3-6 concrete keywords from the input (people, places, projects, ideas)."),
  }),
  tasks: z
    .array(
      z.object({
        text: z.string().describe("Specific, actionable task. Verb-first. No fluff."),
        due_relative: z
          .string()
          .nullable()
          .describe("Plain-language deadline if present in the input ('Friday', 'tomorrow', 'May 18'). null if absent."),
      })
    )
    .describe("Only extract tasks the user clearly intended. Do not invent."),
  themes: z
    .array(
      z.object({
        name: z.string().describe("1-2 word theme label, lowercase. e.g. 'late-night', 'imu-debug', 'lyric-fragment'."),
        weight: z.number().describe("Relative importance from 0.1 to 1.0 within this single intake."),
      })
    )
    .describe("3-6 themes max. These accumulate across intakes to build the user's affinity profile."),
  suggested_space: z.object({
    mode: z.enum(["use_existing", "create_new"]).describe("'use_existing' if input clearly belongs in one of the user's existing Spaces; 'create_new' otherwise."),
    existing_space_id: z.string().nullable().describe("If mode='use_existing', the id of the matching Space from user_context.spaces. Otherwise null."),
    name: z.string().describe("If creating new: a specific, evocative name (NOT 'Misc' or 'New Space'). If using existing: copy the existing Space name."),
    kind: SpaceKindEnum,
    accent: SpaceAccentEnum,
    reason: z.string().describe("1 sentence explaining why this Space fits — referencing actual evidence in the input."),
  }),
  legacy_candidate: z.object({
    should_save: z.boolean().describe("True only when this captures a real milestone, breakthrough, or pattern worth long-term memory. Default false."),
    title: z.string().nullable(),
    body: z.string().nullable(),
    kind: LegacyKindEnum.nullable(),
  }),
  user_fit: z.object({
    matched_patterns: z.array(z.string()).describe("Specific patterns from user_context that this intake appears to match."),
    personalization_moves: z.array(z.string()).describe("3-5 concrete UX changes Vyral should make for this user from this intake."),
    suggested_next_screen: z.string().describe("The next app area the user is most likely to need: capture, space, session, legacy, me, or home."),
    adaptation_reason: z.string().describe("One concise reason for the suggested UX adaptation."),
  }),
  space_dashboard: z.object({
    primary_label: z.string().describe("Short label for the dashboard card this intake should become."),
    dashboard_cards: z.array(z.object({
      label: z.string(),
      value: z.string(),
      why: z.string(),
    })).describe("2-4 dashboard card facts grounded in the intake."),
  }),
  vibe: z.string().describe("One short line describing the energy of the input ('exhausted but determined', 'late-night flow', 'scrambling before deadline')."),
  visual_prompt: z.string().describe("Prompt for a generated Space visual. No embedded text, no logos, no watermarks."),
});

export type IntakeResult = z.infer<typeof IntakeResultSchema>;

// ─── AFFINITY ─────────────────────────────────────────────────────────────

export const AffinityProfileSchema = z.object({
  archetype: z
    .string()
    .describe("A vivid, specific 3-6 word archetype that captures who this person is becoming. Avoid clichés ('the dreamer', 'the achiever'). Make it specific to the data, like 'the late-night cartographer' or 'the build-then-ship engineer'."),
  signals: z
    .array(
      z.object({
        name: z.string().describe("1-3 word signal label."),
        evidence: z.string().describe("1 sentence pointing at concrete evidence from the user's data."),
      })
    )
    .describe("3-5 signals. Each must reference real data — not invented patterns."),
  resonance_pattern: z
    .string()
    .describe("One paragraph (3-5 sentences) describing the rhythm of this person's work and attention. Honest about what's clear vs. still emerging given the data volume."),
  ideal_collaborator_traits: z
    .array(z.string())
    .describe("3-5 short phrases describing what kind of person would resonate well with this user, based on their actual themes."),
  one_thing_to_build_on: z
    .string()
    .describe("One specific suggestion for the user — what to lean into next, grounded in their data. Not motivational fluff."),
  honesty_note: z
    .string()
    .describe("One short sentence honestly acknowledging the data volume — e.g. 'Built from 12 intakes — early signal, will sharpen.' Or 'Strong pattern — built from 80 intakes over 3 weeks.'"),
});

export type AffinityProfile = z.infer<typeof AffinityProfileSchema>;
