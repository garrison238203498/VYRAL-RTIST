export const spaceKinds = [
  "creative",
  "school",
  "writing",
  "social",
  "reset",
  "legacy",
  "build",
  "memory",
  "reflection",
] as const;

export const accents = ["violet", "cyan", "pink", "lime"] as const;

export const intakeJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "input_read",
    "summary",
    "tasks",
    "themes",
    "suggested_space",
    "legacy_candidate",
    "user_fit",
    "space_dashboard",
    "vibe",
    "visual_prompt",
  ],
  properties: {
    input_read: {
      type: "object",
      additionalProperties: false,
      required: ["source_types", "visible_text", "file_observations", "confidence", "limitations"],
      properties: {
        source_types: { type: "array", items: { type: "string" } },
        visible_text: { type: "string" },
        file_observations: { type: "array", items: { type: "string" } },
        confidence: { type: "number" },
        limitations: { type: "array", items: { type: "string" } },
      },
    },
    summary: {
      type: "object",
      additionalProperties: false,
      required: ["title", "body", "key_terms"],
      properties: {
        title: { type: "string" },
        body: { type: "string" },
        key_terms: { type: "array", items: { type: "string" } },
      },
    },
    tasks: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["text", "due_relative"],
        properties: {
          text: { type: "string" },
          due_relative: { anyOf: [{ type: "string" }, { type: "null" }] },
        },
      },
    },
    themes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "weight"],
        properties: {
          name: { type: "string" },
          weight: { type: "number" },
        },
      },
    },
    suggested_space: {
      type: "object",
      additionalProperties: false,
      required: ["mode", "existing_space_id", "name", "kind", "accent", "reason"],
      properties: {
        mode: { type: "string", enum: ["use_existing", "create_new"] },
        existing_space_id: { anyOf: [{ type: "string" }, { type: "null" }] },
        name: { type: "string" },
        kind: { type: "string", enum: [...spaceKinds] },
        accent: { type: "string", enum: [...accents] },
        reason: { type: "string" },
      },
    },
    legacy_candidate: {
      type: "object",
      additionalProperties: false,
      required: ["should_save", "title", "body", "kind"],
      properties: {
        should_save: { type: "boolean" },
        title: { anyOf: [{ type: "string" }, { type: "null" }] },
        body: { anyOf: [{ type: "string" }, { type: "null" }] },
        kind: { anyOf: [{ type: "string", enum: ["milestone", "summary", "pattern", "session", "evolution"] }, { type: "null" }] },
      },
    },
    user_fit: {
      type: "object",
      additionalProperties: false,
      required: ["matched_patterns", "personalization_moves", "suggested_next_screen", "adaptation_reason"],
      properties: {
        matched_patterns: { type: "array", items: { type: "string" } },
        personalization_moves: { type: "array", items: { type: "string" } },
        suggested_next_screen: { type: "string", enum: ["capture", "space", "session", "legacy", "me", "home"] },
        adaptation_reason: { type: "string" },
      },
    },
    space_dashboard: {
      type: "object",
      additionalProperties: false,
      required: ["primary_label", "dashboard_cards"],
      properties: {
        primary_label: { type: "string" },
        dashboard_cards: {
          type: "array",
          items: {
            type: "object",
            additionalProperties: false,
            required: ["label", "value", "why"],
            properties: {
              label: { type: "string" },
              value: { type: "string" },
              why: { type: "string" },
            },
          },
        },
      },
    },
    vibe: { type: "string" },
    visual_prompt: { type: "string" },
  },
} as const;

export const affinityJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "archetype",
    "signals",
    "resonance_pattern",
    "ideal_collaborator_traits",
    "one_thing_to_build_on",
    "honesty_note",
  ],
  properties: {
    archetype: { type: "string" },
    signals: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "evidence"],
        properties: {
          name: { type: "string" },
          evidence: { type: "string" },
        },
      },
    },
    resonance_pattern: { type: "string" },
    ideal_collaborator_traits: { type: "array", items: { type: "string" } },
    one_thing_to_build_on: { type: "string" },
    honesty_note: { type: "string" },
  },
} as const;
