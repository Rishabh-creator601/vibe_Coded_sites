"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { patch } from "@/lib/api";
import { useAuth } from "./useAuth";
import type { Settings } from "@/types";

const KEY = "ts_settings";
const DEFAULTS: Settings = { theme: "dark", sound: false, fontSize: "md" };

interface SettingsValue {
  settings: Settings;
  update: (partial: Partial<Settings>) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

function apply(s: Settings) {
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.dataset.font = s.fontSize;
}

/** Guests keep settings in localStorage; logged-in users also save them to their account. */
export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>(DEFAULTS);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (saved) setSettings({ ...DEFAULTS, ...saved });
    } catch {
      /* ignore bad data */
    }
  }, []);

  useEffect(() => {
    if (user) setSettings(user.settings);
  }, [user]);

  useEffect(() => apply(settings), [settings]);

  const update = useCallback(
    (partial: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...partial };
        localStorage.setItem(KEY, JSON.stringify(next));
        return next;
      });
      if (user) patch("/users/me", { settings: partial }).catch(() => {});
    },
    [user],
  );

  const value = useMemo(() => ({ settings, update }), [settings, update]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used inside SettingsProvider");
  return ctx;
}
