"use client";
import { useEffect, useRef } from "react";

/**
 * The portrait photo, resampled into a breathing halftone particle field.
 * - Cover-crops the source so the face keeps its true proportions.
 * - "print" mode inks darkness on a fixed light paper — the face reads the
 *   same in both themes (the coin surface it sits on never flips).
 * - Dots bloom in as ripples from 2–3 random seed points, different every
 *   load; then they breathe and shy away from the cursor.
 * - Reduced motion: the finished print, immediately, no animation.
 */
export function ParticlePortrait({
  width = 320,
  shape = "rect",
  mode = "auto",
}: {
  width?: number;
  shape?: "rect" | "circle";
  mode?: "auto" | "print";
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    let reduce = reduceMQ.matches;
    const W = width;
    const H = shape === "circle" ? width : Math.round(width * 1.15);
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    ctx.scale(DPR, DPR);

    // Canvas fillStyle accepts CSS colours directly, so we read the coin's
    // --pp-ink / --pp-accent custom properties and use their values as-is.
    // These MUST be concrete colours in the CSS (hex / rgb / var→concrete),
    // NOT color-mix() — a probe/element can't reliably resolve color-mix here.
    const readColors = () => {
      const cs = getComputedStyle(canvas);
      const ink =
        cs.getPropertyValue("--pp-ink").trim() ||
        (mode === "print" ? "#17100a" : cs.getPropertyValue("--fg-1").trim() || "#231811");
      const accent =
        cs.getPropertyValue("--pp-accent").trim() ||
        cs.getPropertyValue("--accent-live").trim() ||
        cs.getPropertyValue("--accent").trim() ||
        "#D88762";
      return {
        ink,
        accent,
        // Auto mode on a dark theme emits light instead of ink; print never flips.
        dark: mode === "auto" && document.documentElement.getAttribute("data-theme") === "dark",
      };
    };
    let colors = readColors();

    type P = { x: number; y: number; ax: number; ay: number; lum: number; ph: number; d0: number };
    let parts: P[] = [];
    let raf = 0;
    let alive = true;
    let cellPx = 6;

    const strengthOf = (p: P) => (colors.dark ? p.lum : 1 - p.lum);
    const radiusOf = (p: P) => {
      const s = strengthOf(p);
      return s < 0.14 ? 0 : Math.max(0.5, Math.min(cellPx * 0.6, s * cellPx * 0.72));
    };
    const colorOf = (p: P) => {
      const s = strengthOf(p);
      return s > 0.32 && s < 0.52 ? colors.accent : colors.ink;
    };

    const drawStatic = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        const r = radiusOf(p);
        if (!r) continue;
        ctx.fillStyle = colorOf(p);
        ctx.beginPath();
        ctx.arc(p.ax, p.ay, r, 0, 6.2832);
        ctx.fill();
      }
    };

    // An ink change is a 340ms interpolation of the CSS colour tokens, but a
    // MutationObserver only fires once, at the start. Re-reading for the length
    // of the tween lets the dots travel with the rest of the page instead of
    // snapping to the new ink while everything else is still moving.
    let recolorUntil = 0;
    const themeObs = new MutationObserver(() => {
      colors = readColors();
      recolorUntil = performance.now() + 420;
      if (reduce) drawStatic();
    });
    themeObs.observe(document.documentElement, {
      attributes: true,
      // data-ink / data-mode belong to the press design, the rest to /old. The
      // canvas reads its colours from CSS custom properties, so it has to
      // re-read them whenever either design changes what those resolve to.
      attributeFilter: [
        "data-theme",
        "data-ink",
        "data-mode",
        "data-mono",
        "data-pure",
        "data-purePolarity",
        "style",
      ],
    });

    const mouse = { x: -9e3, y: -9e3 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * W;
      mouse.y = ((e.clientY - r.top) / r.height) * H;
    };
    const onLeave = () => {
      mouse.x = -9e3;
      mouse.y = -9e3;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    // Pause the rAF loop while the canvas is off-screen — the breathing field
    // shouldn't burn frames from beneath the fold.
    let visible = true;
    const startLoop = () => {
      if (!raf && alive && visible && !reduce && parts.length > 0) {
        t0 = performance.now() - lastT * 1000;
        raf = requestAnimationFrame(loop);
      }
    };
    const stopLoop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startLoop();
      else stopLoop();
    });
    io.observe(canvas);

    // Live reduced-motion: opting in mid-session freezes to the finished
    // print; opting out resumes the breathing loop.
    const onReduceChange = (e: MediaQueryListEvent) => {
      reduce = e.matches;
      if (reduce) {
        stopLoop();
        drawStatic();
      } else {
        startLoop();
      }
    };
    reduceMQ.addEventListener("change", onReduceChange);

    let t0 = performance.now();
    let lastT = 0;
    const loop = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      const t = (now - t0) / 1000;
      lastT = t; // resume point for the visibility pause
      // getComputedStyle is far too costly to run every frame, but every other
      // frame for the duration of an ink tween is imperceptible and keeps the
      // dots in step with it.
      if (now < recolorUntil && Math.round(t * 120) % 2 === 0) colors = readColors();
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        let base = radiusOf(p);
        if (!base) continue;
        // Entrance ripple — dots bloom outward from the seed points.
        const age = t - p.d0;
        if (age <= 0) continue;
        if (age < 0.45) {
          const k = age / 0.45;
          base *= 1 - (1 - k) * (1 - k) * (1 - k); // ease-out cubic
        }
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        let tx = p.ax;
        let ty = p.ay;
        if (d2 < 4225) {
          const d = Math.sqrt(d2) || 1;
          const f = ((65 - d) / 65) * 16;
          tx = p.ax + (dx / d) * f;
          ty = p.ay + (dy / d) * f;
        }
        p.x += (tx - p.x) * 0.14;
        p.y += (ty - p.y) * 0.14;
        const rr = base * (1 + 0.1 * Math.sin(t * 1.7 + p.ph));
        ctx.fillStyle = colorOf(p);
        ctx.beginPath();
        ctx.arc(p.x, p.y, rr, 0, 6.2832);
        ctx.fill();
      }
    };

    const img = new window.Image();
    const sample = () => {
      if (!alive) return;
      const COLS = 52;
      const ROWS = Math.round(COLS * (H / W));
      const off = document.createElement("canvas");
      off.width = COLS;
      off.height = ROWS;
      const octx = off.getContext("2d");
      if (!octx) return;
      // Cover-crop the source into the grid — no squeezed faces.
      const sAspect = img.naturalWidth / img.naturalHeight;
      const tAspect = COLS / ROWS;
      let sx = 0;
      let sy = 0;
      let sw = img.naturalWidth;
      let sh = img.naturalHeight;
      if (sAspect > tAspect) {
        sw = img.naturalHeight * tAspect;
        sx = (img.naturalWidth - sw) / 2;
      } else if (sAspect < tAspect) {
        sh = img.naturalWidth / tAspect;
        sy = (img.naturalHeight - sh) * 0.2; // bias the crop toward the face
      }
      octx.drawImage(img, sx, sy, sw, sh, 0, 0, COLS, ROWS);
      const data = octx.getImageData(0, 0, COLS, ROWS).data;
      const cell = W / COLS;
      cellPx = cell;
      const circleR = Math.min(W, H) / 2 - cell * 0.6;
      const ccx = W / 2;
      const ccy = H / 2;
      // Ripple seeds — 2–3, random, staggered starts.
      const seeds = Array.from({ length: 2 + Math.floor(Math.random() * 2) }, (_, i) => ({
        x: Math.random() * W,
        y: Math.random() * H,
        start: i * (0.25 + Math.random() * 0.2),
      }));
      const SPREAD = 340; // ripple front, px/s
      const next: P[] = [];
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          const i = (y * COLS + x) * 4;
          if (data[i + 3] < 40) continue;
          const cx = x * cell + cell / 2;
          const cy = y * cell + cell / 2;
          if (shape === "circle") {
            const ddx = cx - ccx;
            const ddy = cy - ccy;
            if (ddx * ddx + ddy * ddy > circleR * circleR) continue;
          }
          const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
          const d0 = Math.min(
            ...seeds.map((sd) => sd.start + Math.hypot(cx - sd.x, cy - sd.y) / SPREAD),
          );
          next.push({
            x: cx,
            y: cy,
            ax: cx,
            ay: cy,
            lum,
            ph: ((x * 7 + y * 13) % 628) / 100,
            d0: d0 + Math.random() * 0.12,
          });
        }
      }
      parts = next;
      t0 = performance.now(); // ripple clock starts when the dots exist
      lastT = 0;
      // Paint the finished print first, unconditionally, then let the loop add
      // the breathing on top. Without this the canvas stays blank whenever the
      // rAF loop can't start — an off-screen or occluded page, a background
      // tab, a throttled frame budget — and the portrait is just missing.
      drawStatic();
      if (!reduce) startLoop();
    };

    // Attach the handler *before* setting src, and handle the already-complete
    // case: on a warm cache the load event fires synchronously during the src
    // assignment, so a handler attached afterwards never runs and the field
    // stays blank on every visit after the first.
    img.addEventListener("load", sample, { once: true });
    img.src = "/portrait/ganapativs.webp";
    if (img.complete && img.naturalWidth > 0) sample();

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      reduceMQ.removeEventListener("change", onReduceChange);
      themeObs.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [width, shape, mode]);

  return (
    <canvas
      ref={ref}
      className="particle-portrait"
      style={{ width, height: shape === "circle" ? width : Math.round(width * 1.15) }}
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- canvas artwork
      role="img"
      aria-label="Portrait of Ganapati V S, drawn as a breathing field of halftone dots"
    />
  );
}
