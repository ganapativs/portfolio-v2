// Six "hue" accents tuned to a C-major pentatonic spread (C5–B5) so
// successive picks harmonise. Two "pure" extremes — paper (white) and
// ink (black) — sit beside them as polarity overrides: when picked, the
// page collapses to a two-tone monochrome (pure bg + opposite fg) and
// ignores the active theme. Each frequency maps to a distinct musical
// pitch so the picker also doubles as a tiny chime.
export const ACCENTS = [
  {
    id: "terracotta",
    label: "monsoon clay",
    kind: "hue",
    c: "#D88762",
    soft: "rgba(216,135,98,0.14)",
    freq: 659.25,
  }, // E5
  {
    id: "saffron",
    label: "turmeric milk",
    kind: "hue",
    c: "#E8B86B",
    soft: "rgba(232,184,107,0.16)",
    freq: 783.99,
  }, // G5
  {
    id: "sage",
    label: "neem leaf",
    kind: "hue",
    c: "#8FA37A",
    soft: "rgba(143,163,122,0.16)",
    freq: 880.0,
  }, // A5
  {
    id: "rose",
    label: "gulkand rose",
    kind: "hue",
    c: "#C97B7B",
    soft: "rgba(201,123,123,0.16)",
    freq: 987.77,
  }, // B5
  {
    id: "plum",
    label: "jamun",
    kind: "hue",
    c: "#6E5167",
    soft: "rgba(110,81,103,0.18)",
    freq: 587.33,
  }, // D5
  {
    id: "coffee",
    label: "filter coffee",
    kind: "hue",
    c: "#7C4628",
    soft: "rgba(124,70,40,0.14)",
    freq: 523.25,
  }, // C5
  {
    id: "paper",
    label: "rice paper",
    kind: "pure",
    polarity: "light",
    c: "#000000",
    soft: "rgba(0,0,0,0.06)",
    freq: 1318.51,
  }, // E6 — bright bell
  {
    id: "ink",
    label: "lamp black",
    kind: "pure",
    polarity: "dark",
    c: "#FFFFFF",
    soft: "rgba(255,255,255,0.08)",
    freq: 130.81,
  }, // C3 — deep gong
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];
export type AccentDef = (typeof ACCENTS)[number];
// The 6 hue accents (excluding the two `pure` polarity overrides). Used as the
// rotating brand-color token on cards/tickets/blog posts.
export type HueAccentId = Extract<AccentDef, { kind: "hue" }>["id"];

export const DEFAULT_ACCENT: AccentId = "terracotta";

const HUE_ACCENTS = ACCENTS.filter((a) => a.kind === "hue") as ReadonlyArray<
  Extract<AccentDef, { kind: "hue" }>
>;

const HUE_ACCENT_IDS: readonly HueAccentId[] = HUE_ACCENTS.map((a) => a.id);

// Color-only map keyed by hue id. Used by static OG/Twitter image renderers
// where we can't read CSS custom properties at edge-render time.
export const HUE_HEX: Record<HueAccentId, string> = Object.fromEntries(
  HUE_ACCENTS.map((a) => [a.id, a.c]),
) as Record<HueAccentId, string>;

export const accentAt = (i: number): HueAccentId => HUE_ACCENT_IDS[i % HUE_ACCENT_IDS.length];

export function getAccent(id: string): AccentDef {
  return ACCENTS.find((x) => x.id === id) ?? ACCENTS[0];
}

export function isPureAccent(id: string): boolean {
  const a = ACCENTS.find((x) => x.id === id);
  return a?.kind === "pure";
}

export function applyAccent(id: string) {
  const a = getAccent(id);
  const r = document.documentElement;
  r.style.setProperty("--accent", a.c);
  r.style.setProperty("--accent-soft", a.soft);
  r.style.setProperty(
    "--accent-hover",
    a.kind === "pure" ? a.c : `color-mix(in oklab, ${a.c} 78%, black)`,
  );
  r.style.setProperty("--link", a.c);
  r.style.setProperty("--link-hover", a.c);
  r.style.setProperty("--highlight", a.c);
  r.style.setProperty("--accent-live", a.c);
  r.style.setProperty("--accent-live-soft", a.soft);

  if (a.kind === "pure") {
    r.dataset.pure = a.id;
    // Pure modes carry their own polarity; record it for CSS so meta-color
    // (theme-color, scrollbar) can match without us touching ThemeProvider state.
    r.dataset.purePolarity = a.polarity;
  } else {
    delete r.dataset.pure;
    delete r.dataset.purePolarity;
  }
}

export function applyMono(on: boolean) {
  const r = document.documentElement;
  if (on) r.dataset.mono = "true";
  else delete r.dataset.mono;
}

type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => {
    finished: Promise<void>;
    ready: Promise<void>;
  };
};

export type RecolorOrigin = { x: number; y: number } | null;

// Generation counter so a stale cleanup (from a transition that got skipped
// when a new one was started before its `finished` promise resolved) can't
// strip vt-recolor classes off the live transition.
let vtGen = 0;

// `withViewTransition` runs `cb` inside a View Transitions API session so the
// color swap crossfades. When an `origin` (in viewport coords) is supplied,
// CSS exposes it as `--vt-x` / `--vt-y` so the recolor wipe can radiate from
// the clicked chip rather than the page center — that's the bit that gives
// accent picks their tactile, "wow" feel.
export function withViewTransition(cb: () => void, origin?: RecolorOrigin) {
  if (typeof document === "undefined") return cb();
  const d = document as ViewTransitionDoc;
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !d.startViewTransition) {
    cb();
    return;
  }
  const r = document.documentElement;
  const myGen = ++vtGen;
  r.classList.add("vt-recolor");

  let radialOrigin: { x: number; y: number; r: number } | null = null;
  if (origin) {
    // Exact end radius: distance from origin to the farthest viewport corner,
    // so the iris stops the moment it covers the screen rather than painting
    // far past it.
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const dx = Math.max(origin.x, vw - origin.x);
    const dy = Math.max(origin.y, vh - origin.y);
    const radius = Math.hypot(dx, dy);
    radialOrigin = { x: origin.x, y: origin.y, r: Math.ceil(radius) };
    r.classList.add("vt-recolor-radial");
    r.style.setProperty("--vt-x", `${radialOrigin.x}px`);
    r.style.setProperty("--vt-y", `${radialOrigin.y}px`);
    r.style.setProperty("--vt-r", `${radialOrigin.r}px`);
  } else {
    r.classList.remove("vt-recolor-radial");
  }

  const t = d.startViewTransition(cb);

  // Iris reveal strategy:
  //   1. Primary — CSS animation against an `@property`-typed `<length>`
  //      (`--vt-r-now`) declared in globals.css. The typed property makes
  //      the radius a first-class animatable scalar; the engine interpolates
  //      it smoothly and `clip-path: circle(var(--vt-r-now) at X Y)`
  //      re-evaluates each frame. This path produced the smoothest visible
  //      result in side-by-side testing — the wipe starts cleanly from the
  //      chip click point and sweeps at constant velocity to the edge.
  //   2. Fallback — Web Animations API on `::view-transition-new(root)` with
  //      fully resolved pixel keyframes. Used only when `@property` isn't
  //      supported (`CSS.registerProperty` is the runtime feature gate; both
  //      land together in every engine). Without `@property`, `clip-path`
  //      keyframes containing a `var()` fall back to discrete interpolation
  //      in some engines, producing a mid-flight snap. WAAPI sidesteps that
  //      because keyframe values are literal at parse time.
  if (radialOrigin) {
    const atPropertySupported =
      typeof CSS !== "undefined" && typeof CSS.registerProperty === "function";
    if (!atPropertySupported) {
      const { x, y, r: rad } = radialOrigin;
      t.ready
        .then(() => {
          document.documentElement.animate(
            [
              { clipPath: `circle(0px at ${x}px ${y}px)` },
              { clipPath: `circle(${rad}px at ${x}px ${y}px)` },
            ],
            {
              duration: 600,
              easing: "cubic-bezier(0.33, 1, 0.68, 1)",
              fill: "forwards",
              pseudoElement: "::view-transition-new(root)",
            },
          );
        })
        .catch(() => {});
    }
  }

  const cleanup = () => {
    if (myGen !== vtGen) return;
    r.classList.remove("vt-recolor");
    r.classList.remove("vt-recolor-radial");
  };
  t.finished.then(cleanup, cleanup);
}
