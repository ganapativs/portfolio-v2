"use client";

import { useEffect, useRef } from "react";

/**
 * Domain-warped fbm + caustic shimmer in the project palette.
 * Theme-aware, mouse-reactive, DPR-clamped, pauses offscreen,
 * honors prefers-reduced-motion.
 */

const VERT = /* glsl */ `
attribute vec2 a;
void main() { gl_Position = vec4(a, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uMouse;     // 0..1 normalized
uniform float uTheme;     // 0 light, 1 dark
uniform vec3  uAccent;    // current --accent (linear-ish sRGB 0..1)
uniform float uMono;      // 0 colorful (5-stop palette), 1 one-color (accent variants)

// brand palette (sRGB approximations of tokens.css accents)
const vec3 C_TERRA  = vec3(0.847, 0.529, 0.384); // terracotta #D88762
const vec3 C_SAFF   = vec3(0.910, 0.722, 0.420); // saffron    #E8B86B
const vec3 C_SAGE   = vec3(0.561, 0.639, 0.478); // sage       #8FA37A
const vec3 C_PLUM   = vec3(0.431, 0.318, 0.404); // plum       #6E5167
const vec3 C_ROSE   = vec3(0.788, 0.482, 0.482); // rose       #C97B7B
const vec3 C_COFFEE = vec3(0.486, 0.275, 0.157); // coffee     #7C4628
const vec3 C_KHADI  = vec3(0.984, 0.965, 0.918); // page bg light
const vec3 C_MOON   = vec3(0.060, 0.043, 0.035); // page bg dark

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    v += a * vnoise(p);
    p = rot * p * 2.02;
    a *= 0.5;
  }
  return v;
}

// 5-stop palette circulating through the warm earth tones
vec3 palette(float t) {
  t = fract(t);
  float seg = t * 5.0;
  float idx = floor(seg);
  float f   = smoothstep(0.0, 1.0, fract(seg));
  vec3 a = C_TERRA, b = C_SAFF;
  if (idx < 0.5)      { a = C_TERRA; b = C_SAFF;  }
  else if (idx < 1.5) { a = C_SAFF;  b = C_SAGE;  }
  else if (idx < 2.5) { a = C_SAGE;  b = C_PLUM;  }
  else if (idx < 3.5) { a = C_PLUM;  b = C_ROSE;  }
  else                 { a = C_ROSE;  b = C_TERRA; }
  return mix(a, b, f);
}

// Mono palette — variations of the active accent only. Uses a sine-shaped
// lightness curve so the shader's flowing fbm regions still read as
// distinct "values" of the same hue (deep → accent → light).
vec3 monoPalette(float t, vec3 accent) {
  float l = 0.5 + 0.45 * sin(fract(t) * 6.2831);
  vec3 dk = mix(accent, vec3(0.06, 0.04, 0.03), 0.62); // accent → deep ink
  vec3 lt = mix(accent, vec3(1.00, 0.97, 0.92), 0.45); // accent → warm cream
  return mix(
    mix(dk, accent, smoothstep(0.0, 0.5, l)),
    lt,
    smoothstep(0.5, 1.0, l)
  );
}

void main() {
  vec2 frag = gl_FragCoord.xy;
  vec2 uv   = (frag - 0.5 * uRes) / min(uRes.x, uRes.y);
  // Mouse range is reduced — a small cursor nudge shouldn't yank the whole
  // composition. The smoothed JS-side lerp does the rest of the calming.
  vec2 m    = (uMouse - 0.5) * 0.55;

  // Reduced motion never reaches the shader — the JS side stops the loop
  // entirely and CSS shows a static fallback — so time runs at one speed.
  float t = uTime * 0.028;

  // Theme-aware highlight target. In light, "highlights" paint TOWARD deep
  // coffee so they pop against khadi (cream-on-cream vanishes). Dark keeps
  // cream highlights against moonless. Same composition, inverted values.
  vec3 highlight = mix(vec3(0.20, 0.12, 0.07), vec3(1.0, 0.95, 0.85), uTheme);
  vec3 deepInk   = mix(vec3(0.22, 0.13, 0.07), vec3(1.0, 0.97, 0.92), uTheme);

  // domain warp — Iñigo-Quílez style
  vec2 p = uv * 1.35 + vec2(0.0, -0.1);
  vec2 q = vec2(
    fbm(p + vec2(0.0, 0.0) + t),
    fbm(p + vec2(5.2, 1.3) - t)
  );
  vec2 r = vec2(
    fbm(p + 3.4 * q + vec2(1.7, 9.2) + 0.21 * t + m * 0.45),
    fbm(p + 3.4 * q + vec2(8.3, 2.8) + 0.18 * t - m * 0.45)
  );
  float v = fbm(p + 3.6 * r);

  // base color flowing through palette — multi-stop in colorful mode,
  // accent variations in one-color mode (smooth blend on the toggle).
  float pT = v * 1.1 + t * 0.6 + 0.18 * length(uv);
  vec3 col = mix(palette(pT), monoPalette(pT, uAccent), uMono);

  // Accent tint — pulls the dominant hue toward the chosen color, strongest
  // at the crests. In one-color mode the result is already accent-derived,
  // so the extra tint is unnecessary (kept at near-zero) — without this the
  // result would over-saturate to flat accent.
  float accentMix = 0.30 + 0.55 * smoothstep(0.40, 0.95, v);
  col = mix(col, uAccent, accentMix * 0.60 * (1.0 - 0.85 * uMono));

  // caustic ribbons — sharp specular highlights catching the flow
  float caustic = pow(0.5 + 0.5 * sin(8.5 * length(r) - 4.0 * t), 7.0);
  col += caustic * highlight * 0.24;

  // bright crests — sun on water (inverted to ink-on-paper in light mode)
  float crest = smoothstep(0.74, 1.0, v);
  col = mix(col, deepInk, crest * 0.32);

  // dark wells — anchors the composition; deeper in light for visible depth.
  // In one-color mode the wells become dark variants of the accent so the
  // entire composition stays in one hue family.
  float well = smoothstep(0.30, 0.0, v);
  vec3 wellMulti = mix(C_COFFEE, C_PLUM, 0.5);
  vec3 wellMono = mix(uAccent, vec3(0.04, 0.03, 0.02), 0.62);
  col = mix(col, mix(wellMulti, wellMono, uMono), well * mix(0.42, 0.18, uTheme));

  // hot glow toward mouse — uses the live accent
  float md = exp(-2.4 * length(uv - m));
  col += md * uAccent * 0.28;

  // theme blend — recede into page bg. Light gets less recession so the
  // new dark highlights breathe through.
  vec3 bg = mix(C_KHADI, C_MOON, uTheme);
  float strength = mix(0.62, 0.92, uTheme);
  col = mix(bg, col, strength);

  // big radial light leak — pulls warmth toward upper-right of the hero.
  // In one-color mode the leak uses a lighter variant of the accent so the
  // glow stays in the chosen hue family.
  vec2 light = vec2(0.55, -0.35);
  float lleak = exp(-1.2 * length(uv - light));
  vec3 leakDarkMulti = mix(C_SAFF, C_TERRA, 0.5);
  vec3 leakDarkMono = mix(uAccent, vec3(1.00, 0.97, 0.92), 0.30);
  col += lleak * mix(highlight, mix(leakDarkMulti, leakDarkMono, uMono), uTheme) * mix(0.20, 0.12, uTheme);

  // soft vignette
  float vig = smoothstep(1.65, 0.05, length(uv * vec2(0.85, 1.05)));
  col *= mix(0.72, 1.10, vig);

  // film grain to kill banding
  float grain = hash21(frag + fract(uTime)) - 0.5;
  col += grain * 0.022;

  // Alpha — radial × vertical falloff, capped low (~30%) so a CSS overlay
  // layer can do the rest of the readability work without crushing the art.
  float aRad = smoothstep(1.45, 0.20, length(uv * vec2(0.92, 1.04)));
  float yN = frag.y / uRes.y;
  float aVert = smoothstep(0.02, 0.42, yN);
  float aCeil = mix(0.50, 0.34, uTheme);
  float a = aRad * aVert * aCeil;
  gl_FragColor = vec4(col * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type)!;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error("Shader compile failed: " + log);
  }
  return sh;
}

export function ShaderHero({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // Skip GL entirely under reduced-motion (checked below, after `init` is
    // defined, so un-reducing mid-session can still boot the shader). CSS
    // provides a static fallback gradient meanwhile.
    const reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Coarse-pointer (mobile/tablet/touchscreen) — cap at ~45fps to save battery.
    const coarseMQ = window.matchMedia("(pointer: coarse)");
    const targetFps = coarseMQ.matches ? 45 : 60;
    const minFrameMs = 1000 / targetFps;

    // Context creation + shader compile is the expensive part (main-thread
    // work on slow devices). Defer the WHOLE init to idle so first paint and
    // hydration land first — the art fades in a beat later.
    let innerCleanup: (() => void) | undefined;
    let idleId = 0;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const init = () => {
      const gl =
        (canvas.getContext("webgl", {
          antialias: false,
          premultipliedAlpha: true,
          alpha: true,
          // Required: the loop caps FPS below the display refresh rate (45fps
          // coarse / 60fps) and skips drawArrays on throttled + offscreen ticks.
          // With preserveDrawingBuffer:false those un-drawn composite frames show
          // a cleared buffer (flicker). Retaining the buffer costs a little GPU
          // memory but keeps the canvas stable between draws.
          preserveDrawingBuffer: true,
        }) as WebGLRenderingContext | null) ||
        (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

      if (!gl) return;

      let program: WebGLProgram | null = null;
      try {
        const vs = compile(gl, gl.VERTEX_SHADER, VERT);
        const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
        program = gl.createProgram()!;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
          throw new Error("Program link failed: " + gl.getProgramInfoLog(program));
        }
        gl.deleteShader(vs);
        gl.deleteShader(fs);
      } catch (err) {
        console.warn("[ShaderHero] init failed:", err);
        return;
      }

      gl.useProgram(program);

      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const aLoc = gl.getAttribLocation(program, "a");
      gl.enableVertexAttribArray(aLoc);
      gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(program, "uRes");
      const uTime = gl.getUniformLocation(program, "uTime");
      const uMouse = gl.getUniformLocation(program, "uMouse");
      const uTheme = gl.getUniformLocation(program, "uTheme");
      const uAccent = gl.getUniformLocation(program, "uAccent");
      const uMono = gl.getUniformLocation(program, "uMono");

      const onReduce = () => {
        // Live in both directions: opting in freezes to the CSS fallback,
        // opting back out resumes the loop (observers stay subscribed).
        cancelAnimationFrame(raf);
        if (reduceMQ.matches) {
          canvas.dataset.reduced = "true";
        } else {
          delete canvas.dataset.reduced;
          lastFrame = 0;
          raf = requestAnimationFrame(loop);
        }
      };
      reduceMQ.addEventListener?.("change", onReduce);

      const readTheme = () =>
        document.documentElement.getAttribute("data-theme") === "dark" ? 1 : 0;
      const readMono = () =>
        document.documentElement.getAttribute("data-mono") === "true" ? 1 : 0;

      // Accent — read --accent (hex or rgb) from <html> computed style.
      // Smoothly transitions when the user picks a new chip.
      const accent = { r: 0.847, g: 0.529, b: 0.384 };
      const accentTarget = { r: 0.847, g: 0.529, b: 0.384 };

      const parseColor = (raw: string): [number, number, number] | null => {
        const s = raw.trim();
        if (!s) return null;
        if (s[0] === "#") {
          const hex = s.slice(1);
          const h =
            hex.length === 3
              ? hex
                  .split("")
                  .map((c) => c + c)
                  .join("")
              : hex;
          if (h.length < 6) return null;
          const r = parseInt(h.slice(0, 2), 16) / 255;
          const g = parseInt(h.slice(2, 4), 16) / 255;
          const b = parseInt(h.slice(4, 6), 16) / 255;
          if ([r, g, b].some((n) => Number.isNaN(n))) return null;
          return [r, g, b];
        }
        const rgb = s.match(/-?\d+(?:\.\d+)?/g);
        if (rgb && rgb.length >= 3) {
          return [+rgb[0] / 255, +rgb[1] / 255, +rgb[2] / 255];
        }
        return null;
      };

      const readAccent = () => {
        const cs = getComputedStyle(document.documentElement);
        const raw =
          cs.getPropertyValue("--accent-live") || cs.getPropertyValue("--accent") || "#D88762";
        const parsed = parseColor(raw);
        if (parsed) {
          accentTarget.r = parsed[0];
          accentTarget.g = parsed[1];
          accentTarget.b = parsed[2];
        }
      };
      readAccent();
      accent.r = accentTarget.r;
      accent.g = accentTarget.g;
      accent.b = accentTarget.b;

      let theme = readTheme();
      let mono = readMono();
      let monoTarget = mono;
      // Constant / rarely-changing uniforms — uploaded here and on change, not
      // per frame. Program is already current from useProgram above.
      gl.uniform1f(uTheme, theme);
      const themeObs = new MutationObserver(() => {
        theme = readTheme();
        monoTarget = readMono();
        readAccent();
        gl.uniform1f(uTheme, theme);
      });
      // `style` is required: the accent picker writes --accent / --accent-live via
      // inline style.setProperty on <html> (lib/accents.ts), so dropping it would
      // freeze the shader's accent. `class` is intentionally omitted — none of the
      // three reads depend on it, so vt-recolor class toggles don't re-fire this.
      themeObs.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "data-mono", "style"],
      });

      let mx = 0.5;
      let my = 0.4;
      let tmx = mx;
      let tmy = my;
      const onMove = (e: PointerEvent) => {
        const rect = canvas.getBoundingClientRect();
        tmx = (e.clientX - rect.left) / rect.width;
        tmy = 1.0 - (e.clientY - rect.top) / rect.height;
      };
      window.addEventListener("pointermove", onMove, { passive: true });

      let visible = true;
      const io = new IntersectionObserver(
        (entries) => {
          visible = entries[0]?.isIntersecting ?? true;
        },
        { threshold: 0 },
      );
      io.observe(canvas);

      const isMobile = () => window.matchMedia("(max-width: 720px)").matches;
      const dpr = () => Math.min(window.devicePixelRatio || 1, isMobile() ? 1.25 : 1.5);
      const resize = () => {
        const r = canvas.getBoundingClientRect();
        const w = Math.max(1, Math.floor(r.width * dpr()));
        const h = Math.max(1, Math.floor(r.height * dpr()));
        if (canvas.width !== w || canvas.height !== h) {
          canvas.width = w;
          canvas.height = h;
        }
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uRes, w, h);
      };
      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(canvas);

      const start = performance.now();
      let raf = 0;
      let lastFrame = 0;
      const loop = (now: number) => {
        raf = requestAnimationFrame(loop);
        if (!visible || document.hidden) return;
        if (now - lastFrame < minFrameMs) return;
        lastFrame = now;
        const t = (now - start) / 1000;

        // glassy follow so cursor moves don't jolt the art
        mx += (tmx - mx) * 0.018;
        my += (tmy - my) * 0.018;

        accent.r += (accentTarget.r - accent.r) * 0.08;
        accent.g += (accentTarget.g - accent.g) * 0.08;
        accent.b += (accentTarget.b - accent.b) * 0.08;

        mono += (monoTarget - mono) * 0.06;

        // Per-frame uniforms only — uRes/uTheme are uploaded on change.
        gl.uniform1f(uTime, t);
        gl.uniform2f(uMouse, mx, my);
        gl.uniform3f(uAccent, accent.r, accent.g, accent.b);
        gl.uniform1f(uMono, mono);

        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      raf = requestAnimationFrame(loop);

      innerCleanup = () => {
        cancelAnimationFrame(raf);
        window.removeEventListener("pointermove", onMove);
        reduceMQ.removeEventListener?.("change", onReduce);
        themeObs.disconnect();
        io.disconnect();
        ro.disconnect();
        gl.deleteBuffer(buffer);
        if (program) gl.deleteProgram(program);
        // Intentionally not calling WEBGL_lose_context — under React Strict Mode
        // the second mount gets a dead context and the shader fails to compile.
      };
    };

    // Reduced-motion at mount: no GL at all. Listen for an opt-out so the
    // shader can still boot lazily if the user un-reduces mid-session.
    if (reduceMQ.matches) {
      canvas.dataset.reduced = "true";
      const onUnreduce = () => {
        if (reduceMQ.matches) return;
        reduceMQ.removeEventListener?.("change", onUnreduce);
        delete canvas.dataset.reduced;
        init();
      };
      reduceMQ.addEventListener?.("change", onUnreduce);
      return () => {
        reduceMQ.removeEventListener?.("change", onUnreduce);
        innerCleanup?.();
      };
    }

    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      idleId = w.requestIdleCallback(init, { timeout: 1000 });
    } else {
      timeoutId = setTimeout(init, 200);
    }

    return () => {
      if (idleId) w.cancelIdleCallback?.(idleId);
      if (timeoutId) clearTimeout(timeoutId);
      innerCleanup?.();
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className ? `shader-hero ${className}` : "shader-hero"}
    />
  );
}
