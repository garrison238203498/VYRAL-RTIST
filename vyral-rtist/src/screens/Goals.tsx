import { useState } from "react";
import { motion, AnimatePresence, Pressable } from "../lib/motion";
import { useGoals, useSpaces } from "../lib/data";
import GoalCelebration, { type CelebrationGoal } from "../components/GoalCelebration";
import type { GoalRow } from "../types/database";

const kindOptions: { id: GoalRow["kind"]; label: string; defaultUnit: string; example: string }[] = [
  { id: "draft_words", label: "Words drafted", defaultUnit: "words", example: "Draft 320 words on Halflight" },
  { id: "study_minutes", label: "Study minutes", defaultUnit: "min", example: "Study bio for 90 min before Friday" },
  { id: "session_count", label: "Sessions", defaultUnit: "sessions", example: "Log 4 ROTIST sessions this week" },
  { id: "task_count", label: "Tasks done", defaultUnit: "tasks", example: "Finish 6 review cards" },
  { id: "custom", label: "Other", defaultUnit: "things", example: "10 push-ups before each session" },
];

export default function Goals() {
  const { goals, createGoal, bumpProgress } = useGoals();
  const { spaces } = useSpaces();
  const [showNew, setShowNew] = useState(false);
  const [celebration, setCelebration] = useState<CelebrationGoal | null>(null);

  const active = goals.filter((g) => g.status === "active");
  const completed = goals.filter((g) => g.status === "completed");

  async function handleBump(goal: GoalRow, amount: number) {
    const updated = await bumpProgress(goal.id, amount);
    if (updated && updated.status === "completed" && goal.status === "active") {
      setCelebration({
        id: updated.id,
        title: updated.title,
        unit: updated.unit,
        target_value: updated.target_value,
        why: updated.why,
      });
    }
  }

  return (
    <div className="px-5 pt-2 pb-2">
      <header className="mb-4 flex items-end justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">
            What you said you'd do
          </div>
          <h1 className="mt-1 font-display text-[26px] font-semibold tracking-tight">
            Goals
          </h1>
        </div>
        <Pressable
          onClick={() => setShowNew(true)}
          className="rounded-full bg-gradient-to-br from-violet-electric to-cyan-glow px-3.5 py-2 text-[12px] font-semibold text-ink-950 shadow-glow-violet"
        >
          + New
        </Pressable>
      </header>

      {active.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/12 bg-white/[0.02] p-5 text-center">
          <div className="font-display text-[15px] text-white/85">Set the first thing you want done.</div>
          <p className="mt-1 text-[12px] text-white/55">
            "Draft 320 words on Halflight." "Six review cards before Friday." Whatever's real to you.
          </p>
          <button
            onClick={() => setShowNew(true)}
            className="mt-3 rounded-xl bg-gradient-to-r from-violet-electric to-pink-glow px-4 py-2 text-[12px] font-semibold text-ink-950"
          >
            Set a goal
          </button>
        </div>
      )}

      <ul className="space-y-3">
        {active.map((g) => (
          <GoalCard key={g.id} goal={g} onBump={(amt) => handleBump(g, amt)} spaceName={spaces.find((s) => s.id === g.space_id)?.name} />
        ))}
      </ul>

      {completed.length > 0 && (
        <>
          <div className="mb-2 mt-6 text-[10px] uppercase tracking-[0.25em] text-white/45">
            Done · {completed.length}
          </div>
          <ul className="space-y-2">
            {completed.map((g) => (
              <li
                key={g.id}
                className="flex items-center justify-between rounded-2xl border border-lime-glow/25 bg-lime-glow/[0.06] px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-7 w-7 place-items-center rounded-lg bg-lime-glow/30 text-lime-glow">
                    <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 6l3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  <div>
                    <div className="text-[13px] text-white/90">{g.title}</div>
                    <div className="text-[10px] text-white/45">
                      {g.target_value} {g.unit ?? ""}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <AnimatePresence>
        {showNew && (
          <NewGoalSheet
            spaces={spaces}
            onClose={() => setShowNew(false)}
            onCreate={async (input) => {
              await createGoal(input);
              setShowNew(false);
            }}
          />
        )}
      </AnimatePresence>

      <GoalCelebration goal={celebration} onClose={() => setCelebration(null)} />
    </div>
  );
}

function GoalCard({
  goal,
  onBump,
  spaceName,
}: {
  goal: GoalRow;
  onBump: (amt: number) => void;
  spaceName?: string | null;
}) {
  const pct = Math.min(100, ((goal.current_value ?? 0) / Math.max(1, goal.target_value)) * 100);
  const close = pct >= 80;
  return (
    <li className="rounded-2xl border border-white/8 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-[15px] font-semibold leading-snug text-white">
            {goal.title}
          </div>
          {goal.why && <p className="mt-0.5 text-[11px] italic text-white/50">"{goal.why}"</p>}
          {spaceName && (
            <span className="mt-2 inline-block rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/55">
              {spaceName}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className={`font-display text-[20px] font-semibold ${close ? "text-lime-glow" : "text-white"}`}>
            {goal.current_value ?? 0}
            <span className="text-[12px] text-white/45">/{goal.target_value}</span>
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-white/40">{goal.unit ?? ""}</div>
        </div>
      </div>

      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
          className={`h-2 rounded-full bg-gradient-to-r ${
            close ? "goal-progress-glow from-lime-glow to-cyan-glow" : "from-violet-electric to-pink-glow"
          }`}
        />
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={() => onBump(1)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/85"
        >
          +1
        </button>
        <button
          onClick={() => onBump(10)}
          className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/85"
        >
          +10
        </button>
        {goal.kind === "draft_words" && (
          <button
            onClick={() => onBump(50)}
            className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/85"
          >
            +50
          </button>
        )}
        <button
          onClick={() => onBump(goal.target_value - (goal.current_value ?? 0))}
          className="ml-auto rounded-lg bg-gradient-to-r from-violet-electric to-cyan-glow px-2.5 py-1 text-[11px] font-semibold text-ink-950"
        >
          Mark done
        </button>
      </div>
    </li>
  );
}

function NewGoalSheet({
  spaces,
  onClose,
  onCreate,
}: {
  spaces: { id: string; name: string }[];
  onClose: () => void;
  onCreate: (input: {
    title: string;
    target_value: number;
    kind: GoalRow["kind"];
    unit?: string;
    why?: string | null;
    space_id?: string | null;
    deadline?: string | null;
  }) => Promise<void>;
}) {
  const [kind, setKind] = useState<GoalRow["kind"]>("draft_words");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState(320);
  const [why, setWhy] = useState("");
  const [spaceId, setSpaceId] = useState<string>("");

  const opt = kindOptions.find((o) => o.id === kind)!;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <motion.div className="absolute inset-0 bg-ink-950/70 backdrop-blur" onClick={onClose} />
      <motion.div
        initial={{ y: 60 }}
        animate={{ y: 0 }}
        exit={{ y: 80 }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="relative z-10 w-full rounded-t-3xl border-t border-white/10 bg-ink-900 p-5"
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/15" />
        <div className="mb-3">
          <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Set a goal</div>
          <h2 className="mt-1 font-display text-[20px] font-semibold tracking-tight">
            What do you want to actually finish?
          </h2>
        </div>

        <div className="mb-3">
          <div className="mb-1.5 text-[10px] uppercase tracking-[0.2em] text-white/45">Type</div>
          <div className="flex flex-wrap gap-1.5">
            {kindOptions.map((o) => (
              <button
                key={o.id}
                onClick={() => setKind(o.id)}
                className={`rounded-lg border px-2.5 py-1.5 text-[11px] ${
                  kind === o.id
                    ? "border-violet-electric/40 bg-violet-electric/15 text-violet-electric"
                    : "border-white/10 bg-white/[0.025] text-white/65"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <Field
          label="Goal"
          value={title}
          onChange={setTitle}
          placeholder={opt.example}
        />

        <div className="grid grid-cols-2 gap-2">
          <NumberField label={`Target (${opt.defaultUnit})`} value={target} onChange={setTarget} />
          <SelectField
            label="Space"
            value={spaceId}
            onChange={setSpaceId}
            options={[{ id: "", name: "—" }, ...spaces]}
          />
        </div>

        <Field
          label="Why this matters (optional)"
          value={why}
          onChange={setWhy}
          placeholder="One line. The reason you'll come back."
        />


        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-white/[0.04] py-3 text-[13px] text-white/80"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              onCreate({
                title: title || opt.example,
                target_value: target,
                kind,
                unit: opt.defaultUnit,
                why: why || null,
                space_id: spaceId || null,
              })
            }
            className="rounded-xl bg-gradient-to-r from-violet-electric to-cyan-glow py-3 text-[13px] font-semibold text-ink-950"
          >
            Set goal
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="mb-2.5 block">
      <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[14px] placeholder:text-white/30 focus:border-violet-electric/60 focus:outline-none"
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</div>
      <input
        type="number"
        min={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[14px] focus:border-violet-electric/60 focus:outline-none"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-[0.2em] text-white/45">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[14px] focus:border-violet-electric/60 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-ink-900">
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
