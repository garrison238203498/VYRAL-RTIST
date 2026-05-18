import { useState } from "react";
import { Link } from "react-router-dom";
import { useSpaces } from "../lib/data";
import { TiltCard } from "../lib/motion";
import { dotClass, cardTone } from "./Home";

const tabs = ["Active", "Suggested", "Archived"] as const;

export default function Spaces() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Active");
  const { spaces } = useSpaces();
  const filtered = spaces.filter((s) =>
    tab === "Active" ? s.status === "active" : tab === "Suggested" ? s.status === "suggested" : s.status === "archived"
  );

  return (
    <div className="px-5 pt-2">
      <header className="mb-4">
        <div className="text-[11px] uppercase tracking-[0.25em] text-white/40">
          Your environments
        </div>
        <h1 className="mt-1 font-display text-[26px] font-semibold tracking-tight">Spaces</h1>
      </header>

      <div className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-white/8 bg-white/[0.025] p-1">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg py-2 text-[12px] font-medium transition ${
              tab === t ? "bg-white/10 text-white" : "text-white/55"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="space-y-3">
        {filtered.map((s) => (
          <li key={s.id}>
            <Link to={`/spaces/${s.id}`} className="block">
              <TiltCard
                className={`relative block overflow-hidden rounded-2xl border p-4 ${cardTone(s.accent)}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      {s.pinned && (
                        <span className="text-[9px] uppercase tracking-[0.25em] text-white/45">pinned</span>
                      )}
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wider ${dotClass(s.accent)}`}>
                        {s.kind}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-display text-[18px] font-semibold leading-snug text-white">
                      {s.name}
                    </h3>
                  </div>
                  <span className="text-[10px] text-white/35">{timeAgoShort(s.last_activity_at)}</span>
                </div>
                <p className="mt-1 text-[12px] text-white/55">{s.reason}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(s.signals ?? []).slice(0, 3).map((sig) => (
                    <span
                      key={sig}
                      className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-white/65"
                    >
                      {sig}
                    </span>
                  ))}
                </div>
              </TiltCard>
            </Link>
          </li>
        ))}
        {filtered.length === 0 && (
          <li className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-5 text-center text-[12px] text-white/45">
            Nothing here yet. Spaces appear as your patterns do.
          </li>
        )}
      </ul>
    </div>
  );
}

function timeAgoShort(iso?: string | null) {
  if (!iso) return "—";
  const m = Math.round((Date.now() - new Date(iso).getTime()) / 60_000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}
