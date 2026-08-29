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
import { useGlimm } from "glimm/react";
import { accentPair } from "glimm";
import { sweepApply } from "@/lib/sweep";
import { INK_HEX, INK_HEX_DARK, isInkId, DEFAULT_INK } from "@/lib/ink";
import { track } from "@/lib/analytics";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: (origin?: { x: number; y: number } | null) => void };
const ThemeContext = createContext<Ctx | null>(null);

function readInitialTheme(): Theme {
  // Server render: pick a default. The no-flash script in <head> has already
  // stamped data-theme on <html> client-side before React hydrates, so the
  // first client render already matches the DOM.
  if (typeof document === "undefined") return "light";
  const fromDom = document.documentElement.dataset.theme;
  if (fromDom === "light" || fromDom === "dark") return fromDom;
  try {
    const stored = localStorage.getItem("mg_theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch {}
  return "light";
}

/** The active ink's two values, which is what the sweep band is painted with. */
function inkEnds() {
  const id = typeof document === "undefined" ? DEFAULT_INK : document.documentElement.dataset.ink;
  const key = isInkId(id) ? id : DEFAULT_INK;
  return [INK_HEX[key], INK_HEX_DARK[key]] as const;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  const isFirstSync = useRef(true);
  const pendingOrigin = useRef<{ x: number; y: number } | null>(null);
  const { sweep } = useGlimm();

  // Keep the DOM and storage in step after an explicit toggle. The first pass is
  // skipped because the no-flash script has already written these values, and
  // rewriting on mount would clobber a choice made in another tab.
  //
  // The swap itself is handed to glimm: its band crosses the viewport and the
  // new ground appears underneath it at the midpoint. This replaced a hand
  // rolled clip-path iris, which said "this control did it" but did not say
  // what had happened. A band passing over the sheet is a press roller, which
  // is exactly the event.
  useEffect(() => {
    if (isFirstSync.current) {
      isFirstSync.current = false;
      return;
    }
    const origin = pendingOrigin.current;
    pendingOrigin.current = null;
    const apply = () => {
      const root = document.documentElement;
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      // Mirror the ground from the token rather than duplicating its value: the
      // canvas is painted from <html>, and the no-flash script wrote a literal
      // there that this replaces.
      root.style.backgroundColor = getComputedStyle(root).getPropertyValue("--paper").trim();
    };
    const [light, dark] = inkEnds();
    sweepApply(sweep, apply, {
      // The band is the live ink travelling between its two grounds, so the
      // colour that sweeps across is the one the reader chose.
      palette: accentPair(theme === "dark" ? light : dark, theme === "dark" ? dark : light),
      // Left to right on a pointer press, top to bottom from the keyboard. The
      // keyboard has no position on the page, and a different axis is a more
      // honest way to say so than a wipe pretending to start somewhere.
      direction: origin ? "ltr" : "ttb",
    });
    try {
      localStorage.setItem("mg_theme", theme);
    } catch {}
    // Reported here rather than from `toggle`: this runs only on a real change
    // (the first-sync guard swallowed the mount) and `theme` is the value that
    // won rather than the one the handler closed over. An origin exists only
    // when a pointer landed on a control, which is the cheapest honest read of
    // how the flip was made.
    track({ name: "theme", to: theme, via: origin ? "pointer" : "key" });
  }, [theme, sweep]);

  const toggle = useCallback((origin?: { x: number; y: number } | null) => {
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
