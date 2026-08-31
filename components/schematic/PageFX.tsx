"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useFX } from "@/components/providers/FXProvider";

/**
 * Two page-wide behaviours that have no element of their own, mounted once by
 * the shell rather than wired into every control:
 *
 *   1. the panels' hex material — each panel needs the cursor's position inside
 *      itself to mask the mesh, and one delegated listener beats one per panel;
 *   2. the sound layer — a tick on hovering anything interactive and a
 *      press/release pair on buttons. Delegated, so a new control is audible
 *      the moment it exists rather than when someone remembers to wire it.
 */
export function PageFX() {
  const fx = useFX();
  const pathname = usePathname();

  // Panel hex material.
  //
  // Only the home page has panels. This shell is mounted once for every route,
  // so the résumé and every blog post were running a `closest(".panel")` on
  // each pointermove for a mask nothing on the page could show. Re-checked per
  // route rather than once at mount: effects run after the commit, so on a
  // client navigation the new route's DOM is already there to look at.
  useEffect(() => {
    if (!document.querySelector(".panel")) return;
    let pending = false;
    let last: { el: HTMLElement; x: number; y: number } | null = null;
    const onMove = (e: PointerEvent) => {
      const panel = (e.target as HTMLElement | null)?.closest?.<HTMLElement>(".panel");
      if (!panel) return;
      last = { el: panel, x: e.clientX, y: e.clientY };
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        pending = false;
        if (!last) return;
        const r = last.el.getBoundingClientRect();
        last.el.style.setProperty("--mx", `${last.x - r.left}px`);
        last.el.style.setProperty("--my", `${last.y - r.top}px`);
      });
    };
    document.addEventListener("pointermove", onMove, { passive: true });
    return () => document.removeEventListener("pointermove", onMove);
  }, [pathname]);

  // The sound layer.
  useEffect(() => {
    if (!fx) return;
    const SEL = "a,button,.prow,[role='slider']";

    /**
     * A hover the reader caused, and only one per control.
     *
     * Two things went wrong with the obvious version of this.
     *
     * `pointerover` fires whenever a different element ends up under the
     * pointer, and scrolling does that without the hand moving at all. Scroll a
     * list of links past a resting cursor and every one announced itself. What
     * separates a hover from a scroll is not where the pointer is, since the
     * events scrolling produces carry its real position, but whether the hand
     * moved: a hand on the mouse produces `pointermove`, and a page moving
     * under a still hand produces none. So a mouse hover has to be within a
     * beat of a real movement. That covers every way a page can scroll,
     * including the keyboard, an anchor jump and `scrollIntoView`, which a
     * `scroll`-event guard would each have needed to handle. Pens and touch are
     * exempt, having no hover to speak of and no move before their first event.
     *
     * And the selector matches nest. `.prow` is a parts-list row and it
     * contains the link to that part, so crossing from the row into its own
     * link was a second control by the old test, which only caught an
     * identical match. Containment either way is the same control.
     */
    /** How long after a scroll stops before hovering is audible again. */
    const SCROLL_SETTLE_MS = 140;
    let lastX = -1;
    let lastY = -1;
    let lastScroll = 0;
    const onPointerMove = (e: PointerEvent) => {
      lastX = e.clientX;
      lastY = e.clientY;
    };
    const onScroll = () => {
      lastScroll = performance.now();
    };

    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.(SEL);
      if (!t) return;
      const from = (e.relatedTarget as HTMLElement | null)?.closest?.(SEL);
      if (from && (from === t || from.contains(t) || t.contains(from))) return;
      const moved = e.clientX !== lastX || e.clientY !== lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      if (e.pointerType === "mouse") {
        // Did the hand move, or did the page move under it? Position, not
        // timing: `pointerover` fires before `pointermove` when a pointer
        // enters an element, so a test for "was there a recent move" is
        // order-dependent and drops the first hover after any pause. The
        // coordinates cannot lie about it — scrolling delivers the pointer's
        // unchanged position, and a hand delivers a new one.
        if (!moved) return;
        // Position alone is not enough on a trackpad, where a two-finger
        // scroll drifts the pointer a pixel or two while the page travels, so
        // the links going past read as movement. Wait for the scroll to stop.
        if (performance.now() - lastScroll < SCROLL_SETTLE_MS) return;
      }
      fx.tick();
    };
    /**
     * A control that voices its own outcome does not also get the generic pair.
     *
     * The rule holds across the whole site and the control declares it, with
     * `data-cue="self"` sitting beside the cue it plays. This was a hardcoded
     * list of two classes here instead, and nothing kept it up to date: the
     * copy chip, both "draw another" chips, the print button, the measuring
     * edge's section ticks and the keys chip all played their own note *and*
     * the generic press and release, so one click made three sounds.
     *
     * Read off the button rather than from a lookup, so a new self-voicing
     * control is correct the moment it is written, the same way a new plain
     * control is audible the moment it exists.
     */
    const isPlain = (el: HTMLElement | null | undefined) => !!el && el.dataset.cue !== "self";
    const onDown = (e: PointerEvent) => {
      const b = (e.target as HTMLElement | null)?.closest?.("button");
      if (isPlain(b)) fx.press();
    };
    const onUp = (e: PointerEvent) => {
      const b = (e.target as HTMLElement | null)?.closest?.("button");
      if (isPlain(b)) fx.release();
    };
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    // Capture, on window: the career timeline and the code blocks are their own
    // scrollports and their scroll events do not reach document by bubbling.
    window.addEventListener("scroll", onScroll, { passive: true, capture: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll, { capture: true });
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
    };
  }, [fx]);

  return null;
}
