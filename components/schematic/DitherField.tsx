"use client";
import { useEffect, useRef, useState } from "react";
import { approach, useReducedMotion } from "./useReducedMotion";

/**
 * The light under the hand.
 *
 * A soft radial falloff around the cursor, quantised through a 4×4 Bayer matrix
 * so it prints as a halftone rather than a glow — the same screen the portrait
 * is drawn with, at a much lower density. It is the one thing on the page that
 * is genuinely generative, and it is deliberately at the edge of visible: about
 * 5% ink on paper, 6% light on graphite.
 *
 * Everything here is a cost decision:
 *   - fine pointers only, and the canvas is not rendered at all otherwise: it
 *     is fixed to the viewport at a clamped DPR of 2, so it costs ~20MB of
 *     backing store whether or not a single frame is ever drawn.
 *   - DPR clamped to 2. A 3× field is four times the fill for no visible gain.
 *   - the loop stops itself the moment the blob has caught up with the pointer
 *     and stopped fading, so a still hand costs nothing.
 *   - it pauses with the tab and re-reads its colour when the theme changes.
 */
export function DitherField() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();
  // There is no cursor on a phone to light anything, and the canvas is a real
  // cost even when the loop never runs: fixed to the viewport at a clamped DPR
  // of 2, it is 2880x1800 on a laptop, which is about 20MB of backing store
  // allocated on every route. Rendered only where it can do something.
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setFine(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const c = cv.getContext("2d");
    if (!c) return;

    const root = document.documentElement;
    // The ordered-dither threshold map, normalised to (0,1).
    const B = [
      [0, 8, 2, 10],
      [12, 4, 14, 6],
      [3, 11, 1, 9],
      [15, 7, 13, 5],
    ].map((r) => r.map((v) => (v + 0.5) / 16));
    const CELL = 4;
    const DOT = 2;

    let W = 0;
    let H = 0;
    let dot = "";
    // px/py is where the pointer is; cx/cy is where the light has got to. The
    // gap between them is the whole feel of it.
    let px = -9999;
    let py = -9999;
    let cx = -9999;
    let cy = -9999;
    let a = 0;
    let raf = 0;
    let last = 0;

    // What the last frame actually painted, so this one can clear that box
    // instead of the whole viewport. The light covers a 910px square at most
    // and the canvas is the full window, so clearing everything was wiping
    // several times the area it was about to draw into, every frame, at
    // whatever the display's refresh rate happens to be.
    let dirty: [number, number, number, number] | null = null;

    const draw = () => {
      if (dirty) c.clearRect(dirty[0], dirty[1], dirty[2], dirty[3]);
      dirty = null;
      c.fillStyle = dot;
      if (a <= 0.02) return;
      const bx = cx;
      const by = cy;
      const sigma = 175;
      const amp = a * 0.55;
      const R = sigma * 2.6;
      const i0 = Math.max(0, Math.floor((bx - R) / CELL));
      const i1 = Math.min(Math.ceil(W / CELL), Math.ceil((bx + R) / CELL));
      const j0 = Math.max(0, Math.floor((by - R) / CELL));
      const j1 = Math.min(Math.ceil(H / CELL), Math.ceil((by + R) / CELL));
      const s2 = 2 * sigma * sigma;
      // The cell grid the loops below cover, plus one dot so the last column
      // and row are fully erased next time.
      dirty = [i0 * CELL, j0 * CELL, (i1 - i0) * CELL + DOT, (j1 - j0) * CELL + DOT];
      for (let j = j0; j < j1; j++) {
        const y = j * CELL;
        const dy = y - by;
        const dy2 = dy * dy;
        const bj = B[j & 3];
        for (let i = i0; i < i1; i++) {
          const x = i * CELL;
          const dx = x - bx;
          const f = amp * Math.exp(-(dx * dx + dy2) / s2);
          if (f > bj[i & 3]) c.fillRect(x, y, DOT, DOT);
        }
      }
    };

    const size = () => {
      const d = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      cv.width = W * d;
      cv.height = H * d;
      c.setTransform(d, 0, 0, d, 0, 0);
      dot = getComputedStyle(root).getPropertyValue("--dither-dot").trim();
      // Setting width/height blanks the canvas, so there is nothing left to
      // clear and a stale dirty box would point at the old dimensions.
      dirty = null;
      draw();
    };

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // Reduced motion arriving mid-session: clear and stop, rather than
      // carrying on because the preference was false when this mounted.
      if (reduced.current) {
        a = 0;
        draw();
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        return;
      }
      // Clamped: a backgrounded tab hands back a multi-second delta.
      const dt = Math.min(now - (last || now - 16.667), 50);
      last = now;
      if (cx < -999) {
        cx = px;
        cy = py;
      }
      // Time-scaled. The gap between the light's speed and the pointer's is
      // the whole feel of it, and an unscaled per-frame decay halves that gap
      // on a 120Hz display.
      const k = approach(0.1, dt);
      cx += (px - cx) * k;
      cy += (py - cy) * k;
      const t = px > -999 ? 1 : 0;
      // 0.16 rather than 0.08. The light is meant to be under the hand, and
      // at half this rate it took most of a second to arrive, which read as
      // the page still settling rather than as a lamp being moved.
      a += (t - a) * approach(0.16, dt);
      draw();
      if (Math.abs(px - cx) < 0.5 && Math.abs(py - cy) < 0.5 && Math.abs(t - a) < 0.01) {
        a = t;
        if (t === 0) draw();
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
    };
    const wake = () => {
      if (!raf && !document.hidden && !reduced.current) raf = requestAnimationFrame(frame);
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
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else wake();
    };
    // The dot colour is a token, so a theme flip has to be re-read. Ink changes
    // do not touch it — the light is never in the ink. Twice, because the
    // token now tweens for 340ms (see tokens.css): the mutation fires at the
    // tween's first frame, when a read still returns the colour being left,
    // and the second read lands after it has settled.
    let settleTid = 0;
    const onTheme = () => {
      size();
      window.clearTimeout(settleTid);
      settleTid = window.setTimeout(size, 380);
    };
    const themeObs = new MutationObserver(onTheme);
    themeObs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });

    let rz = 0;
    const onResize = () => {
      clearTimeout(rz);
      rz = window.setTimeout(size, 150);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("resize", onResize);
    size();

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(rz);
      clearTimeout(settleTid);
      themeObs.disconnect();
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("resize", onResize);
    };
  }, [reduced, fine]);

  if (!fine) return null;
  return <canvas ref={ref} className="dither" aria-hidden="true" />;
}
