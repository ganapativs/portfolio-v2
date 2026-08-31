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
  DEFAULT_INK,
  INK_HEX,
  INK_HEX_DARK,
  INKS,
  STORAGE_KEYS,
  isInkId,
  type InkId,
} from "@/lib/ink";
import { useFX } from "@/components/providers/FXProvider";
import { useGlimm } from "glimm/react";
import { sweepApply } from "@/lib/sweep";
import { track } from "@/lib/analytics";

/** Which surface the pick came from. Today there is one: the header tray. */
export type InkVia = "tray" | "key";
type Origin = { x: number; y: number } | null;

type Ctx = {
  ink: InkId;
  setInk: (id: InkId, origin?: Origin, via?: InkVia) => void;
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
  // The ink that is currently painted, so the sweep band can be a real
  // transition from the old ink to the new one rather than a flat wash of the
  // destination. Held in a ref: the effect below needs the previous value at
  // the moment the new one lands.
  const painted = useRef<InkId>(DEFAULT_INK);
  // The origin of the pick that produced the ink now in state, held next to it
  // so the sync effect knows whether a pointer or a key did it. In state rather
  // than a ref because two picks of the same swatch are the same `ink` value,
  // and a ref would leave the second one holding the first one's origin.
  const [origin, setOrigin] = useState<Origin>(null);
  const { sweep } = useGlimm();

  useEffect(() => {
    const initial = readInk();
    painted.current = initial;
    setInkState(initial);
    setHydrated(true);
  }, []);

  // Both palette changes on this site are carried by the same glimm band, so an
  // ink pick and a paper flip read as the same kind of event. The band is
  // painted from the ink being replaced to the ink replacing it, which makes
  // the sweep itself the interpolation rather than something laid over one.
  //
  // A keyboard pick sweeps top to bottom instead of left to right. There is no
  // point on the page behind a number key, and saying so with the axis is
  // better than a wipe that pretends to start somewhere.
  useEffect(() => {
    if (!hydrated) return;
    const from: InkId = painted.current;
    painted.current = ink;
    const write = () => {
      document.documentElement.dataset.ink = ink;
    };
    if (from === ink) write();
    else {
      const dark = document.documentElement.dataset.theme === "dark";
      const hex = dark ? INK_HEX_DARK : INK_HEX;
      sweepApply(sweep, write, {
        band: { kind: "pair", hexes: [hex[from], hex[ink]] },
        direction: origin ? "ltr" : "ttb",
      });
    }
    try {
      localStorage.setItem(STORAGE_KEYS.ink, ink);
    } catch {}
  }, [ink, origin, hydrated, sweep]);

  const fx = useFX();

  // The chime is outside the state updater on purpose. An updater passed to
  // setState has to be pure — React is free to call it more than once, and
  // during a render — so a beep in there fires at unpredictable times.
  const setInk = useCallback(
    (id: InkId, from: Origin = null, via: InkVia = "tray") => {
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
