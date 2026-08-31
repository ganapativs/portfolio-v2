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
import { sweepApply, type Band } from "@/lib/sweep";
import { INKS, INK_HEX_DARK, isInkId, DEFAULT_INK, SURFACE_HEX } from "@/lib/ink";
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

/**
 * What the band is painted with on a theme flip: the whole tray, passing over
 * the sheet, led and closed by the active ink.
 *
 * An ink pick sweeps two colours because two colours is the whole event. A
 * paper change is not about one ink: every one of the six is about to be
 * repigmented for a different ground, and a band carrying all six says that —
 * the same rising run the picker plays, in tray order.
 */
function themeBand(): Band {
  const id = typeof document === "undefined" ? DEFAULT_INK : document.documentElement.dataset.ink;
  const key = isInkId(id) ? id : DEFAULT_INK;
  // Always the lit (dark-ground) values, whichever way the flip goes. The
  // band is a translucent veil of light passing over the sheet, and light is
  // lit: sweeping the light-ground pigments — which are dark — laid a muddy
  // brown film over the paper (measured in a pinned-frame harness, not a
  // guess). The active ink leads and closes the run, the other five cross in
  // tray order between.
  const active = INK_HEX_DARK[key];
  const others = INKS.filter((i) => i.id !== key).map((i) => i.darkHex);
  return { kind: "chain", hexes: [active, ...others, active] };
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);
  // The theme currently painted on <html>. Seeded from state, which
  // readInitialTheme has already read off the DOM, so at mount the two agree
  // and the effect below has nothing to carry.
  const painted = useRef<Theme>(theme);
  const pendingOrigin = useRef<{ x: number; y: number } | null>(null);
  const { sweep } = useGlimm();

  // Keep the DOM and storage in step after an explicit toggle. A pass where the
  // DOM already carries this theme does nothing: the no-flash script has
  // written these values, and rewriting on mount would clobber a choice made in
  // another tab.
  //
  // The guard compares the painted value rather than counting passes. A
  // `useRef(true)` flag flipped inside the effect is not StrictMode safe --
  // React mounts, unmounts and mounts again, so the second pass read a flag the
  // first had already cleared and swept the whole tray on every dev load, with
  // a spurious `track({ name: "theme" })` behind it. `painted` is seeded during
  // render instead, so both passes see it agreeing with `theme` and return.
  //
  // The swap itself is handed to glimm: its band crosses the viewport and the
  // new ground appears underneath it at the midpoint. This replaced a hand
  // rolled clip-path iris, which said "this control did it" but did not say
  // what had happened. A band passing over the sheet is a press roller, which
  // is exactly the event.
  useEffect(() => {
    if (painted.current === theme) return;
    painted.current = theme;
    const origin = pendingOrigin.current;
    pendingOrigin.current = null;
    const apply = () => {
      const root = document.documentElement;
      // No data-repapering flag any more: the surface tokens are registered
      // and tween on the same 340ms clock as --accent (see tokens.css), so the
      // ink is repigmented as the ground turns and nothing can lag anything.
      // The flag existed to force a snap when the grounds could not tween.
      root.dataset.theme = theme;
      root.style.colorScheme = theme;
      // The literal from the hex mirror, not a getComputedStyle read: the
      // token is mid-tween at this moment and would hand back the ground
      // being left. The mirror is the sanctioned flat copy (sync mandate in
      // AGENTS.md), and it is what the no-flash script writes too.
      root.style.backgroundColor = SURFACE_HEX[theme].paper;
    };
    sweepApply(sweep, apply, {
      // The band is the whole tray crossing the sheet, led and closed by the
      // active ink. See themeBand above.
      band: themeBand(),
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
