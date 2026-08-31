"use client";
import { useEffect, useRef } from "react";

/**
 * A live read of `prefers-reduced-motion`, as a ref.
 *
 * Every rAF loop on the site used to sample the preference once at mount, which
 * means a reader who turned it on mid-session kept the portrait breathing, the
 * cursor light following and the traveller lagging. The CSS half of the law is
 * handled by a blanket rule in motion.css; this is the half that is written in
 * JavaScript, where there is nothing to cascade.
 *
 * A ref rather than state on purpose: the consumers are animation loops that
 * read it once per frame and must not re-render when it changes.
 */
export function useReducedMotion() {
  const ref = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    ref.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      ref.current = e.matches;
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return ref;
}

/**
 * Frame-rate independent exponential approach.
 *
 * `x += (target - x) * 0.14` is the standard one-liner and it is wrong on any
 * display that is not 60Hz: at 120Hz it runs twice per 16ms and the time
 * constant halves, so every eased follow on the site was twice as fast on a
 * ProMotion screen as it was on an external monitor. Two of those follows have
 * comments declaring that their lag IS the design.
 *
 * `k` is the fraction that would be covered in one frame at 60Hz, kept so the
 * call sites still read as the constants they were tuned with.
 */
export function approach(k: number, dtMs: number) {
  return 1 - Math.pow(1 - k, dtMs / 16.667);
}

/**
 * cubic-bezier(.22, 1, .36, 1) -- `--ease-out`, the one curve the site eases
 * on -- solved for y at a given x by bisection. Twelve iterations is well past
 * the precision any motion here can show.
 *
 * It lives beside `approach` because a rAF loop cannot read a CSS easing, and
 * a second easing vocabulary for the handful of animations written in
 * JavaScript is how a design system starts to come apart. Use `approach` for a
 * follow with no end, and this for a move with a duration.
 */
const bezX = (t: number) =>
  3 * t * (1 - t) * (1 - t) * 0.22 + 3 * t * t * (1 - t) * 0.36 + t * t * t;
const bezY = (t: number) => 3 * t * (1 - t) * (1 - t) + 3 * t * t * (1 - t) + t * t * t;

export function houseEase(x: number) {
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 12; i++) {
    const e = bezX(t) - x;
    if (Math.abs(e) < 1e-4) break;
    if (e > 0) hi = t;
    else lo = t;
    t = (lo + hi) / 2;
  }
  return bezY(t);
}
