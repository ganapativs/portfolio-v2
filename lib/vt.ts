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
// swap crossfades. When an `origin` (in viewport coords) is supplied, CSS
// exposes it as `--vt-x` / `--vt-y` so the wipe can radiate from the clicked
// control rather than the page center — that's the bit that gives the theme
// toggle its tactile feel.
//
// Ink and press-run changes deliberately do NOT come through here: those are
// @property colour interpolations (340ms, in oklch) and a view-transition
// snapshot would freeze the page and crossfade over the top of the tween.
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

  // `ready` rejects whenever the transition is skipped or aborted — a second
  // toggle landing mid-flight, a hidden tab, or the browser deciding the
  // snapshot is invalid. Nothing below is guaranteed to attach a handler (the
  // WAAPI chain is fallback-only and origin-only), so claim the rejection here
  // or it surfaces as an unhandled rejection:
  //   InvalidStateError: Transition was aborted because of invalid state
  t.ready.catch(() => {});

  // Iris reveal strategy:
  //   1. Primary — CSS animation against an `@property`-typed `<length>`
  //      (`--vt-r-now`). The typed property makes the radius a first-class
  //      animatable scalar; `clip-path: circle(var(--vt-r-now) at X Y)`
  //      re-evaluates each frame and sweeps at constant velocity.
  //   2. Fallback — Web Animations API on `::view-transition-new(root)` with
  //      fully resolved pixel keyframes, used only when `@property` isn't
  //      supported. Without it, `clip-path` keyframes containing a `var()`
  //      fall back to discrete interpolation in some engines and snap
  //      mid-flight; WAAPI sidesteps that because keyframe values are literal.
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
