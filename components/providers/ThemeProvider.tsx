"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { withViewTransition, type RecolorOrigin } from "@/lib/vt";
import { track } from "@/lib/analytics";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: (origin?: RecolorOrigin) => void };
const ThemeContext = createContext<Ctx | null>(null);

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === "light" || fromDom === "dark") return fromDom;
  try {
    const stored = localStorage.getItem("mg_theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  // Seeded during render so StrictMode's remount cannot sweep on load — it
  // compares the painted value, it does not count passes.
  const painted = useRef<Theme>(theme);
  const pendingOrigin = useRef<RecolorOrigin>(null);

  useEffect(() => {
    if (painted.current === theme) return;
    painted.current = theme;
    const origin = pendingOrigin.current;
    pendingOrigin.current = null;
    withViewTransition(() => {
      const root = document.documentElement;
      // Snap the ink with the ground. See :root[data-repapering] in tokens.css.
      root.dataset.repapering = "";
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      root.style.backgroundColor = getComputedStyle(root).getPropertyValue("--paper").trim();
      setTimeout(() => {
        delete root.dataset.repapering;
      }, 0);
    }, origin);
    try {
      localStorage.setItem("mg_theme", theme);
    } catch {}
    track({ name: "theme", to: theme, via: origin ? "pointer" : "key" });
  }, [theme]);

  const toggle = useCallback((origin?: RecolorOrigin) => {
    pendingOrigin.current = origin ?? null;
    setTheme((t) => (t === "light" ? "dark" : "light"));
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme outside provider");
  return ctx;
}
