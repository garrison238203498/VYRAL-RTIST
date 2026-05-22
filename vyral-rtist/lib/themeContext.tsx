import React, { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ComponentId =
  | "navAccent"
  | "tabBar"
  | "homeHero"
  | "feedCard"
  | "captureViewfinder"
  | "captureRecord"
  | "profileOrb"
  | "inboxTab"
  | "discoverTag"
  | "spaceCard";

export type Override = {
  accentColor?: string;
};

type Store = {
  overrides: Partial<Record<ComponentId, Override>>;
  setOverride: (id: ComponentId, patch: Override) => void;
  resetOverride: (id: ComponentId) => void;
  resetAll: () => void;
};

const Ctx = createContext<Store>({
  overrides: {},
  setOverride: () => {},
  resetOverride: () => {},
  resetAll: () => {},
});

const STORAGE_KEY = "@vyral:theme_v1";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Partial<Record<ComponentId, Override>>>({});

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setOverrides(JSON.parse(raw));
      })
      .catch(() => {});
  }, []);

  function save(next: Partial<Record<ComponentId, Override>>) {
    setOverrides(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
  }

  return (
    <Ctx.Provider
      value={{
        overrides,
        setOverride: (id, patch) => save({ ...overrides, [id]: { ...overrides[id], ...patch } }),
        resetOverride: (id) => {
          const n = { ...overrides };
          delete n[id];
          save(n);
        },
        resetAll: () => save({}),
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useTheme = () => useContext(Ctx);

export function useAccent(id: ComponentId, fallback: string): string {
  const { overrides } = useTheme();
  return overrides[id]?.accentColor ?? fallback;
}
