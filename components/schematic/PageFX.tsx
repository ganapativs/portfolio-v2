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
    const onOver = (e: PointerEvent) => {
      const t = (e.target as HTMLElement | null)?.closest?.(SEL);
      if (!t) return;
      // Moving between two children of the same control is not a new hover.
      const from = (e.relatedTarget as HTMLElement | null)?.closest?.(SEL);
      if (from === t) return;
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
    document.addEventListener("pointerover", onOver, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
    };
  }, [fx]);

  return null;
}
