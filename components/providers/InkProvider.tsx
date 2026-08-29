"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_INK, INKS, STORAGE_KEYS, isInkId, type InkId } from "@/lib/ink";
import { useFX } from "@/components/providers/FXProvider";
import { withViewTransition, type RecolorOrigin } from "@/lib/vt";
import { track } from "@/lib/analytics";

/** Which surface the pick came from. Today there is one: the header tray. */
export type InkVia = "tray" | "key";

type Ctx = {
  ink: InkId;
  setInk: (id: InkId, origin?: RecolorOrigin, via?: InkVia) => void;
  cycleInk: (dir?: 1 | -1) => void;
  inks: typeof INKS;
};

const InkContext = createContext<Ctx | null>(null);

// Read from the DOM first. The no-flash script in app/layout.tsx has already
// stamped the attribute before React sees the page, so the first render matches
// what is on screen and mounting never causes a repaint.
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

export function InkProvider({ children }: { children: React.ReactNode }) {
  const [ink, setInkState] = useState<InkId>(DEFAULT_INK);
  const [hydrated, setHydrated] = useState(false);
  // The origin of the pick that produced the ink now in state, held next to it
  // so the sync effect below knows whether to open an iris or let the tokens
  // tween. Kept in state rather than a ref: two picks of the same swatch in a
  // row are the same `ink` value, and a ref would leave the second one holding
  // the first one's origin.
  const [origin, setOrigin] = useState<RecolorOrigin>(null);

  useEffect(() => {
    setInkState(readInk());
    setHydrated(true);
  }, []);

  // Two ways an ink arrives, and they are deliberately different.
  //
  // Picked with a pointer: the iris opens from the swatch, exactly as the theme
  // toggle does. The reader pressed a specific place on the page, so the change
  // comes from that place. lib/vt.ts kills the token transition for the length
  // of the reveal, so the ink is already the new one behind the wipe.
  //
  // Picked from the keyboard (1-6): no iris, because there is no point on the
  // page to open one from. The registered --accent property interpolates over
  // 340ms instead and the whole drawing re-inks in place.
  useEffect(() => {
    if (!hydrated) return;
    const write = () => {
      document.documentElement.dataset.ink = ink;
    };
    if (origin) withViewTransition(write, origin);
    else write();
    try {
      localStorage.setItem(STORAGE_KEYS.ink, ink);
    } catch {}
  }, [ink, origin, hydrated]);

  const fx = useFX();

  // The chime is outside the state updater on purpose. An updater passed to
  // setState has to be pure — React is free to call it more than once, and
  // during a render — so a beep in there fires at unpredictable times.
  const setInk = useCallback(
    (id: InkId, from: RecolorOrigin = null, via: InkVia = "tray") => {
      if (id !== ink) {
        // Six inks, six pitches, rising with the tray order. Playing the picker
        // left to right plays a scale, which is the point.
        fx?.pluck(INKS.find((i) => i.id === id)?.freq ?? 520);
        fx?.haptic(6);
        track({ name: "ink", id, via });
      }
      setOrigin(from);
      setInkState(id);
    },
    [ink, fx],
  );

  const cycleInk = useCallback(
    (dir: 1 | -1 = 1) => {
      const i = INKS.findIndex((x) => x.id === ink);
      setInk(INKS[(i + dir + INKS.length) % INKS.length].id, null, "key");
    },
    [ink, setInk],
  );

  const value = useMemo<Ctx>(
    () => ({ ink, setInk, cycleInk, inks: INKS }),
    [ink, setInk, cycleInk],
  );

  return <InkContext.Provider value={value}>{children}</InkContext.Provider>;
}

export function useInk() {
  const ctx = useContext(InkContext);
  if (!ctx) throw new Error("useInk must be used inside <InkProvider>");
  return ctx;
}
