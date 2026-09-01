type ViewTransitionDoc = Document & {
  startViewTransition?: (cb: () => void) => {
    finished: Promise<void>;
    ready: Promise<void>;
  };
};

export type RecolorOrigin = { x: number; y: number } | null;

let vtGen = 0;

/**
 * Run `cb` inside a View Transitions iris that opens from `origin`.
 *
 * The new sheet is a feathered radial mask from `origin`, so the two papers
 * dissolve across the edge. A hard clip jumped ~25px a frame on this
 * drawing and read as skipped frames. Ink stays on the band.
 */
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

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const x = origin?.x ?? vw / 2;
  const y = origin?.y ?? vh / 2;
  const feather = parseFloat(getComputedStyle(r).getPropertyValue("--vt-feather")) || 160;
  const rad = Math.ceil(Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y)) + feather);
  r.classList.add("vt-recolor-radial");
  r.style.setProperty("--vt-x", `${x}px`);
  r.style.setProperty("--vt-y", `${y}px`);
  r.style.setProperty("--vt-r", `${rad}px`);

  const t = d.startViewTransition(cb);
  t.ready.catch(() => {});

  if (typeof CSS === "undefined" || typeof CSS.registerProperty !== "function") {
    const dur = parseFloat(getComputedStyle(r).getPropertyValue("--dur-iris")) || 720;
    t.ready
      .then(() => {
        const frames = [0, 0.25, 0.5, 0.75, 1].map((p) => {
          const now = rad * p;
          const inner = Math.max(0, now - feather);
          const mid = Math.max(0, now - 48);
          const g = `radial-gradient(circle at ${x}px ${y}px, #000 0, #000 ${inner}px, rgb(0 0 0 / 0.45) ${mid}px, transparent ${now}px)`;
          return { maskImage: g, webkitMaskImage: g };
        });
        document.documentElement.animate(frames, {
          duration: dur,
          easing: "cubic-bezier(0.45, 0.02, 0.18, 1)",
          fill: "forwards",
          pseudoElement: "::view-transition-new(root)",
        });
      })
      .catch(() => {});
  }

  const cleanup = () => {
    if (myGen !== vtGen) return;
    r.classList.remove("vt-recolor", "vt-recolor-radial");
  };
  t.finished.then(cleanup, cleanup);
}
