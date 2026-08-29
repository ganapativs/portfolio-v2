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

/**
 * The drawing-office cue set. Every sound is a thing happening to paper or to
 * an instrument, and none of them is a notification:
 *
 *   tick     a pen touching down — hover, a detent passing, a value changing
 *   press    a key going down; release is the same key coming back up
 *   clack    a switch thrown, two-part: the theme and the sound toggle
 *   chime    two notes, for something completing
 *   blip     a rising sweep, for something copied
 *   pluck    a pitched note, for the six inks and the portrait
 *
 * `tick` is throttled to 80ms inside the provider rather than at the call site,
 * because it is fired from delegated pointer handlers that can run several
 * times per frame.
 */
type Ctx = {
  click: (freq?: number, dur?: number, type?: OscillatorType) => void;
  tick: () => void;
  thunk: () => void;
  press: () => void;
  release: () => void;
  clack: () => void;
  chime: () => void;
  blip: () => void;
  pluck: (freq?: number) => void;
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
  // Starts on, then reads the stored preference in an effect rather than in the
  // initialiser. The server has no localStorage, so a reader who muted the site
  // last visit would otherwise get a server render that says "on" and a first
  // client render that says "off" — a hydration mismatch on the toggle's own
  // aria-pressed. One frame of the wrong icon is cheaper than that, and nothing
  // can make a sound in that frame anyway.
  const [soundOn, setSoundOn] = useState(true);
  useEffect(() => {
    try {
      if (localStorage.getItem("mg_sound") === "0") setSoundOn(false);
    } catch {}
  }, []);
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
  //
  // `slide` sweeps the pitch to a second frequency over the life of the note.
  // Without it every cue is the same falling shape and the set stops being
  // legible as six different events.
  const play = useCallback(
    (freq = 720, dur = 0.04, type: OscillatorType = "sine", slide?: number) => {
      const ctx = ensure();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(slide ?? freq * 0.55, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.1, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + dur + 0.02);
    },
    [],
  );

  const click = useCallback(
    (freq = 720, dur = 0.04, type: OscillatorType = "sine", slide?: number) => {
      if (!soundOn || motionMuted) return;
      play(freq, dur, type, slide);
    },
    [soundOn, motionMuted, play],
  );

  // Throttled here rather than at the call sites: `tick` is fired by delegated
  // pointerover handlers that can run several times in one frame, and a stack
  // of identical 25ms notes is a buzz, not a tick.
  const lastTick = useRef(0);
  const tick = useCallback(() => {
    const now = performance.now();
    if (now - lastTick.current < 80) return;
    lastTick.current = now;
    click(1500, 0.03, "sine");
  }, [click]);
  const press = useCallback(() => click(240, 0.05, "square"), [click]);
  const release = useCallback(() => click(340, 0.04, "square"), [click]);
  const clack = useCallback(() => {
    click(190, 0.05, "square");
    window.setTimeout(() => click(520, 0.03, "square"), 40);
  }, [click]);
  const chime = useCallback(() => {
    click(660, 0.14, "sine");
    window.setTimeout(() => click(990, 0.18, "sine"), 90);
  }, [click]);
  const blip = useCallback(() => click(880, 0.09, "sine", 1400), [click]);
  const pluck = useCallback((freq = 520) => click(freq, 0.1, "sine", freq - 40), [click]);
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
    () => ({
      click,
      tick,
      thunk,
      press,
      release,
      clack,
      chime,
      blip,
      pluck,
      nav,
      primary,
      back,
      toggle,
      haptic,
      soundOn,
      toggleSound,
    }),
    [
      click,
      tick,
      thunk,
      press,
      release,
      clack,
      chime,
      blip,
      pluck,
      nav,
      primary,
      back,
      toggle,
      haptic,
      soundOn,
      toggleSound,
    ],
  );

  return <FXContext.Provider value={value}>{children}</FXContext.Provider>;
}

export function useFX() {
  return useContext(FXContext);
}
