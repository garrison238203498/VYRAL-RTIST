import { type ReactNode, useEffect, useState } from "react";

// Renders a phone-shaped device frame on desktop, full-bleed on small viewports.
// All app screens render inside this frame so the prototype reads as a mobile app.
export default function PhoneFrame({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 480 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 480);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (isMobile) {
    return <div className="h-screen w-screen overflow-hidden bg-ink-950">{children}</div>;
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-950 px-4 py-10">
      <DesktopAmbient />

      <div className="relative z-10 grid grid-cols-1 items-center justify-items-center gap-8 lg:grid-cols-[auto_320px] lg:gap-14">
        <div className="relative">
          {/* Outer device shell */}
          <div className="phone-frame-device relative shrink-0">
            {/* Side buttons */}
            <span className="absolute -left-[3px] top-[160px] h-16 w-[3px] rounded-l-sm bg-ink-700" />
            <span className="absolute -left-[3px] top-[240px] h-10 w-[3px] rounded-l-sm bg-ink-700" />
            <span className="absolute -left-[3px] top-[296px] h-10 w-[3px] rounded-l-sm bg-ink-700" />
            <span className="absolute -right-[3px] top-[210px] h-24 w-[3px] rounded-r-sm bg-ink-700" />

            {/* Screen surface */}
            <div className="phone-frame-screen relative h-full w-full overflow-hidden bg-ink-950">
              {/* Status bar */}
              <div className="pointer-events-none absolute inset-x-0 top-0 z-50 flex h-12 items-center justify-between px-7 pt-1.5 text-[12px] font-medium text-white/85">
                <span className="font-mono tabular-nums tracking-tight">9:41</span>
                <div className="absolute left-1/2 top-2 h-7 w-28 -translate-x-1/2 rounded-full bg-black" />
                <div className="flex items-center gap-1.5">
                  <SignalIcon />
                  <WifiIcon />
                  <BatteryIcon />
                </div>
              </div>

              {/* App contents */}
              <div className="relative h-full w-full">{children}</div>
            </div>
          </div>
        </div>

        {/* Side caption (desktop only) */}
        <DesktopCaption />
      </div>
    </div>
  );
}

function DesktopAmbient() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="absolute -left-40 top-[-10%] h-[60vh] w-[60vh] rounded-full bg-violet-electric/15 blur-[120px]" />
      <div className="absolute right-[-10%] top-[20%] h-[55vh] w-[55vh] rounded-full bg-cyan-glow/10 blur-[140px]" />
      <div className="absolute bottom-[-10%] left-[30%] h-[50vh] w-[50vh] rounded-full bg-pink-glow/10 blur-[140px]" />
    </div>
  );
}

function DesktopCaption() {
  return (
    <div className="hidden max-w-xs lg:block">
      <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-white/50">
        <span className="h-1.5 w-1.5 rounded-full bg-lime-glow animate-pulse" />
        Live prototype
      </div>
      <h2 className="font-display text-3xl font-semibold leading-tight text-white">
        <span className="neon-text">Vyral</span> on iPhone.
      </h2>
      <p className="mt-2 text-sm text-white/55">
        Designed mobile-first - bottom tabs, push-style detail screens,
        thumb-zone actions. Resize the window below 480 px to go full-bleed.
      </p>
      <ul className="mt-4 space-y-2 text-xs text-white/50">
        <li>Tap a Space to drill in</li>
        <li>Tap the Pen tab to start a session</li>
        <li>Pull down on Home to refresh AI insights</li>
      </ul>
    </div>
  );
}

function SignalIcon() {
  return (
    <svg viewBox="0 0 18 12" className="h-3 w-4 fill-current">
      <rect x="0" y="8" width="3" height="4" rx="0.5" />
      <rect x="5" y="5" width="3" height="7" rx="0.5" />
      <rect x="10" y="2" width="3" height="10" rx="0.5" />
      <rect x="15" y="0" width="3" height="12" rx="0.5" />
    </svg>
  );
}

function WifiIcon() {
  return (
    <svg viewBox="0 0 16 12" className="h-3 w-4 fill-current">
      <path d="M8 11.5a1 1 0 100-2 1 1 0 000 2z" />
      <path
        d="M2 5.6c1.7-1.5 3.7-2.3 6-2.3s4.3.8 6 2.3l-1.2 1.4C11.4 5.7 9.7 5 8 5s-3.4.7-4.8 2L2 5.6z"
        opacity=".8"
      />
      <path
        d="M.4 3.5C2.5 1.7 5.1.5 8 .5s5.5 1.2 7.6 3l-1.3 1.3C12.5 3.3 10.4 2.5 8 2.5S3.5 3.3 1.7 4.8L.4 3.5z"
        opacity=".55"
      />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg viewBox="0 0 26 12" className="h-3 w-6">
      <rect
        x="0.5"
        y="0.5"
        width="22"
        height="11"
        rx="3"
        fill="none"
        stroke="currentColor"
        opacity=".6"
      />
      <rect x="2" y="2" width="16" height="8" rx="1.5" fill="currentColor" />
      <rect x="23.5" y="3.5" width="2" height="5" rx="1" fill="currentColor" opacity=".6" />
    </svg>
  );
}
