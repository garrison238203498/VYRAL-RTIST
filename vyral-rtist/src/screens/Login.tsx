import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PhoneFrame from "../components/PhoneFrame";
import VyralMark from "../components/VyralMark";
import { useAuth } from "../lib/auth";
import { motion, AnimatePresence } from "../lib/motion";
import { seedNewAccount } from "../lib/seed";
import { supabase } from "../lib/supabase";

type Mode = "signin" | "signup";

export default function Login() {
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const auth = useAuth();
  const navigate = useNavigate();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (!auth.configured) {
        setError("Auth isn't configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.");
        return;
      }
      if (mode === "signup") {
        const { error } = await auth.signUp(email, password, name || undefined);
        if (error) {
          setError(error.message);
          return;
        }
        // If email confirmations are off, signUp returns a session immediately.
        const { data } = await supabase.auth.getSession();
        if (data.session) {
          await seedNewAccount(data.session.user.id);
          navigate("/boot");
        } else {
          setError("Check your email to confirm your account, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await auth.signIn(email, password);
        if (error) {
          setError(error.message);
          return;
        }
        // Seed only fires for fresh accounts (idempotent).
        const { data } = await supabase.auth.getSession();
        if (data.session) await seedNewAccount(data.session.user.id);
        navigate("/boot");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <PhoneFrame>
      <div className="relative flex h-full w-full flex-col bg-ink-950">
        {/* deep-space backdrop */}
        <Starfield />
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/30 to-ink-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_22%,rgba(168,85,247,0.32),transparent_55%),radial-gradient(circle_at_75%_75%,rgba(34,211,238,0.18),transparent_55%)]" />

        <div className="relative z-10 flex h-full flex-col px-7 pt-16">
          <div className="flex items-center gap-2.5">
            <VyralMark className="h-7 w-7" />
            <div className="leading-tight">
              <div className="font-display text-sm font-semibold tracking-tight">
                Vyral <span className="text-white/30">+</span>{" "}
                <span className="neon-text">ROTIST</span>
              </div>
              <div className="text-[9px] uppercase tracking-[0.3em] text-white/40">
                your reality as lived
              </div>
            </div>
          </div>

          <div className="flex-1" />

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -6, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <div>
                <h1 className="font-display text-[28px] font-semibold leading-tight tracking-tight text-white">
                  {mode === "signin" ? "Welcome back." : "Make your account."}
                </h1>
                <p className="mt-1 text-[13px] text-white/55">
                  {mode === "signin"
                    ? "Sign in to your Spaces, your sessions, and what you're working on."
                    : "It only takes a sec. Your captures, sessions and Spaces stay yours."}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-2">
                {mode === "signup" && (
                  <Field
                    label="Name"
                    type="text"
                    value={name}
                    onChange={setName}
                    placeholder="What should Vyral call you?"
                    autoComplete="name"
                  />
                )}
                <Field
                  label="Email"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="you@whatever.app"
                  autoComplete="email"
                  required
                />
                <Field
                  label="Password"
                  type="password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 6 characters"
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  required
                  minLength={6}
                />

                {error && (
                  <div className="rounded-xl border border-pink-glow/30 bg-pink-glow/10 px-3 py-2 text-[12px] text-pink-glow">
                    {error}
                  </div>
                )}

                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={busy}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-violet-electric via-pink-glow to-cyan-glow px-5 py-3.5 text-[15px] font-semibold text-ink-950 shadow-glow-violet disabled:opacity-50"
                >
                  {busy ? "…" : mode === "signin" ? "Sign in" : "Create account"}
                  {!busy && (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4">
                      <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" />
                    </svg>
                  )}
                </motion.button>
              </form>

              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setMode((m) => (m === "signin" ? "signup" : "signin"));
                }}
                className="mt-2 w-full text-center text-[12px] text-white/55"
              >
                {mode === "signin" ? (
                  <>New here? <span className="text-cyan-glow">Make an account</span></>
                ) : (
                  <>Already have one? <span className="text-cyan-glow">Sign in</span></>
                )}
              </button>
            </motion.div>
          </AnimatePresence>

          <div className="pb-6 pt-6 text-center text-[10px] text-white/30">
            Built quietly. Honest about what's saved.
          </div>
        </div>
      </div>
    </PhoneFrame>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  minLength,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
}) {
  return (
    <label className="block">
      <div className="mb-1 text-[10px] uppercase tracking-[0.25em] text-white/45">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        minLength={minLength}
        className="w-full rounded-2xl border border-white/10 bg-white/[0.04] px-3.5 py-3 text-[15px] text-white placeholder:text-white/30 focus:border-violet-electric/60 focus:outline-none focus:ring-2 focus:ring-violet-electric/20"
      />
    </label>
  );
}

function Starfield() {
  return (
    <svg
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 412 868"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="nebula" cx="30%" cy="20%" r="70%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity=".3" />
          <stop offset="60%" stopColor="#22d3ee" stopOpacity=".05" />
          <stop offset="100%" stopColor="#000" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="412" height="868" fill="url(#nebula)" />
      {/* deterministic stars */}
      {Array.from({ length: 90 }).map((_, i) => {
        const x = (Math.sin(i * 12.9898) * 43758.5453) % 1;
        const y = (Math.sin(i * 78.233) * 12345.6789) % 1;
        const r = 0.3 + ((i * 17) % 9) / 14;
        const opacity = 0.25 + ((i * 31) % 7) / 10;
        return (
          <circle
            key={i}
            cx={Math.abs(x) * 412}
            cy={Math.abs(y) * 868}
            r={r}
            fill="white"
            opacity={opacity}
          />
        );
      })}
    </svg>
  );
}
