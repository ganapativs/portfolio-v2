"use client";
import { useEffect } from "react";
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

  // Panel hex material.
  useEffect(() => {
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
  }, []);

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
    const MOVE_GRACE_MS = 120;
    let lastMove = 0;
    const onPointerMove = () => {
      lastMove = performance.now();
    };

    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.(SEL);
      if (!t) return;
      const from = (e.relatedTarget as HTMLElement | null)?.closest?.(SEL);
      if (from && (from === t || from.contains(t) || t.contains(from))) return;
      if (e.pointerType === "mouse" && performance.now() - lastMove > MOVE_GRACE_MS) return;
      fx.tick();
    };
    // The header's own controls play their own cues (a clack for the toggles, a
    // pitched pluck for the inks), so the generic press/release would double up.
    const isPlain = (el: HTMLElement | null | undefined) =>
      !!el && !el.classList.contains("ctl") && !el.classList.contains("ink-sw");
    const onDown = (e: PointerEvent) => {
      const b = (e.target as HTMLElement | null)?.closest?.("button");
      if (isPlain(b)) fx.press();
    };
    const onUp = (e: PointerEvent) => {
      const b = (e.target as HTMLElement | null)?.closest?.("button");
      if (isPlain(b)) fx.release();
    };
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
    };
  }, [fx]);

  return null;
}
