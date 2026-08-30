"use client";
import { effect, frameLoop, init, surface, uniforms } from "vgpu";
import type { Gpu } from "vgpu";
import { useEffect, useRef } from "react";
import { LAMP_WGSL } from "@/lib/lamp.wgsl";
import { approach, useReducedMotion } from "./useReducedMotion";

/** "#rrggbb" or "rgb(...)" to the 0..1 components the shader wants. */
function parseInk(css: string): [number, number, number, number] {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return [0, 0, 0, 0.06];
  x.clearRect(0, 0, 1, 1);
  x.fillStyle = "#000";
  x.fillStyle = css;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
}

/**
 * The frame the light rakes across, read from the DOM rather than recomputed
 * from tokens: the sheet's margin is a token, but its box is whatever the page
 * actually laid out.
 */
function readSheet(): number[] {
  const el = document.querySelector(".sheet");
  if (!el) return [0, 0, 0, 0];
  const r = el.getBoundingClientRect();
  return [r.left, r.top, r.width, r.height];
}

/**
 * The lamp, on the GPU.
 *
 * Mounted only where `navigator.gpu` exists, and only through `next/dynamic`,
 * so the 44 kB of runtime is a second request made after the page is
 * interactive by the browsers that can use it. Everyone else gets the 2D field
 * and never downloads this. `onFail` hands back to that field when the adapter
 * turns out not to be there after all: `navigator.gpu` is a promise of a
 * request, not of a device.
 *
 * The discipline is the 2D field's, unchanged. DPR clamped to 2. The loop stops
 * the moment the light has caught up with the hand and stopped fading, so a
 * still hand costs nothing. It pauses with the tab, it re-reads its colour when
 * the paper changes, and reduced motion turns it off entirely.
 */
export function GpuLamp({ onFail }: { onFail: () => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let gpu: Gpu | null = null;
    let dead = false;
    const root = document.documentElement;

    // px/py is where the pointer is; cx/cy is where the light has got to. The
    // gap between them is the whole feel of it, and here it is also the vector
    // the pool is stretched along.
    let px = -9999;
    let py = -9999;
    let cx = -9999;
    let cy = -9999;
    let vx = 0;
    let vy = 0;
    let a = 0;
    let last = 0;

    const cleanups: (() => void)[] = [];

    void (async () => {
      try {
        gpu = await init();
        // Unmounted while the adapter was being requested. That is not a
        // failure and must not hand back to the 2D field: React's development
        // double-mount does exactly this, and treating it as a failure
        // downgraded every dev session to the CPU path permanently.
        if (dead) {
          gpu?.dispose?.();
          return;
        }
        if (!gpu) return onFail();
        // A WGSL error is the one failure that is otherwise silent: the pass
        // encodes, submits and draws nothing, and the field just looks off.
        if (process.env.NODE_ENV !== "production") {
          gpu.onError((e) => console.warn("[lamp]", e));
        }
        const out = surface(gpu, cv, { dpr: 2, alphaMode: "premultiplied" });
        const u = uniforms(gpu, {
          sheet: [0, 0, 0, 0] as number[],
          ink: parseInk(getComputedStyle(root).getPropertyValue("--dither-dot").trim()),
          res: [cv.clientWidth, cv.clientHeight] as number[],
          cur: [-9999, -9999] as number[],
          vel: [0, 0] as number[],
          cfg: [0, 0.55] as number[],
        });
        const fx = effect(gpu, LAMP_WGSL, { blend: "premultiplied" }).set({ lamp: u });

        let sheet = readSheet();
        const inkOf = () =>
          parseInk(getComputedStyle(root).getPropertyValue("--dither-dot").trim());

        let loop: { stop: () => void } | null = null;
        const stop = () => {
          loop?.stop();
          loop = null;
          last = 0;
        };

        const tick = (f: { pass: (t: unknown, b: unknown) => void }) => {
          const now = performance.now();
          if (reduced.current) {
            a = 0;
            u.set({ cfg: [0, 0.55] });
            f.pass({ target: out, clear: [0, 0, 0, 0] }, fx);
            stop();
            return;
          }
          const dt = Math.min(now - (last || now - 16.667), 50);
          last = now;
          if (cx < -999) {
            cx = px;
            cy = py;
          }
          const k = approach(0.1, dt);
          const nx = cx + (px - cx) * k;
          const ny = cy + (py - cy) * k;
          // Speed in "screen widths a second", clamped: the stretch has to stop
          // somewhere or a flick across the page smears to a line.
          const sp = Math.min(Math.hypot(nx - cx, ny - cy) / Math.max(dt, 1) / 1.6, 1);
          const dx = nx - cx;
          const dy = ny - cy;
          const len = Math.hypot(dx, dy) || 1;
          vx = (dx / len) * sp;
          vy = (dy / len) * sp;
          cx = nx;
          cy = ny;
          const t = px > -999 ? 1 : 0;
          a += (t - a) * approach(0.16, dt);
          u.set({
            cur: [cx, cy],
            vel: [vx, vy],
            cfg: [a, 0.55],
            sheet,
            res: [cv.clientWidth, cv.clientHeight],
          });
          f.pass({ target: out, clear: [0, 0, 0, 0] }, fx);
          if (Math.abs(px - cx) < 0.5 && Math.abs(py - cy) < 0.5 && Math.abs(t - a) < 0.01) {
            a = t;
            u.set({ cfg: [a, 0.55], vel: [0, 0] });
            f.pass({ target: out, clear: [0, 0, 0, 0] }, fx);
            stop();
          }
        };

        const wake = () => {
          if (!loop && !document.hidden && !reduced.current && gpu) {
            loop = frameLoop(gpu, tick as never);
          }
        };

        const onMove = (e: PointerEvent) => {
          px = e.clientX;
          py = e.clientY;
          wake();
        };
        const onLeave = () => {
          px = -9999;
          py = -9999;
          wake();
        };
        const onVis = () => {
          if (document.hidden) stop();
          else wake();
        };
        let rz = 0;
        const onResize = () => {
          window.clearTimeout(rz);
          rz = window.setTimeout(() => {
            sheet = readSheet();
            wake();
          }, 150);
        };
        // The dot colour is a token, so a paper change has to be re-read. Ink
        // changes do not touch it: the light is never in the ink.
        const obs = new MutationObserver(() => {
          u.set({ ink: inkOf() });
          wake();
        });
        obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

        window.addEventListener("pointermove", onMove, { passive: true });
        document.addEventListener("pointerleave", onLeave);
        document.addEventListener("visibilitychange", onVis);
        window.addEventListener("resize", onResize);
        window.addEventListener("scroll", onResize, { passive: true });

        cleanups.push(() => {
          stop();
          window.clearTimeout(rz);
          obs.disconnect();
          window.removeEventListener("pointermove", onMove);
          document.removeEventListener("pointerleave", onLeave);
          document.removeEventListener("visibilitychange", onVis);
          window.removeEventListener("resize", onResize);
          window.removeEventListener("scroll", onResize);
        });
      } catch (err) {
        // The 2D field takes over silently in production: a reader does not
        // need to know which of the two lights they got. In development the
        // reason is worth seeing, because "it fell back" is indistinguishable
        // from "it never tried".
        if (process.env.NODE_ENV !== "production") console.warn("[lamp] no GPU path:", err);
        if (!dead) onFail();
      }
    })();

    return () => {
      dead = true;
      for (const c of cleanups) c();
      gpu?.dispose?.();
    };
  }, [reduced, onFail]);

  return <canvas ref={ref} className="dither" aria-hidden="true" />;
}
