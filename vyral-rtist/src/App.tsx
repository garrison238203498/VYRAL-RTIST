import { Routes, Route, Navigate } from "react-router-dom";
import MobileShell from "./components/MobileShell";
import Login from "./screens/Login";
import Boot from "./screens/Boot";
import Home from "./screens/Home";
import Capture from "./screens/Capture";
import Spaces from "./screens/Spaces";
import SpaceDetail from "./screens/SpaceDetail";
import Pen from "./screens/Pen";
import LiveSession from "./screens/LiveSession";
import SessionDetail from "./screens/SessionDetail";
import ConductorMode from "./screens/ConductorMode";
import Legacy from "./screens/Legacy";
import Goals from "./screens/Goals";
import Me from "./screens/Me";
import { AuthProvider, useAuth } from "./lib/auth";
import { type ReactNode } from "react";

function Guard({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  if (!configured) return <>{children}</>; // dev fallback when supabase env not set
  if (loading) return <div className="grid h-screen w-screen place-items-center bg-ink-950 text-white/40">·</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/capture" replace />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/boot"
          element={
            <Guard>
              <Boot />
            </Guard>
          }
        />
        <Route
          element={
            <Guard>
              <MobileShell />
            </Guard>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/capture" element={<Capture />} />
          <Route path="/spaces" element={<Spaces />} />
          <Route path="/spaces/:id" element={<SpaceDetail />} />
          <Route path="/pen" element={<Pen />} />
          <Route path="/pen/live" element={<LiveSession />} />
          <Route path="/pen/conductor" element={<ConductorMode />} />
          <Route path="/sessions/:id" element={<SessionDetail />} />
          <Route path="/legacy" element={<Legacy />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/me" element={<Me />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
