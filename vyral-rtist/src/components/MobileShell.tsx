import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import PhoneFrame from "./PhoneFrame";
import { motion } from "framer-motion";
import { useEffect } from "react";

const tabs = [
  { to: "/home", label: "Home", id: "home" },
  { to: "/spaces", label: "Spaces", id: "spaces" },
  { to: "/capture", label: "Capture", id: "capture" },
  { to: "/legacy", label: "Legacy", id: "legacy" },
  { to: "/me", label: "Me", id: "me" },
];

export default function MobileShell() {
  const location = useLocation();
  const navigate = useNavigate();

  const isDetail =
    /^\/spaces\/.+/.test(location.pathname) ||
    /^\/pen\/.+/.test(location.pathname) ||
    /^\/sessions\/.+/.test(location.pathname);

  const showBottomNav = !location.pathname.startsWith("/pen/live");

  useEffect(() => {
    recordNavigation(location.pathname);
  }, [location.pathname]);

  return (
    <PhoneFrame>
      <div className="flex h-full w-full flex-col">
        <main
          className={`flex-1 overflow-y-auto pt-12 ${
            showBottomNav ? "pb-24" : "pb-4"
          }`}
        >
          <Outlet />
        </main>

        {showBottomNav && (
          <nav
            className="absolute inset-x-0 bottom-0 z-40 px-3 pb-3"
            aria-label="Primary"
          >
            <div className="relative rounded-3xl border border-white/8 bg-ink-900/90 backdrop-blur-2xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)]">
              <div className="absolute inset-x-0 -top-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-white/15 to-transparent" />
              <ul className="grid grid-cols-5">
                {tabs.map((t) => {
                  const active =
                    location.pathname === t.to ||
                    (t.to === "/spaces" && location.pathname.startsWith("/spaces")) ||
                    (t.to === "/capture" && location.pathname.startsWith("/capture")) ||
                    (t.to === "/legacy" && location.pathname.startsWith("/legacy"));
                  return (
                    <li key={t.id}>
                      <NavLink
                        to={t.to}
                        className="relative flex flex-col items-center justify-center py-2.5"
                      >
                        {active && (
                          <motion.span
                            layoutId="tab-glow"
                            transition={{ type: "spring", stiffness: 320, damping: 28 }}
                            className="absolute inset-x-3 top-1 h-0.5 rounded-full bg-gradient-to-r from-violet-electric via-cyan-glow to-lime-glow shadow-[0_0_10px_rgba(168,85,247,0.6)]"
                          />
                        )}
                        <TabIcon id={t.id} active={active} />
                        <span
                          className={`mt-0.5 text-[10px] tracking-wide ${
                            active ? "text-white" : "text-white/40"
                          }`}
                        >
                          {t.label}
                        </span>
                      </NavLink>
                    </li>
                  );
                })}
              </ul>
              <div className="mx-auto mb-1 mt-1 h-[3px] w-[110px] rounded-full bg-white/40" />
            </div>
          </nav>
        )}

        {isDetail && (
          <button
            onClick={() => navigate(-1)}
            className="absolute left-3 top-12 z-50 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-ink-900/80 backdrop-blur text-white/80"
            aria-label="Back"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>
    </PhoneFrame>
  );
}

function TabIcon({ id, active }: { id: string; active: boolean }) {
  const cls = active
    ? "h-6 w-6 stroke-current text-white drop-shadow-[0_0_10px_rgba(168,85,247,0.6)]"
    : "h-6 w-6 stroke-current text-white/45";
  switch (id) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth="1.6">
          <path d="M4 11l8-7 8 7v8a2 2 0 01-2 2h-3v-6h-6v6H6a2 2 0 01-2-2v-8z" />
        </svg>
      );
    case "spaces":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth="1.6">
          <circle cx="7" cy="7" r="2.6" />
          <circle cx="17" cy="7" r="2.6" />
          <circle cx="12" cy="17" r="2.6" />
          <path d="M9.5 9L12 14M14.5 9L12 14" opacity=".4" />
        </svg>
      );
    case "pen":
    case "capture":
      return (
        <span
          className={`grid h-10 w-10 place-items-center rounded-2xl ${
            active
              ? "bg-lime-glow text-ink-950 shadow-[0_0_18px_rgba(163,230,53,0.35)]"
              : "border border-white/10 bg-white/[0.05] text-white/70"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="2" stroke="currentColor">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </span>
      );
    case "legacy":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth="1.6">
          <path d="M6 4h9l3 3v13H6z" />
          <path d="M14 4v4h4M9 12h6M9 16h4" />
        </svg>
      );
    case "me":
      return (
        <svg viewBox="0 0 24 24" className={cls} fill="none" strokeWidth="1.6">
          <circle cx="12" cy="9" r="3.5" />
          <path d="M5 20a7 7 0 0114 0" />
        </svg>
      );
    default:
      return null;
  }
}

function recordNavigation(pathname: string) {
  try {
    const key = "vyral.navigationPattern";
    const current = JSON.parse(localStorage.getItem(key) || "{}") as {
      first_screens?: string[];
      last_screens?: string[];
      most_visited?: string[];
      counts?: Record<string, number>;
      session_started_at?: string;
    };
    const screen = pathname.split("/")[1] || "home";
    const counts = { ...(current.counts || {}) };
    counts[screen] = (counts[screen] || 0) + 1;
    const firstScreens = current.first_screens?.length
      ? current.first_screens
      : [screen];
    const lastScreens = [screen, ...(current.last_screens || []).filter((item) => item !== screen)].slice(0, 8);
    const mostVisited = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name]) => name);
    localStorage.setItem(
      key,
      JSON.stringify({
        first_screens: firstScreens,
        last_screens: lastScreens,
        most_visited: mostVisited,
        counts,
        session_started_at: current.session_started_at || new Date().toISOString(),
      })
    );
  } catch {
    // Navigation memory is supportive, not required for app flow.
  }
}
