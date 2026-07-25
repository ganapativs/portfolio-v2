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

type Ctx = {
  click: (freq?: number, dur?: number, type?: OscillatorType) => void;
  tick: () => void;
  thunk: () => void;
  /** Semantic alias: nav/secondary action (light, high) */
  nav: () => void;
  /** Semantic alias: primary action (confident, mid) */
  primary: () => void;
  /** Semantic alias: back/dismiss (soft, low) */
  back: () => void;
  /** Semantic alias: state toggle (theme/sound) */
  toggle: () => void;
  haptic: (ms?: number) => void;
  soundOn: boolean;
  toggleSound: () => void;
};
const FXContext = createContext<Ctx | null>(null);

export function FXProvider({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState(() => {
    if (typeof window === "undefined") return true;
    try {
      return localStorage.getItem("mg_sound") !== "0";
    } catch {
      return true;
    }
  });
  const [reduceMotion, setReduceMotion] = useState(false);
  const soundExplicit = useRef(false);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const motionMuted = reduceMotion && !soundExplicit.current;

  const ensure = () => {
    if (!ctxRef.current) {
      try {
        const w: { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext } =
          window;
        const AC = w.AudioContext ?? w.webkitAudioContext;
        if (!AC) return null;
        ctxRef.current = new AC();
      } catch {}
    }
    return ctxRef.current;
  };

  // Raw tone, no gating — the gated `click` wraps this; `toggleSound` also
  // uses it directly so enabling sound gets an audible confirmation.
  const play = useCallback((freq = 720, dur = 0.04, type: OscillatorType = "sine") => {
    const ctx = ensure();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const t = ctx.currentTime;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    o.frequency.exponentialRampToValueAtTime(freq * 0.55, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.1, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t);
    o.stop(t + dur + 0.02);
  }, []);

  const click = useCallback(
    (freq = 720, dur = 0.04, type: OscillatorType = "sine") => {
      if (!soundOn || motionMuted) return;
      play(freq, dur, type);
    },
    [soundOn, motionMuted, play],
  );

  const tick = useCallback(() => click(880, 0.025, "triangle"), [click]);
  const thunk = useCallback(() => click(380, 0.07, "sine"), [click]);
  // Semantic aliases. Map UX intent to consistent timbres so the whole site
  // clicks like one instrument rather than ad-hoc chimes.
  const nav = tick;
  const primary = useCallback(() => click(620, 0.05, "sine"), [click]);
  const back = thunk;
  const toggle = useCallback(() => click(540, 0.045, "triangle"), [click]);
  const haptic = useCallback(
    (ms = 8) => {
      // Vibration is motion — gate on reduced-motion directly, so an explicit
      // sound opt-in never re-enables it.
      if (reduceMotion) return;
      navigator.vibrate?.(ms);
    },
    [reduceMotion],
  );
  const toggleSound = useCallback(() => {
    soundExplicit.current = true;
    const next = !soundOn;
    try {
      localStorage.setItem("mg_sound", next ? "1" : "0");
    } catch {}
    // Confirm *enabling* audibly — the gated `click` can't, because the old
    // state was muted when the tap landed.
    if (next) play(540, 0.045, "triangle");
    setSoundOn(next);
  }, [soundOn, play]);

  const value = useMemo(
    () => ({ click, tick, thunk, nav, primary, back, toggle, haptic, soundOn, toggleSound }),
    [click, tick, thunk, nav, primary, back, toggle, haptic, soundOn, toggleSound],
  );

  return <FXContext.Provider value={value}>{children}</FXContext.Provider>;
}

export function useFX() {
  return useContext(FXContext);
}
