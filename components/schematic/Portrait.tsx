"use client";
import { useEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";

const COLS = 56;
const ROWS = 56;

/**
 * The subject, printed as a halftone and dimensioned like a part.
 *
 * The canvas is a duotone print, not a photo filter. Every cell of a 56×56 grid
 * gets a dot whose radius is the darkness at that point, and the middle of the
 * tonal range — and only the middle, 0.32 to 0.52 — is printed in the live ink.
 * That is why an ink change travels through the face instead of tinting it: the
 * accent is carrying the midtones, which is exactly what a second plate does on
 * a real two-colour press.
 *
 * Light paper prints ink (strength = 1 - luminance). Dark paper emits light,
 * and the source photograph peaks around 0.75 luminance, so raw luminance would
 * cram the whole face into a narrow band of small dots. It is stretched to full
 * range and gamma'd at 1.4 so the midtones spread; the near-black noise falls
 * under the 0.14 draw threshold on its own and the paper shows through.
 *
 * The dots shy away from the cursor, ripple when poked, and stop dead the
 * moment everything has settled and the hand has left — a portrait that
 * breathed forever would be a screensaver.
 *
 * The photograph underneath is not decoration. A canvas is a black box to a
 * crawler and to a reader without JavaScript: no alt text, nothing to index.
 * So the real image renders on the server and is hidden only once the halftone
 * has actually drawn.
 */
export function Portrait() {
  const cvRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [drawn, setDrawn] = useState(false);
  const fx = useFX();
  // The pluck on a poke has to reach the rAF loop without re-running the whole
  // effect every time the FX context re-renders.
  const fxRef = useRef(fx);
  fxRef.current = fx;

  useEffect(() => {
    const cv = cvRef.current;
    const img = imgRef.current;
    if (!cv || !img) return;
    const c = cv.getContext("2d");
    if (!c) return;

    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    type P = { x: number; y: number; ax: number; ay: number; lum: number; d0: number };
    let W = 260;
    let cell = 0;
    let parts: P[] = [];
    let lum: Float32Array | null = null;
    // The source is cut out: its background is transparent, not white. Alpha has
    // to be a hard skip rather than a multiplier, because a multiplier makes a
    // transparent cell read as luminance 0 — which is "no ink" on light paper
    // and "full ink" on dark, so the field inverts into a solid slab in one of
    // the two themes. Cells this sparse are simply not part of the print.
    let opaque: Uint8Array | null = null;
    let raf = 0;
    let visible = true;
    let bloomed = false;
    let alive = true;
    let t0 = performance.now();
    let lastT = 0;
    let recolorUntil = 0;
    let recolorTid = 0;
    const mouse = { x: -9e3, y: -9e3 };
    let ripples: { x: number; y: number; r: number; a: number }[] = [];
    let colors = { ink: "#000", accent: "#8f5c0c", dark: false };

    const readColors = () => {
      const cs = getComputedStyle(root);
      colors = {
        ink: cs.getPropertyValue("--ink").trim(),
        accent: cs.getPropertyValue("--accent").trim(),
        dark: root.dataset.theme === "dark",
      };
    };
    // The luminance is auto-levelled across the subject before it gets here
    // (see `sample`), so both branches work on a full 0-1 range.
    //
    // On paper, darkness is ink. The black shirt prints solid and the lit side
    // of the face prints almost nothing: a photograph reproduced by a press,
    // which is the whole reason the figure is a halftone at all.
    //
    // On graphite the print emits instead, and the two things that kept it
    // from looking like the man were both attempts to be generous with it.
    // Adding a floor so the shoulders survived turned every dark feature into
    // a mid-density field, and the hair, the sunglasses and the beard stopped
    // reading. They are supposed to be holes. A dark feature under a light
    // print is an absence of light, so the curve is left alone below the draw
    // threshold and the shoulders fall away with it, exactly as they would on
    // a plate.
    //
    // What is tuned is the top end: a 1.2 gamma to keep the midtones off the
    // ceiling, and a radius cap tight enough that the brightest dots never
    // touch. A halftone stops being one the moment its screen closes up, and
    // the face went to a white slab when it did.
    const strengthOf = (p: P) => (colors.dark ? Math.pow(p.lum, 1.2) : 1 - p.lum);
    const radiusOf = (p: P) => {
      const st = strengthOf(p);
      if (st < 0.14) return 0;
      // 0.6 of a cell is a 1.2-cell diameter: on paper that is solid coverage,
      // which is what a shadow should be. Light has no equivalent, so the dark
      // run caps at 0.46 and the ground stays visible between the dots.
      const cap = colors.dark ? cell * 0.46 : cell * 0.6;
      return Math.max(0.5, Math.min(cap, st * cell * 0.72));
    };
    const colorOf = (p: P) => {
      const st = strengthOf(p);
      return st > 0.32 && st < 0.52 ? colors.accent : colors.ink;
    };
    const drawStatic = () => {
      c.clearRect(0, 0, W, W);
      for (const p of parts) {
        const r = radiusOf(p);
        if (!r) continue;
        c.fillStyle = colorOf(p);
        c.beginPath();
        c.arc(p.ax, p.ay, r, 0, 6.2832);
        c.fill();
      }
    };

    const sample = () => {
      const off = document.createElement("canvas");
      off.width = COLS;
      off.height = ROWS;
      const oc = off.getContext("2d", { willReadFrequently: true });
      if (!oc) return;
      try {
        // Cover-crop to a square, biased up so the crop keeps the face rather
        // than centring on the collar.
        const sA = img.naturalWidth / img.naturalHeight;
        let sx = 0;
        let sy = 0;
        let sw = img.naturalWidth;
        let sh = img.naturalHeight;
        if (sA > 1) {
          sw = img.naturalHeight;
          sx = (img.naturalWidth - sw) / 2;
        } else if (sA < 1) {
          sh = img.naturalWidth;
          sy = (img.naturalHeight - sh) * 0.2;
        }
        oc.drawImage(img, sx, sy, sw, sh, 0, 0, COLS, ROWS);
        const d = oc.getImageData(0, 0, COLS, ROWS).data;
        const next = new Float32Array(COLS * ROWS);
        const alpha = new Uint8Array(COLS * ROWS);
        let lo = 1;
        let hi = 0;
        for (let i = 0; i < COLS * ROWS; i++) {
          const on = d[i * 4 + 3] > 100 ? 1 : 0;
          alpha[i] = on;
          const l = (0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2]) / 255;
          next[i] = l;
          if (!on) continue;
          if (l < lo) lo = l;
          if (l > hi) hi = l;
        }
        // Auto-level across the subject only. The photograph is a cut-out and
        // never uses the full range: measured, it runs about 0.02 to 0.85. Left
        // raw, both branches spend most of their range on tones the picture
        // does not contain, and the print comes out flat.
        const span = hi - lo;
        if (span > 0.05) {
          for (let i = 0; i < COLS * ROWS; i++) next[i] = (next[i] - lo) / span;
        }
        lum = next;
        opaque = alpha;
      } catch {
        lum = null;
        opaque = null;
      }
    };

    const build = () => {
      if (!lum) return;
      W = cv.clientWidth || 260;
      cv.width = W * DPR;
      cv.height = W * DPR;
      c.setTransform(DPR, 0, 0, DPR, 0, 0);
      cell = W / COLS;
      readColors();
      // Bloom: two or three random ripple origins the dots grow outward from,
      // once per load. Different every visit, which is the only randomness on
      // the page and the reason the print feels struck rather than served.
      const seeds: { x: number; y: number; start: number }[] = [];
      const n = 2 + Math.floor(Math.random() * 2);
      for (let k = 0; k < n; k++) {
        seeds.push({
          x: Math.random() * W,
          y: Math.random() * W,
          start: k * (0.25 + Math.random() * 0.2),
        });
      }
      const SPREAD = 340;
      const next: P[] = [];
      for (let y = 0; y < ROWS; y++) {
        for (let x = 0; x < COLS; x++) {
          if (opaque && !opaque[y * COLS + x]) continue;
          const cx = x * cell + cell / 2;
          const cy = y * cell + cell / 2;
          let d0 = 0;
          if (!bloomed && !reduced) {
            d0 = 1e9;
            for (const sd of seeds) {
              d0 = Math.min(d0, sd.start + Math.hypot(cx - sd.x, cy - sd.y) / SPREAD);
            }
            d0 += Math.random() * 0.12;
          }
          next.push({ x: cx, y: cy, ax: cx, ay: cy, lum: lum[y * COLS + x], d0 });
        }
      }
      parts = next;
      t0 = performance.now();
      lastT = 0;
      // The finished print first, unconditionally. If the loop cannot start —
      // hidden tab, off-screen, reduced motion — the portrait still exists.
      drawStatic();
      bloomed = true;
      setDrawn(true);
      startLoop();
    };

    const loop = (now: number) => {
      if (!alive) return;
      raf = requestAnimationFrame(loop);
      const t = (now - t0) / 1000;
      lastT = t;
      // getComputedStyle every frame is far too costly, but every other frame
      // for the length of an ink tween is imperceptible and keeps the dots
      // travelling with the rest of the page instead of snapping at the end.
      if (now < recolorUntil && Math.round(t * 120) % 2 === 0) readColors();
      c.clearRect(0, 0, W, W);
      const R = 80;
      const R2 = R * R;
      const inside = mouse.x > -999;
      let anyLive = false;
      for (const p of parts) {
        let base = radiusOf(p);
        if (!base) continue;
        const age = t - p.d0;
        if (age <= 0) {
          anyLive = true;
          continue;
        }
        if (age < 0.45) {
          const k = age / 0.45;
          base *= 1 - (1 - k) * (1 - k) * (1 - k);
          anyLive = true;
        }
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const d2 = dx * dx + dy * dy;
        let tx = p.ax;
        let ty = p.ay;
        if (inside && d2 < R2) {
          const dd = Math.sqrt(d2) || 1;
          const f = ((R - dd) / R) * 24;
          tx = p.ax + (dx / dd) * f;
          ty = p.ay + (dy / dd) * f;
        }
        for (const rp of ripples) {
          const rx = p.ax - rp.x;
          const ry = p.ay - rp.y;
          const rd = Math.sqrt(rx * rx + ry * ry) || 1;
          const band = Math.abs(rd - rp.r);
          if (band < 26) {
            const pw = (1 - band / 26) * rp.a * 12;
            tx += (rx / rd) * pw;
            ty += (ry / rd) * pw;
          }
        }
        p.x += (tx - p.x) * 0.14;
        p.y += (ty - p.y) * 0.14;
        if (Math.abs(p.x - p.ax) > 0.25 || Math.abs(p.y - p.ay) > 0.25) anyLive = true;
        c.fillStyle = colorOf(p);
        c.beginPath();
        c.arc(p.x, p.y, base, 0, 6.2832);
        c.fill();
      }
      for (const rp of ripples) {
        rp.r += 6;
        rp.a *= 0.96;
      }
      ripples = ripples.filter((rp) => rp.r < W * 1.5 && rp.a > 0.04);
      if (ripples.length) anyLive = true;
      // Everything at rest and the hand gone: stop, and hold the finished print.
      if (!anyLive && !inside && performance.now() > recolorUntil) stopLoop();
    };

    function startLoop() {
      if (!raf && alive && visible && !reduced && !document.hidden && parts.length) {
        t0 = performance.now() - lastT * 1000;
        raf = requestAnimationFrame(loop);
      }
    }
    // Stopping always repaints. The loop clears the canvas at the top of every
    // frame and repaints it at the bottom, so anything that suspends it in
    // between leaves the portrait blank: switching tabs, scrolling it out of
    // view, or a reduced-motion preference arriving mid-flight. The finished
    // print is the correct resting state in every one of those cases, so it is
    // drawn here rather than at each call site.
    function stopLoop() {
      cancelAnimationFrame(raf);
      raf = 0;
      if (parts.length) drawStatic();
    }

    const local = (e: PointerEvent) => {
      const r = cv.getBoundingClientRect();
      return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * W };
    };
    let greeted = false;
    const onMove = (e: PointerEvent) => {
      const p = local(e);
      mouse.x = p.x;
      mouse.y = p.y;
      startLoop();
    };
    const onEnter = (e: PointerEvent) => {
      if (greeted || reduced) return;
      greeted = true;
      const p = local(e);
      ripples.push({ x: p.x, y: p.y, r: 0, a: 0.5 });
      startLoop();
    };
    const onLeave = () => {
      mouse.x = -9e3;
      mouse.y = -9e3;
      startLoop();
    };
    const onDown = (e: PointerEvent) => {
      if (reduced) return;
      const p = local(e);
      ripples.push({ x: p.x, y: p.y, r: 0, a: 1 });
      fxRef.current?.pluck(470);
      startLoop();
    };
    cv.addEventListener("pointermove", onMove);
    cv.addEventListener("pointerenter", onEnter);
    cv.addEventListener("pointerleave", onLeave);
    cv.addEventListener("pointerdown", onDown);

    // An ink or theme change is a token interpolation, and a MutationObserver
    // fires once, at the start of it. Re-reading for the length of the tween is
    // what makes the face re-ink along with everything else.
    const obs = new MutationObserver(() => {
      readColors();
      recolorUntil = performance.now() + 420;
      if (reduced || !raf) drawStatic();
      startLoop();
      window.clearTimeout(recolorTid);
      recolorTid = window.setTimeout(() => {
        readColors();
        if (!raf) drawStatic();
      }, 430);
    });
    obs.observe(root, { attributes: true, attributeFilter: ["data-theme", "data-ink"] });

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) startLoop();
      else stopLoop();
    });
    io.observe(cv);
    const onVis = () => {
      if (document.hidden) stopLoop();
      else startLoop();
    };
    document.addEventListener("visibilitychange", onVis);

    let rz = 0;
    const onResize = () => {
      clearTimeout(rz);
      rz = window.setTimeout(() => {
        if ((cv.clientWidth || 260) !== W) build();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    const init = () => {
      sample();
      build();
    };
    // Attach before checking `complete`: on a warm cache the load event fires
    // during the src assignment, so a handler attached afterwards never runs.
    if (img.complete && img.naturalWidth) init();
    else img.addEventListener("load", init, { once: true });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearTimeout(rz);
      window.clearTimeout(recolorTid);
      obs.disconnect();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVis);
      cv.removeEventListener("pointermove", onMove);
      cv.removeEventListener("pointerenter", onEnter);
      cv.removeEventListener("pointerleave", onLeave);
      cv.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <figure className="fig" data-drawn={drawn ? "true" : undefined}>
      {/* eslint-disable-next-line @next/next/no-img-element -- the canvas samples
          this element directly, so it has to be the raw file rather than a
          generated srcset the sampler cannot predict. 21 kB, one request. */}
      <img
        ref={imgRef}
        className="fig-photo"
        src="/portrait/ganapativs.webp"
        alt="Ganapati V S"
        width={512}
        height={512}
        decoding="async"
      />
      <canvas ref={cvRef} role="img" aria-label="Halftone portrait of Ganapati V S" />
      <svg viewBox="0 0 420 360" aria-hidden="true">
        <defs>
          <marker
            id="dim-arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 .8 8 4 0 7.2z" fill="context-stroke" />
          </marker>
        </defs>
        {/* Height: the years. Width: the title. Both are real dimensions of the
            subject, which is the joke and also the point. */}
        <line className="ext" x1="290" y1="30" x2="336" y2="30" pathLength="1" />
        <line className="ext" x1="290" y1="290" x2="336" y2="290" pathLength="1" />
        <line
          className="dim"
          x1="328"
          y1="36"
          x2="328"
          y2="284"
          pathLength="1"
          markerStart="url(#dim-arrow)"
          markerEnd="url(#dim-arrow)"
        />
        <text className="anno" x="342" y="160" transform="rotate(-90 342 160)" textAnchor="middle">
          12 yrs experience
        </text>

        <line className="ext" x1="24" y1="296" x2="24" y2="336" pathLength="1" />
        <line className="ext" x1="284" y1="296" x2="284" y2="336" pathLength="1" />
        <line
          className="dim"
          x1="30"
          y1="328"
          x2="278"
          y2="328"
          pathLength="1"
          markerStart="url(#dim-arrow)"
          markerEnd="url(#dim-arrow)"
        />
        <text className="anno" x="154" y="349" textAnchor="middle">
          VP of Technology, Tracxn
        </text>

        <circle className="dot anno" cx="196" cy="66" r="2" />
        <path className="ldr" d="M198 64 L316 14 L412 14" pathLength="1" />
        <text className="anno" x="412" y="8" textAnchor="end">
          56 × 56 halftone · poke it
        </text>
      </svg>
    </figure>
  );
}
