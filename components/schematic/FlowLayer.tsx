"use client";
import { effect, frameLoop, init, surface, uniforms } from "vgpu";
import type { Gpu } from "vgpu";
import { useEffect, useRef } from "react";
import { FLOW_WGSL } from "@/lib/flow.wgsl";
import { useReducedMotion } from "./useReducedMotion";

/** A CSS colour to the 0..1 components the shader wants. */
function parse(css: string): [number, number, number, number] {
  const c = document.createElement("canvas");
  c.width = c.height = 1;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return [0, 0, 0, 1];
  x.clearRect(0, 0, 1, 1);
  x.fillStyle = "#000";
  x.fillStyle = css;
  x.fillRect(0, 0, 1, 1);
  const d = x.getImageData(0, 0, 1, 1).data;
  return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
}

/**
 * The traffic on fig. 1, drawn over the drawing.
 *
 * Sits exactly on top of the exploded view's SVG and is inert to the pointer,
 * so the slabs keep their own hover and their own hit testing. The SVG is still
 * the figure: it carries the structure, the labels and the draw-in, and this
 * adds the one thing a static drawing cannot say, which is that something is
 * moving through it.
 *
 * Mounted only where `navigator.gpu` exists and only through `next/dynamic`, so
 * the runtime is a second request made by browsers that can use it. Without it
 * the figure is what it was, which was already complete.
 *
 * It runs only while the figure is on screen and the tab is visible. A flow
 * annotation nobody is looking at is a fan heater.
 */
export function FlowLayer({ layer, height }: { layer: number; height: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  const layerRef = useRef(layer);
  layerRef.current = layer;

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    let gpu: Gpu | null = null;
    let dead = false;
    const root = document.documentElement;
    const cleanups: (() => void)[] = [];

    void (async () => {
      try {
        gpu = await init();
        if (dead) {
          gpu?.dispose?.();
          return;
        }
        if (!gpu) return;
        if (process.env.NODE_ENV !== "production") {
          gpu.onError((e) => console.warn("[flow]", e));
        }
        const out = surface(gpu, cv, { dpr: 2, alphaMode: "premultiplied" });
        const inks = () => {
          const cs = getComputedStyle(root);
          return {
            ink: parse(cs.getPropertyValue("--ink-3").trim()),
            accent: parse(cs.getPropertyValue("--accent").trim()),
          };
        };
        const c0 = inks();
        const u = uniforms(gpu, {
          vb: [0, 0, 300, height] as number[],
          ink: c0.ink,
          accent: c0.accent,
          res: [cv.clientWidth || 1, cv.clientHeight || 1] as number[],
          clock: [0, 0] as number[],
          focus: [-1, 0] as number[],
        });
        const fx = effect(gpu, FLOW_WGSL, { blend: "premultiplied" }).set({ flow: u });

        const t0 = performance.now();
        let level = 0;
        // Assumed on screen, and corrected by the observer, which fires once on
        // observe either way. Starting at false means a browser that throttles
        // IntersectionObserver never starts the loop at all.
        let onScreen = true;
        let loop: { stop: () => void } | null = null;

        const tick = (f: { pass: (t: unknown, b: unknown) => void }) => {
          const t = (performance.now() - t0) / 1000;
          // Fades in rather than starting mid-stream, and fades out when the
          // figure leaves. A flow that snaps on reads as a glitch.
          const want = onScreen && !reduced.current ? 1 : 0;
          level += (want - level) * 0.08;
          u.set({
            clock: [t, level],
            focus: [layerRef.current, 0],
            res: [cv.clientWidth || 1, cv.clientHeight || 1],
          });
          f.pass({ target: out, clear: [0, 0, 0, 0] }, fx);
          if (want === 0 && level < 0.01) stop();
        };
        const stop = () => {
          loop?.stop();
          loop = null;
        };
        const wake = () => {
          if (!loop && !document.hidden && gpu) loop = frameLoop(gpu, tick as never);
        };

        const io = new IntersectionObserver(
          (es) => {
            for (const e of es) onScreen = e.isIntersecting;
            if (onScreen) wake();
          },
          { threshold: 0.05 },
        );
        io.observe(cv);
        wake();
        const onVis = () => {
          if (document.hidden) stop();
          else if (onScreen) wake();
        };
        document.addEventListener("visibilitychange", onVis);
        // The two inks are tokens, so a theme or ink change has to be re-read.
        const obs = new MutationObserver(() => {
          const c = inks();
          u.set(c);
          wake();
        });
        obs.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-ink"] });

        cleanups.push(() => {
          stop();
          io.disconnect();
          obs.disconnect();
          document.removeEventListener("visibilitychange", onVis);
        });
      } catch (err) {
        if (process.env.NODE_ENV !== "production") console.warn("[flow] no GPU path:", err);
      }
    })();

    return () => {
      dead = true;
      for (const c of cleanups) c();
      gpu?.dispose?.();
    };
  }, [reduced, height]);

  return <canvas ref={ref} className="xp-flow" aria-hidden="true" />;
}
