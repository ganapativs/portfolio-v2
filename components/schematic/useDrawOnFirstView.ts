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
  return ref;
}
