import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";

type SpaceKind =
  | "creative"
  | "school"
  | "writing"
  | "social"
  | "reset"
  | "legacy"
  | "build"
  | "memory"
  | "reflection";

type Accent = "violet" | "cyan" | "pink" | "lime";

type IntakeFile = {
  filename: string;
  media_type: string;
  base64: string;
  size: number;
};

type IntakeResult = {
  summary: {
    title: string;
    body: string;
    key_terms: string[];
  };
  tasks: Array<{
    text: string;
    due_relative: string | null;
  }>;
  themes: Array<{
    name: string;
    weight: number;
  }>;
  suggested_space: {
    mode: "use_existing" | "create_new";
    existing_space_id: string | null;
    name: string;
    kind: SpaceKind;
    accent: Accent;
    reason: string;
  };
  legacy_candidate: {
    should_save: boolean;
    title: string | null;
    body: string | null;
    kind: "milestone" | "summary" | "pattern" | "session" | "evolution" | null;
  };
  vibe: string;
};

type ApprovedSpace = {
  id: string;
  name: string;
  kind: SpaceKind;
  accent: Accent;
  reason: string;
  summaries: Array<{ title: string; body: string; savedAt: string }>;
  tasks: Array<{ text: string; due_relative: string | null; done: boolean }>;
  themes: Array<{ name: string; weight: number }>;
};

type AffinityProfile = {
  archetype: string;
  signals: Array<{ name: string; evidence: string }>;
  resonance_pattern: string;
  ideal_collaborator_traits: string[];
  one_thing_to_build_on: string;
  honesty_note: string;
  data_points?: number;
};

const SPACES_KEY = "vyral.approvedSpaces";
const LEGACY_KEY = "vyral.legacy";
const THEMES_KEY = "vyral.themes";
const INTAKES_KEY = "vyral.recentIntakes";
const NAV_KEY = "vyral.navigationPattern";

export default function Capture() {
  const [quickText, setQuickText] = useState("");
  const [files, setFiles] = useState<IntakeFile[]>([]);
  const [spaces, setSpaces] = useState<ApprovedSpace[]>(() => readJson(SPACES_KEY, []));
  const [intake, setIntake] = useState<IntakeResult | null>(null);
  const [profile, setProfile] = useState<AffinityProfile | null>(null);
  const [processing, setProcessing] = useState(false);
  const [affinityLoading, setAffinityLoading] = useState(false);
  const [dropActive, setDropActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const accumulatedThemes = useMemo(() => readJson<Array<{ name: string; weight: number }>>(THEMES_KEY, []), [intake, spaces]);

  useEffect(() => {
    localStorage.setItem(SPACES_KEY, JSON.stringify(spaces));
  }, [spaces]);

  async function addFiles(fileList: FileList | File[]) {
    setError(null);
    const accepted = Array.from(fileList).filter((file) =>
      file.type.startsWith("image/") ||
      file.type === "application/pdf" ||
      file.type === "text/plain"
    );

    if (accepted.length !== Array.from(fileList).length) {
      setError("Only images, PDFs, and plain text files can be analyzed in this build.");
    }

    const encoded = await Promise.all(accepted.slice(0, 6).map(fileToPayload));
    setFiles((current) => [...current, ...encoded]);
  }

  async function analyze() {
    if (!quickText.trim() && files.length === 0) {
      setError("Add text or a file first.");
      return;
    }

    setProcessing(true);
    setError(null);
    setLastAction(null);
    setProfile(null);

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: quickText,
          files: files.map(({ filename, media_type, base64 }) => ({ filename, media_type, base64 })),
          user_context: {
            user_first_name: "Garrison",
            spaces: spaces.map((space) => ({
              id: space.id,
              name: space.name,
              kind: space.kind,
              accent: space.accent,
              reason: space.reason,
            })),
            recent_themes: accumulatedThemes.map((theme) => theme.name),
          },
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body.error || "Vyral could not analyze this intake.");
      }
      setIntake(body.intake);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Vyral could not analyze this intake.");
    } finally {
      setProcessing(false);
    }
  }

  function approveIntake() {
    if (!intake) return;

    const suggested = intake.suggested_space;
    const savedAt = new Date().toISOString();
    const existingId = suggested.mode === "use_existing" ? suggested.existing_space_id : null;
    const generatedId = slugify(suggested.name);
    const targetId = existingId ?? generatedId;

    setSpaces((current) => {
      const found = current.find((space) => space.id === targetId || space.name === suggested.name);
      if (found) {
        return current.map((space) =>
          space.id === found.id
            ? {
                ...space,
                summaries: [{ title: intake.summary.title, body: intake.summary.body, savedAt }, ...space.summaries],
                tasks: [...intake.tasks.map((task) => ({ ...task, done: false })), ...space.tasks],
                themes: mergeThemes(space.themes, intake.themes),
              }
            : space
        );
      }
      return [
        {
          id: targetId,
          name: suggested.name,
          kind: suggested.kind,
          accent: suggested.accent,
          reason: suggested.reason,
          summaries: [{ title: intake.summary.title, body: intake.summary.body, savedAt }],
          tasks: intake.tasks.map((task) => ({ ...task, done: false })),
          themes: intake.themes,
        },
        ...current,
      ];
    });

    persistThemes(intake.themes);
    persistRecentIntake(intake);
    setLastAction(`Approved into ${suggested.name}.`);
    setQuickText("");
    setFiles([]);
    setIntake(null);
  }

  function dismissIntake() {
    setIntake(null);
    setLastAction("Dismissed. Nothing was saved.");
  }

  function saveLegacy() {
    if (!intake) return;
    const entry = {
      id: `legacy-${Date.now()}`,
      savedAt: new Date().toISOString(),
      title: intake.legacy_candidate.title || intake.summary.title,
      body: intake.legacy_candidate.body || intake.summary.body,
      kind: intake.legacy_candidate.kind || "summary",
      sourceVibe: intake.vibe,
    };
    const current = readJson<typeof entry[]>(LEGACY_KEY, []);
    localStorage.setItem(LEGACY_KEY, JSON.stringify([entry, ...current]));
    setLastAction("Saved to Life & Legacy.");
  }

  async function generateAffinityProfile() {
    setAffinityLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/affinity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_first_name: "Garrison",
          user_data: {
            themes: readJson(THEMES_KEY, []),
            spaces: spaces.map((space) => ({
              name: space.name,
              kind: space.kind,
              reason: space.reason,
              signals: space.themes.map((theme) => theme.name),
            })),
            recent_intakes: readJson(INTAKES_KEY, []),
            navigation_pattern: readJson(NAV_KEY, {}),
          },
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.ok) {
        throw new Error(body.error || "Could not generate affinity profile.");
      }
      setProfile(body.profile);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not generate affinity profile.");
    } finally {
      setAffinityLoading(false);
    }
  }

  return (
    <div className="px-5 pt-1">
      <header className="mb-5">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">Capture</div>
        <h1 className="mt-1.5 font-display text-[27px] font-semibold leading-tight tracking-tight">
          Messy in. Structure out.
        </h1>
        <p className="mt-1 text-[13px] leading-5 text-white/62">
          Vyral reads real input through server-side AI, then waits for your approval before saving anything.
        </p>
      </header>

      <section className="mb-4 rounded-[24px] border border-white/10 bg-white/[0.045] p-3">
        <div className="flex items-center gap-2">
          <button
            onClick={analyze}
            disabled={processing}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-lime-glow text-ink-950 disabled:opacity-50"
            aria-label="Analyze capture"
          >
            {processing ? <Spinner /> : <PlusIcon />}
          </button>
          <textarea
            value={quickText}
            onChange={(event) => setQuickText(event.target.value)}
            placeholder="Paste the messy thing here..."
            className="min-h-[66px] flex-1 resize-none bg-transparent text-[14px] leading-5 text-white placeholder:text-white/30 focus:outline-none"
          />
        </div>
      </section>

      <section
        onDragOver={(event) => {
          event.preventDefault();
          setDropActive(true);
        }}
        onDragLeave={() => setDropActive(false)}
        onDrop={(event: DragEvent<HTMLDivElement>) => {
          event.preventDefault();
          setDropActive(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`mb-4 rounded-[24px] border p-4 transition ${
          dropActive
            ? "border-cyan-glow bg-cyan-glow/10"
            : "border-dashed border-white/14 bg-white/[0.025]"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-glow">Intake panel</div>
            <div className="mt-1 font-display text-[17px] font-semibold text-white">Files, screenshots, notes</div>
            <div className="mt-1 text-[12px] leading-5 text-white/52">Images, PDFs, and text files are sent to the Vercel API route, not the browser key.</div>
          </div>
          <button
            onClick={() => inputRef.current?.click()}
            className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-medium text-white"
          >
            Upload
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,text/plain"
            onChange={(event) => event.target.files && addFiles(event.target.files)}
            className="hidden"
          />
        </div>
        {files.length > 0 && (
          <ul className="mt-3 space-y-2">
            {files.map((file) => (
              <li key={`${file.filename}-${file.size}`} className="flex items-center justify-between rounded-2xl border border-white/8 bg-white/[0.04] px-3 py-2">
                <span className="truncate text-[12px] text-white/75">{file.filename}</span>
                <button
                  onClick={() => setFiles((current) => current.filter((item) => item !== file))}
                  className="text-[11px] text-white/40"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={analyze}
        disabled={processing || (!quickText.trim() && files.length === 0)}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-electric via-cyan-glow to-lime-glow px-4 py-3 text-sm font-semibold text-ink-950 disabled:cursor-not-allowed disabled:opacity-45"
      >
        {processing ? "Vyral is organizing..." : "Analyze with Vyral"}
      </button>

      {processing && <ProcessingState />}
      {error && <StatusPanel tone="pink" title="AI could not finish" body={error} />}
      {lastAction && <StatusPanel tone="lime" title="Saved" body={lastAction} />}
      {intake && (
        <IntakeResultPanel
          intake={intake}
          onApprove={approveIntake}
          onDismiss={dismissIntake}
          onSaveLegacy={saveLegacy}
        />
      )}

      <SpaceDashboard spaces={spaces} />

      <section className="mb-2 rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">Affinity</div>
            <h2 className="mt-1 font-display text-[17px] font-semibold text-white">Honest resonance profile</h2>
          </div>
          <button
            onClick={generateAffinityProfile}
            disabled={affinityLoading || spaces.length === 0}
            className="rounded-xl border border-cyan-glow/30 bg-cyan-glow/10 px-3 py-2 text-xs font-medium text-cyan-glow disabled:opacity-40"
          >
            {affinityLoading ? "Reading" : "Generate"}
          </button>
        </div>
        {profile ? (
          <div className="mt-3 space-y-3">
            <div>
              <div className="text-[11px] text-white/45">Archetype</div>
              <div className="font-display text-[20px] font-semibold text-white">{profile.archetype}</div>
            </div>
            <p className="text-[13px] leading-5 text-white/66">{profile.resonance_pattern}</p>
            <div className="flex flex-wrap gap-2">
              {profile.ideal_collaborator_traits.map((trait) => (
                <span key={trait} className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[11px] text-white/68">
                  {trait}
                </span>
              ))}
            </div>
            <div className="rounded-2xl border border-lime-glow/20 bg-lime-glow/[0.06] p-3 text-[12px] leading-5 text-white/74">
              {profile.one_thing_to_build_on}
            </div>
            <div className="text-[11px] text-white/42">{profile.honesty_note}</div>
          </div>
        ) : (
          <p className="mt-3 text-[12px] leading-5 text-white/52">
            Built from approved Spaces, themes, recent intakes, and route patterns. No pretend friend matches.
          </p>
        )}
      </section>
    </div>
  );
}

function IntakeResultPanel({
  intake,
  onApprove,
  onDismiss,
  onSaveLegacy,
}: {
  intake: IntakeResult;
  onApprove: () => void;
  onDismiss: () => void;
  onSaveLegacy: () => void;
}) {
  const accent = accentClass(intake.suggested_space.accent);
  return (
    <section className="mb-5 space-y-3">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-[10px] uppercase tracking-[0.25em] text-violet-electric">Generated summary</div>
          <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] text-white/50">{intake.vibe}</span>
        </div>
        <h2 className="mt-2 font-display text-[21px] font-semibold leading-tight text-white">{intake.summary.title}</h2>
        <p className="mt-2 text-[13px] leading-5 text-white/68">{intake.summary.body}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {intake.summary.key_terms.map((term) => (
            <span key={term} className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[11px] text-white/58">{term}</span>
          ))}
        </div>
      </div>

      <div className="rounded-[24px] border border-white/10 bg-white/[0.035] p-4">
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/42">Extracted tasks</div>
        {intake.tasks.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {intake.tasks.map((task) => (
              <li key={`${task.text}-${task.due_relative}`} className="rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                <div className="text-[13px] font-medium text-white">{task.text}</div>
                {task.due_relative && <div className="mt-1 text-[11px] text-cyan-glow">{task.due_relative}</div>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-[12px] text-white/48">No clear tasks found.</p>
        )}
      </div>

      <div className={`rounded-[24px] border p-4 ${accent.panel}`}>
        <div className="text-[10px] uppercase tracking-[0.25em] text-white/45">Suggested Space</div>
        <h3 className="mt-2 font-display text-[22px] font-semibold text-white">{intake.suggested_space.name}</h3>
        <p className="mt-1 text-[13px] leading-5 text-white/68">{intake.suggested_space.reason}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {intake.themes.map((theme) => (
            <span key={theme.name} className={`rounded-full border px-2.5 py-1 text-[11px] ${accent.chip}`}>
              {theme.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <button onClick={onApprove} className="rounded-2xl bg-lime-glow px-3 py-3 text-xs font-semibold text-ink-950">Approve</button>
        <button onClick={onSaveLegacy} className="rounded-2xl border border-violet-electric/30 bg-violet-electric/10 px-3 py-3 text-xs font-semibold text-violet-electric">Legacy</button>
        <button onClick={onDismiss} className="rounded-2xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs font-semibold text-white/62">Dismiss</button>
      </div>
    </section>
  );
}

function ProcessingState() {
  return (
    <section className="mb-4 rounded-[24px] border border-cyan-glow/25 bg-cyan-glow/[0.055] p-4">
      <div className="flex items-center gap-3">
        <Spinner />
        <div>
          <div className="font-display text-[17px] font-semibold text-white">AI processing</div>
          <div className="mt-1 text-[12px] text-white/55">Reading input, extracting actions, checking Space fit.</div>
        </div>
      </div>
      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <div className="h-full w-2/3 animate-shimmer rounded-full bg-gradient-to-r from-violet-electric via-cyan-glow to-lime-glow bg-[length:200%_100%]" />
      </div>
    </section>
  );
}

function SpaceDashboard({ spaces }: { spaces: ApprovedSpace[] }) {
  return (
    <section className="mb-5">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-[10px] uppercase tracking-[0.25em] text-white/42">Space dashboard</h2>
        <span className="text-[11px] text-white/45">{spaces.length} approved</span>
      </div>
      {spaces.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.02] p-5 text-center text-[12px] leading-5 text-white/48">
          Approved AI results will form the dashboard here.
        </div>
      ) : (
        <div className="space-y-3">
          {spaces.map((space) => {
            const accent = accentClass(space.accent);
            return (
              <article key={space.id} className={`rounded-[24px] border p-4 ${accent.panel}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-white/42">{space.kind}</div>
                    <h3 className="mt-1 font-display text-[19px] font-semibold text-white">{space.name}</h3>
                  </div>
                  <span className={`rounded-full border px-2 py-0.5 text-[10px] ${accent.chip}`}>{space.tasks.length} tasks</span>
                </div>
                <p className="mt-2 text-[12px] leading-5 text-white/58">{space.reason}</p>
                {space.summaries[0] && (
                  <div className="mt-3 rounded-2xl border border-white/8 bg-white/[0.04] p-3">
                    <div className="text-[12px] font-semibold text-white">{space.summaries[0].title}</div>
                    <p className="mt-1 line-clamp-2 text-[12px] leading-5 text-white/55">{space.summaries[0].body}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function StatusPanel({ tone, title, body }: { tone: "pink" | "lime"; title: string; body: string }) {
  const cls = tone === "pink"
    ? "border-pink-glow/25 bg-pink-glow/[0.06] text-pink-glow"
    : "border-lime-glow/25 bg-lime-glow/[0.06] text-lime-glow";
  return (
    <div className={`mb-4 rounded-[20px] border p-3 ${cls}`}>
      <div className="text-[12px] font-semibold">{title}</div>
      <div className="mt-1 text-[12px] leading-5 text-white/64">{body}</div>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />;
}

function accentClass(accent: Accent) {
  return {
    violet: {
      panel: "border-violet-electric/25 bg-violet-electric/[0.07]",
      chip: "border-violet-electric/35 bg-violet-electric/10 text-violet-electric",
    },
    cyan: {
      panel: "border-cyan-glow/25 bg-cyan-glow/[0.07]",
      chip: "border-cyan-glow/35 bg-cyan-glow/10 text-cyan-glow",
    },
    pink: {
      panel: "border-pink-glow/25 bg-pink-glow/[0.07]",
      chip: "border-pink-glow/35 bg-pink-glow/10 text-pink-glow",
    },
    lime: {
      panel: "border-lime-glow/25 bg-lime-glow/[0.07]",
      chip: "border-lime-glow/35 bg-lime-glow/10 text-lime-glow",
    },
  }[accent];
}

function fileToPayload(file: File): Promise<IntakeFile> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(`Could not read ${file.name}.`));
    reader.onload = () => {
      const data = String(reader.result || "");
      const base64 = data.includes(",") ? data.split(",")[1] : data;
      resolve({
        filename: file.name,
        media_type: file.type || "application/octet-stream",
        base64,
        size: file.size,
      });
    };
    reader.readAsDataURL(file);
  });
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function slugify(value: string) {
  const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return slug ? `space-${slug}` : `space-${Date.now()}`;
}

function mergeThemes(
  current: Array<{ name: string; weight: number }>,
  incoming: Array<{ name: string; weight: number }>
) {
  const map = new Map(current.map((theme) => [theme.name, theme.weight]));
  for (const theme of incoming) {
    map.set(theme.name, Math.max(map.get(theme.name) ?? 0, theme.weight));
  }
  return Array.from(map, ([name, weight]) => ({ name, weight })).sort((a, b) => b.weight - a.weight);
}

function persistThemes(themes: Array<{ name: string; weight: number }>) {
  const current = readJson<Array<{ name: string; weight: number }>>(THEMES_KEY, []);
  localStorage.setItem(THEMES_KEY, JSON.stringify(mergeThemes(current, themes).slice(0, 80)));
}

function persistRecentIntake(intake: IntakeResult) {
  const current = readJson<Array<{ vibe: string; summary_title: string }>>(INTAKES_KEY, []);
  localStorage.setItem(
    INTAKES_KEY,
    JSON.stringify([{ vibe: intake.vibe, summary_title: intake.summary.title }, ...current].slice(0, 24))
  );
}
