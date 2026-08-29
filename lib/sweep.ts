import type { SweepFn, SweepOptions } from "glimm/react";

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
 */
export function sweepApply(sweep: SweepFn, apply: () => void, options?: SweepOptions) {
  let ran = false;
  const once = () => {
    if (ran) return;
    ran = true;
    apply();
  };
  const handle = sweep(once, options);
  const guard = window.setTimeout(once, 1200);
  const clear = () => window.clearTimeout(guard);
  handle.done.then(clear, clear);
  return handle;
}
