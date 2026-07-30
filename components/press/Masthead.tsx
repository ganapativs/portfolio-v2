"use client";
import { useEffect, useRef } from "react";

const REST_X = 5;
const REST_Y = 6;
const RANGE_X = 16;
const RANGE_Y = 12;

/**
 * The name, printed twice. The second pass is deliberately misregistered, and
 * follows the pointer across the plate.
 *
 * The follow is an eased rAF lerp rather than a direct write, so the first
 * hover glides out from rest instead of snapping to wherever the cursor entered
 * — the snap is the thing that makes a naive version feel cheap. There is no
 * CSS transition on the ghost on purpose: two easings fighting over the same
 * transform is what makes it feel sticky.
 */
export function Masthead({ name }: { name: string }) {
  const hostRef = useRef<HTMLHeadingElement>(null);
  const ghostRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const ghost = ghostRef.current;
    if (!host || !ghost) return;

    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduceMQ.matches) return;
    // Coarse pointers have no hover to track; the resting misregistration is
    // the whole effect there.
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let tx = REST_X;
    let ty = REST_Y;
    let cx = REST_X;
    let cy = REST_Y;
    let raf = 0;

    const tick = () => {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      ghost.style.setProperty("--gx", `${cx.toFixed(2)}px`);
      ghost.style.setProperty("--gy", `${cy.toFixed(2)}px`);
      // Park the loop once it has effectively arrived, so an idle page isn't
      // burning a frame callback forever.
      if (Math.abs(tx - cx) < 0.05 && Math.abs(ty - cy) < 0.05) {
        cx = tx;
        cy = ty;
        ghost.style.setProperty("--gx", `${cx.toFixed(2)}px`);
        ghost.style.setProperty("--gy", `${cy.toFixed(2)}px`);
        raf = 0;
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      tx = REST_X + ((e.clientX - r.left) / Math.max(1, r.width) - 0.5) * RANGE_X;
      ty = REST_Y + ((e.clientY - r.top) / Math.max(1, r.height) - 0.5) * RANGE_Y;
      start();
    };
    const onLeave = () => {
      tx = REST_X;
      ty = REST_Y;
      start();
    };

    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    return () => {
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <h1 ref={hostRef} className="name">
      <span ref={ghostRef} className="name-ghost" aria-hidden="true">
        {name}
      </span>
      <span className="name-real">{name}</span>
    </h1>
  );
}
