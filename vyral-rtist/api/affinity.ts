// Vercel serverless function: POST /api/affinity
// Real OpenAI call — analyzes accumulated themes, spaces, recent intakes, and
// navigation patterns to produce an HONEST affinity profile. Not a friend match.

import type { VercelRequest, VercelResponse } from "@vercel/node";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { getClient, MODEL, NOT_CONFIGURED_RESPONSE } from "./_lib/openai.js";
import { AffinityProfileSchema, type AffinityProfile } from "./_lib/schemas.js";

export const maxDuration = 60;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  if (req.method !== "POST") {
    res.status(405).send(JSON.stringify({ ok: false, error: "method_not_allowed" }));
    return;
  }

  const client = getClient();
  if (!client) {
    res.status(503).send(JSON.stringify(NOT_CONFIGURED_RESPONSE));
    return;
  }

  const userData = (req.body as any)?.user_data ?? {};
  const userName: string = (req.body as any)?.user_first_name || "the user";

  const themes: Array<{ name: string; weight: number }> = userData.themes ?? [];
  const spaces: Array<{ name: string; kind: string; reason?: string; signals?: string[] }> =
    userData.spaces ?? [];
  const recentIntakes: Array<{ vibe: string; summary_title: string }> =
    userData.recent_intakes ?? [];
  const navPattern: {
    first_screens?: string[];
    last_screens?: string[];
    most_visited?: string[];
  } = userData.navigation_pattern ?? {};

  const dataPoints =
    themes.length +
    spaces.length +
    recentIntakes.length +
    (navPattern.first_screens?.length ?? 0);

  const system = `You are Vyral's affinity reader. Look at a user's accumulated data and produce a vivid, honest profile of who they're becoming.

You are NOT a chatbot. You are NOT a therapist. You're naming real patterns from real activity.

This profile will eventually be used (only with user consent) to find other Vyral users who resonate well. Never anonymously. Never sold.

NON-NEGOTIABLE:
1. NO cliché archetypes ("the dreamer", "the visionary", "the achiever"). Make it SPECIFIC to the data.
2. Every signal must cite real evidence from the input. No invented patterns.
3. ${dataPoints} data points is ${
    dataPoints < 5
      ? "very little — name that directly."
      : dataPoints < 20
      ? "an early signal — say it's still forming."
      : dataPoints < 50
      ? "a developing signal — sharper but still emerging."
      : "a strong signal — confident read."
  }
4. ideal_collaborator_traits = what kind of person would actually resonate with this user — grounded in themes, not personality types.
5. one_thing_to_build_on = a specific suggestion grounded in the data, not motivational fluff.

User name: ${userName}.`;

  const dataBlock = JSON.stringify(
    {
      themes,
      spaces,
      recent_intakes: recentIntakes,
      navigation_pattern: navPattern,
      data_points: dataPoints,
    },
    null,
    2
  );

  try {
    const completion = await client.chat.completions.parse({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        {
          role: "user",
          content: `Here is everything Vyral has on me so far. Give me an honest read.\n\n${dataBlock}`,
        },
      ],
      response_format: zodResponseFormat(AffinityProfileSchema, "vyral_affinity"),
    });

    const parsed = (completion.choices[0]?.message?.parsed as AffinityProfile | null) ?? null;
    if (!parsed) {
      res.status(502).send(
        JSON.stringify({
          ok: false,
          code: "schema_parse_failed",
          error: "OpenAI responded, but Vyral could not shape it into the affinity schema.",
          refusal: completion.choices[0]?.message?.refusal ?? null,
        })
      );
      return;
    }

    res.status(200).send(
      JSON.stringify({
        ok: true,
        profile: { ...parsed, data_points: dataPoints },
        usage: completion.usage,
        model: completion.model,
      })
    );
  } catch (err: unknown) {
    const status = err instanceof OpenAI.APIError ? err.status ?? 500 : 500;
    res.status(status).send(
      JSON.stringify({
        ok: false,
        code: err instanceof OpenAI.APIError ? "openai_api_error" : "affinity_failed",
        error: err instanceof Error ? err.message : "Unknown error",
      })
    );
  }
}
