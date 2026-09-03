"use client";
import { useEffect, useState } from "react";

/**
 * True on a device whose primary pointer cannot hover.
 *
 * Several figures were written as hover affordances and then told the reader so
 * in words: "point at a layer", "hover the card", "press E to copy my email".
 * On a phone those are instructions the device cannot follow, which is worse
 * than no instruction at all. Anything that says "hover" or draws a key cap
 * checks this first.
 *
 * It starts false and corrects after mount, deliberately. The server cannot
 * know what is holding the page, and guessing produces a hydration mismatch;
 * one frame of the pointer copy is cheaper than that, and nothing can be
 * hovered in that frame anyway.
 */
export function useCoarsePointer() {
  const [coarse, setCoarse] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(hover: none), (pointer: coarse)");
    setCoarse(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCoarse(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return coarse;
}
