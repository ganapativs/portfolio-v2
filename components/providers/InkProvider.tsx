"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  DEFAULT_INK,
  INKS,
  MODES,
  STORAGE_KEYS,
  isInkId,
  isMode,
  type InkId,
  type Mode,
} from "@/lib/ink";
import { useFX } from "@/components/providers/FXProvider";

type Ctx = {
  ink: InkId;
  mode: Mode;
  setInk: (id: InkId) => void;
  setMode: (next: Mode) => void;
  cycleMode: () => void;
  cycleInk: (dir?: 1 | -1) => void;
  inks: typeof INKS;
};

const InkContext = createContext<Ctx | null>(null);

// Read from the DOM first. The no-flash script in app/layout.tsx has already
// stamped both attributes before React sees the page, so the first render
// matches what is on screen and mounting never causes a repaint.
function readInk(): InkId {
  if (typeof document === "undefined") return DEFAULT_INK;
  const fromDom = document.documentElement.dataset.ink;
  if (isInkId(fromDom)) return fromDom;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.ink);
    if (isInkId(stored)) return stored;
  } catch {}
  return DEFAULT_INK;
}

function readMode(): Mode {
  if (typeof document === "undefined") return "colorful";
  const fromDom = document.documentElement.dataset.mode;
  if (isMode(fromDom)) return fromDom;
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.mode);
    if (isMode(stored)) return stored;
  } catch {}
  return "colorful";
}

export function InkProvider({ children }: { children: React.ReactNode }) {
  const [ink, setInkState] = useState<InkId>(DEFAULT_INK);
  const [mode, setModeState] = useState<Mode>("colorful");
  const [hydrated, setHydrated] = useState(false);
  const fx = useFX();

  useEffect(() => {
    setInkState(readInk());
    setModeState(readMode());
    setHydrated(true);
  }, []);

  // No withViewTransition here, deliberately. An ink change is a 340ms oklch
  // interpolation of the registered colour properties (styles/press/tokens.css);
  // a view transition would freeze a snapshot of the page and crossfade over
  // the top of that tween, which reads as a stutter. Theme changes are the
  // opposite case and do go through the iris — see ThemeProvider.
  useEffect(() => {
    if (!hydrated) return;
    const root = document.documentElement;
    root.dataset.ink = ink;
    root.dataset.mode = mode;
    try {
      localStorage.setItem(STORAGE_KEYS.ink, ink);
      localStorage.setItem(STORAGE_KEYS.mode, mode);
    } catch {}
  }, [ink, mode, hydrated]);

  // Every one of these chimes *outside* the state updater. An updater passed to
  // setState has to be pure — React is free to call it more than once, and to
  // call it during a render — so a beep in there fires at unpredictable times
  // and warns about updating an unmounted component.
  const setInk = useCallback(
    (id: InkId) => {
      if (id !== ink) {
        fx?.click(INKS.find((i) => i.id === id)?.freq ?? 660, 0.05, "sine");
        fx?.haptic(6);
      }
      setInkState(id);
    },
    [ink, fx],
  );

  const setMode = useCallback(
    (next: Mode) => {
      if (next !== mode) {
        fx?.toggle();
        fx?.haptic(6);
      }
      setModeState(next);
    },
    [mode, fx],
  );

  const cycleMode = useCallback(() => {
    setMode(MODES[(MODES.indexOf(mode) + 1) % MODES.length]);
  }, [mode, setMode]);

  const cycleInk = useCallback(
    (dir: 1 | -1 = 1) => {
      const i = INKS.findIndex((x) => x.id === ink);
      setInk(INKS[(i + dir + INKS.length) % INKS.length].id);
    },
    [ink, setInk],
  );

  const value = useMemo<Ctx>(
    () => ({ ink, mode, setInk, setMode, cycleMode, cycleInk, inks: INKS }),
    [ink, mode, setInk, setMode, cycleMode, cycleInk],
  );

  return <InkContext.Provider value={value}>{children}</InkContext.Provider>;
}

export function useInk() {
  const ctx = useContext(InkContext);
  if (!ctx) throw new Error("useInk must be used inside <InkProvider>");
  return ctx;
}
