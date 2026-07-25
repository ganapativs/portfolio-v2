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
import {
  ACCENTS,
  DEFAULT_ACCENT,
  applyAccent,
  applyMono,
  isPureAccent,
  withViewTransition,
  type AccentId,
  type RecolorOrigin,
} from "@/lib/accents";
import { useFX } from "@/components/providers/FXProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useShortcutRegistry } from "@/components/shortcuts/ShortcutProvider";

export type Mode = "colorful" | "mono" | "plain";

type Ctx = {
  accent: AccentId;
  mono: boolean;
  isPure: boolean;
  mode: Mode;
  setAccent: (id: AccentId, origin?: RecolorOrigin) => void;
  setMono: (on: boolean, origin?: RecolorOrigin) => void;
  toggleMono: (origin?: RecolorOrigin) => void;
  setMode: (next: Mode, origin?: RecolorOrigin) => void;
  cycleMode: (origin?: RecolorOrigin) => void;
  accents: typeof ACCENTS;
};

const AccentContext = createContext<Ctx | null>(null);

function readStoredAccent(): AccentId {
  try {
    const stored = localStorage.getItem("mg_accent");
    if (stored && ACCENTS.some((a) => a.id === stored)) return stored as AccentId;
  } catch {}
  return DEFAULT_ACCENT;
}

function readStoredMono(): boolean {
  try {
    return localStorage.getItem("mg_mono") === "true";
  } catch {
    return false;
  }
}

export function AccentProvider({ children }: { children: React.ReactNode }) {
  const [accent, setAccentState] = useState<AccentId>(DEFAULT_ACCENT);
  const [mono, setMonoState] = useState<boolean>(false);
  const [hydrated, setHydrated] = useState(false);
  // Most recent click origin (chip click → circular reveal centroid). Cleared
  // by the unified effect once consumed so keyboard-driven changes don't reuse
  // a stale mouse position.
  const pendingOrigin = useRef<RecolorOrigin>(null);
  const fx = useFX();
  const reg = useShortcutRegistry();
  const { theme: currentTheme } = useTheme();

  useEffect(() => {
    setAccentState(readStoredAccent());
    setMonoState(readStoredMono());
    setHydrated(true);
  }, []);

  // Track last non-pure accent so leaving plain mode can restore it.
  const lastHueRef = useRef<AccentId>(DEFAULT_ACCENT);
  useEffect(() => {
    if (!isPureAccent(accent)) lastHueRef.current = accent;
  }, [accent]);

  // Skip the next view-transition pass when accent change is theme-driven
  // (plain-mode paper↔ink swap). The theme toggle already wraps the recolor
  // in its own withViewTransition; running a second one stacks transitions
  // and produces a crossfade-without-iris on top of the theme iris.
  const skipNextTransition = useRef(false);

  useEffect(() => {
    if (!hydrated) return;
    const origin = pendingOrigin.current;
    pendingOrigin.current = null;
    if (skipNextTransition.current) {
      skipNextTransition.current = false;
      applyAccent(accent);
      applyMono(mono);
    } else {
      withViewTransition(() => {
        applyAccent(accent);
        applyMono(mono);
      }, origin);
    }
    try {
      localStorage.setItem("mg_accent", accent);
      localStorage.setItem("mg_mono", mono ? "true" : "false");
    } catch {}
  }, [accent, mono, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (!isPureAccent(accent)) return;
    const want: AccentId = currentTheme === "dark" ? "ink" : "paper";
    if (accent !== want) {
      pendingOrigin.current = null;
      skipNextTransition.current = true;
      setAccentState(want);
    }
  }, [currentTheme, accent, hydrated]);

  const setAccent = useCallback((id: AccentId, origin?: RecolorOrigin) => {
    pendingOrigin.current = origin ?? null;
    setAccentState(id);
  }, []);
  const setMono = useCallback((on: boolean, origin?: RecolorOrigin) => {
    pendingOrigin.current = origin ?? null;
    setMonoState(on);
  }, []);
  const toggleMono = useCallback((origin?: RecolorOrigin) => {
    pendingOrigin.current = origin ?? null;
    setMonoState((m) => !m);
  }, []);

  const isPure = isPureAccent(accent);
  const mode: Mode = isPure ? "plain" : mono ? "mono" : "colorful";

  const setMode = useCallback(
    (next: Mode, origin?: RecolorOrigin) => {
      pendingOrigin.current = origin ?? null;
      if (next === "plain") {
        const want: AccentId = currentTheme === "dark" ? "ink" : "paper";
        setAccentState(want);
      } else {
        if (isPureAccent(accent)) {
          setAccentState(lastHueRef.current);
        }
        setMonoState(next === "mono");
      }
    },
    [currentTheme, accent],
  );

  const cycleMode = useCallback(
    (origin?: RecolorOrigin) => {
      const cur: Mode = isPureAccent(accent) ? "plain" : mono ? "mono" : "colorful";
      const next: Mode = cur === "colorful" ? "mono" : cur === "mono" ? "plain" : "colorful";
      setMode(next, origin);
    },
    [accent, mono, setMode],
  );

  // Component-level shortcuts (chips, theme pill, mode toggle) own their own
  // registrations so the Shift-hold hint floats can anchor over them. Nothing
  // is registered globally from this provider.
  void fx;
  void reg;

  const value = useMemo<Ctx>(
    () => ({
      accent,
      mono,
      isPure,
      mode,
      setAccent,
      setMono,
      toggleMono,
      setMode,
      cycleMode,
      accents: ACCENTS,
    }),
    [accent, mono, isPure, mode, setAccent, setMono, toggleMono, setMode, cycleMode],
  );

  return <AccentContext.Provider value={value}>{children}</AccentContext.Provider>;
}

export function useAccent() {
  const ctx = useContext(AccentContext);
  if (!ctx) throw new Error("useAccent must be used inside <AccentProvider>");
  return ctx;
}
