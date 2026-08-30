import type { SweepFn, SweepHandle, SweepOptions } from "glimm/react";

/**
 * The two controls the interrupt below needs. glimm exports the full
 * `ShaderController` type from its root entry but not from `glimm/react`, and
 * this file has no business with the rest of it.
 */
type BandControls = { setProgress: (p: number) => void; setAlpha: (a: number) => void };

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
export function sweepApply(sweep: SweepFn, apply: () => void, options?: SweepOptions) {
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
  const handle = sweep(once, options);
  const guard = window.setTimeout(once, 1600);
  const settle = () => {
    window.clearTimeout(guard);
    if (inFlight?.handle === handle) inFlight = null;
  };
  handle.done.then(settle, settle);
  inFlight = { handle, once };
  return handle;
}
