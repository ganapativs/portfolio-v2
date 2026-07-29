"use client";
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { withViewTransition, type RecolorOrigin } from "@/lib/vt";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: (origin?: RecolorOrigin) => void };
const ThemeContext = createContext<Ctx | null>(null);

function readInitialTheme(): Theme {
  // Server render: pick a default; the noFlash inline script in <head> already
  // stamped data-theme on <html> client-side before React hydrates, so the
  // initial state already matches the DOM.
  if (typeof document === "undefined") return "light";
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === "light" || fromDom === "dark") return fromDom;
  try {
    const fromStorage = localStorage.getItem("mg_theme");
    if (fromStorage === "light" || fromStorage === "dark") return fromStorage;
  } catch {}
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize from the DOM/localStorage so the first render already matches
  // the noFlash script — no clobbering on mount.
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const isFirstSync = useRef(true);
  const pendingOrigin = useRef<RecolorOrigin>(null);

  // Keep DOM + storage in sync after explicit toggles. Skip the initial pass
  // because the noFlash script has already stamped these values; rewriting on
  // mount would clobber a fresh choice from another tab. Wraps the DOM update
  // in withViewTransition so the radial reveal radiates from the click origin
  // (or crossfades when toggled via keyboard with no origin).
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const origin = pendingOrigin.current;
    pendingOrigin.current = null;
    withViewTransition(() => {
      const root = document.documentElement;
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      // Mirror the page background from the token rather than duplicating its
      // value here — the canvas is painted from <html>, and the no-flash script
      // has already written a literal there that this replaces.
      root.style.backgroundColor = getComputedStyle(root).getPropertyValue("--paper").trim();
    }, origin);
    try {
      localStorage.setItem("mg_theme", theme);
    } catch {}
  }, [theme]);

  const toggle = (origin?: RecolorOrigin) => {
    pendingOrigin.current = origin ?? null;
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const value = useMemo(() => ({ theme, toggle }), [theme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme outside provider");
  return ctx;
}
