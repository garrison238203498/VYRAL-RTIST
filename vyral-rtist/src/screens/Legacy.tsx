import { useState } from "react";
import { Link } from "react-router-dom";
import { useLegacy } from "../lib/data";
import { dotClass } from "./Home";

const filters = ["All", "Milestone", "Pattern", "Session", "Summary"] as const;

export default function Legacy() {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");
  const entries = useLegacy();

  const filtered =
    filter === "All"
      ? entries
      : entries.filter((e) => e.kind === filter.toLowerCase() || (filter === "Summary" && e.kind === "evolution"));

  return (
    <div className="px-5 pt-2">
      <header className="mb-3">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">
          Long-term memory
        </div>
        <h1 className="mt-1 font-display text-[26px] font-semibold tracking-tight">Life & Legacy</h1>
        <p className="mt-1 text-[13px] text-white/60">
          A quiet record of what you became. Nothing here was added without your approval.
        </p>
      </header>

      <div className="-mx-5 mb-3 overflow-x-auto px-5">
        <div className="flex gap-1.5">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 rounded-full border px-3 py-1 text-[11px] ${
                filter === f
                  ? "border-white/20 bg-white/10 text-white"
                  : "border-white/10 bg-white/[0.025] text-white/60"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <ol className="relative ml-2 space-y-5 border-l border-white/10 pl-5">
        {filtered.map((e) => (
          <li key={e.id} className="relative">
            <span
              className={`absolute -left-[24px] top-1.5 h-2.5 w-2.5 rounded-full ${dotBg(e.accent ?? "violet")} shadow-[0_0_10px_currentColor] ${dotText(e.accent ?? "violet")}`}
            />
            <div className="flex items-center gap-2">
              <span className={`rounded-full border px-2 py-0.5 text-[9px] uppercase tracking-wider ${dotClass(e.accent ?? "violet")}`}>
                {e.kind}
              </span>
              <span className="text-[10px] text-white/40">{prettyDate(e.occurred_at)}</span>
            </div>
            <h3 className="mt-1 font-display text-[15px] font-semibold leading-snug text-white">
              {e.title}
            </h3>
            <p className="mt-1 text-[12px] text-white/60">{e.body}</p>
            {e.space_id && (
              <Link to={`/spaces/${e.space_id}`} className="mt-1.5 inline-block text-[11px] text-cyan-glow">
                Open Space →
              </Link>
            )}
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="text-[12px] text-white/45">Nothing here yet. Live a little.</li>
        )}
      </ol>
    </div>
  );
}

function dotBg(t: string) {
  return { violet: "bg-violet-electric", cyan: "bg-cyan-glow", pink: "bg-pink-glow", lime: "bg-lime-glow" }[t];
}
function dotText(t: string) {
  return { violet: "text-violet-electric", cyan: "text-cyan-glow", pink: "text-pink-glow", lime: "text-lime-glow" }[t];
}
function prettyDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
