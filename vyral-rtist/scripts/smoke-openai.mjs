// One-off smoke test: call OpenAI through the same SDK path the API uses.
// Run with: node scripts/smoke-openai.mjs
import "dotenv/config";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";

const Schema = z.object({
  summary: z.object({
    title: z.string(),
    body: z.string(),
    key_terms: z.array(z.string()),
  }),
  tasks: z.array(z.object({ text: z.string(), due_relative: z.string().nullable() })),
  vibe: z.string(),
});

const key = process.env.OPENAI_API_KEY;
if (!key) {
  console.error("No OPENAI_API_KEY in environment.");
  process.exit(1);
}
const client = new OpenAI({ apiKey: key });

const completion = await client.chat.completions.parse({
  model: process.env.OPENAI_MODEL || "gpt-4o-mini",
  messages: [
    { role: "system", content: "Extract a structured intake from messy user input. Be specific. No clichés." },
    {
      role: "user",
      content:
        "halflight under the kitchen door, also need to fix the IMU debounce before friday demo",
    },
  ],
  response_format: zodResponseFormat(Schema, "smoke_intake"),
});

console.log("model:", completion.model);
console.log("usage:", completion.usage);
console.log("parsed:", JSON.stringify(completion.choices[0]?.message?.parsed, null, 2));
