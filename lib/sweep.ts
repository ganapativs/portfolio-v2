import type { SweepFn, SweepHandle } from "glimm/react";

/**
 * How the band is coloured, as hexes rather than as a built palette.
 *
 * `accentPair` pins its two endpoints exactly. An ink pick is those two
 * inks. A paper flip is the iris in `lib/vt.ts`, not a band.
 */
export type Band = { kind: "pair"; hexes: [string, string] };

/**
 * glimm's root module: the oklch maths behind both palette builders. 13.2 kB
 * gzip, and it used to sit in the root layout chunk on every route because
 * three providers imported from it at the top level -- so a reader who only
 * ever read a blog post still paid for the machinery that repigments the
 * sheet. The wavy shader (`sweep-shader.ts`) is fetched in the same tick.
 *
 * `glimm/react` carries its own copy of the colour helpers but does not export
 * them, so moving one import and not the others buys nothing: the module comes
 * back for whichever is left. All three go through here instead, and the fetch
 * happens on the first palette change.
 */
type GlimmMod = typeof import("glimm");
let loading: Promise<GlimmMod> | null = null;
let wavy: (typeof import("./sweep-shader"))["createWavyShader"] | null = null;

function loadGlimm() {
  loading ??= Promise.all([import("glimm"), import("./sweep-shader")]).then(([g, s]) => {
    wavy = s.createWavyShader;
    return g;
  });
  return loading;
}

export function sweepShader(
  opts: Parameters<NonNullable<typeof wavy>>[0],
): ReturnType<NonNullable<typeof wavy>> {
  return wavy?.(opts) ?? null;
}

/**
 * The two controls the interrupt below needs. glimm exports the full
 * `ShaderController` type from its root entry but not from `glimm/react`, and
 * this file has no business with the rest of it.
 */
type BandControls = {
  setProgress: (p: number) => void;
  setAlpha: (a: number) => void;
  canvas?: HTMLCanvasElement;
};

/**
 * The band's shader controller, handed over by `SweepProvider` the first time
 * glimm builds one. It is here rather than in a context because the only thing
 * that ever needs it is the interrupt below, and that runs from inside
 * `sweepApply` rather than from a component.
 */
let controller: BandControls | null = null;

export function setSweepController(c: BandControls) {
  controller = c;
}

/** The sweep still crossing the sheet, if there is one. */
let inFlight: { handle: SweepHandle; once: () => void } | null = null;

/** Which press is the current one, so a stale fetch cannot start a second band. */
let seq = 0;

/**
 * Run a palette change inside a glimm sweep, with a guarantee that it runs.
 *
 * glimm applies the change at the band's midpoint, which is driven by
 * requestAnimationFrame. A browser freezes rAF in a hidden tab, so a reader who
 * flips the paper and immediately switches tabs comes back to the old theme:
 * the band was suspended somewhere before its midpoint and the swap never
 * happened. The same is true of anything else that can stall the loop, and of a
 * context that fails to build at all.
 *
 * So the change is fired by whichever comes first, the midpoint or a timer, and
 * `apply` is made idempotent so it cannot happen twice. The timer is set well
 * past the sweep's own duration; when the sweep is healthy it never wins.
 *
 * A second press while the band is still crossing is its own problem.
 * `playSweep` continues from the controller's current progress by design, which
 * is right for a page navigation: the band keeps moving forward instead of
 * snapping back. For a toggle it is wrong. Press the theme twice quickly and
 * the second sweep starts at whatever progress the first had reached, so if
 * that is past the midpoint the swap fires at once and the band is already
 * leaving the screen. The reader sees the paper change with no pass over it,
 * which reads as the animation being broken rather than as it being fast.
 *
 * So an interrupted sweep is landed immediately, cancelled, and the band is
 * wound back to the start before the next one plays. Every press gets a pass.
 */
export function sweepApply(
  sweep: SweepFn,
  apply: () => void,
  options: { band: Band; direction: "ltr" | "ttb" },
) {
  const id = ++seq;
  const prev = inFlight;
  if (prev) {
    // The change it was carrying still has to happen, and now rather than on
    // its guard timer a second later.
    prev.once();
    prev.handle.cancel();
    controller?.setProgress(0);
    controller?.setAlpha(0);
    inFlight = null;
  }

  let ran = false;
  const once = () => {
    if (ran) return;
    ran = true;
    apply();
  };
  // Started before the module is asked for, so it covers the fetch as well as a
  // frozen rAF. A press that never gets its band still gets its ink.
  const guard = window.setTimeout(once, 1600);
  const land = () => {
    once();
    window.clearTimeout(guard);
  };

  loadGlimm().then((g) => {
    // A second press while the first was still fetching: that press owns the
    // band now, and this one is already stale. The interrupt above could not
    // catch it, because nothing was in flight yet to catch.
    if (id !== seq) return land();
    const { band, direction } = options;
    const handle = sweep(once, {
      palette: g.accentPair(band.hexes[0], band.hexes[1]),
      direction,
    });
    const settle = () => {
      window.clearTimeout(guard);
      if (inFlight?.handle === handle) inFlight = null;
    };
    handle.done.then(settle, settle);
    inFlight = { handle, once };
  }, land);
}
