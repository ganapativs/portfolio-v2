"use client";
import { useEffect, useRef } from "react";

/**
 * Stamps `data-drawn="true"` on an element the first time it comes into view,
 * then stops watching it.
 *
 * This is the one scroll-triggered thing in the design and it is bounded on
 * purpose: it fires once per element per load, it drives a stroke-dashoffset
 * rather than an opacity, and the element is fully present before and after —
 * a figure that has not drawn yet is still readable, it just has not been
 * inked. Nothing here ships at opacity 0 waiting to be scrolled to.
 */
export function useDrawOnFirstView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  /**
   * Ask for the pass again.
   *
   * The draw-in happens once per load, which is right, and until now that also
   * meant a reader who scrolled past a figure in a hidden tab never saw it at
   * all. Clearing the attribute for a frame puts the strokes back to their
   * undrawn offset; setting it again transitions them home. No new animation,
   * no new motion in the design, just the one it already has, on request.
   */
  const replay = () => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.removeAttribute("data-drawn");
    // Read forces the reflow, so the two states are two styles rather than one
    // batched write the browser would collapse into no change at all.
    void el.getBoundingClientRect().width;
    el.setAttribute("data-drawn", "true");
  };
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.setAttribute("data-drawn", "true");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.setAttribute("data-drawn", "true");
          io.unobserve(e.target);
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, replay };
}
