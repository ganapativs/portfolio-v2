/**
 * Flat glimm band with a real wavy edge.
 *
 * glimm's own createShader multiplies a 0.4% sine by waveAmount, so even
 * "strong" (2) is an 8px bend on a 1280px sheet — it reads as a straight
 * stripe. This is the same controller, same uniforms, with the mesh's three
 * sine harmonics (~5% at waveAmount 1) and a clamped palette so a six-ink
 * cosine fit cannot overshoot into white on the wake.
 */
import type { Direction, Palette, ShaderController } from "glimm";

const VS = `
attribute vec2 a;
void main(){ gl_Position = vec4(a, 0.0, 1.0); }
`;

const FS = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime, uProgress, uAlpha, uBandTight, uPosStart, uPosEnd;
uniform float uHueShift, uDirection, uWaveAmount, uRippleAmount, uWaveSpeed, uBrightness, uSwellAmount;
uniform vec3 uPalA, uPalB, uPalC, uPalD;
#define PI 3.14159265359
vec3 pal(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(2.0 * PI * (c * t + d));
}
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float axis  = mix(uv.x, uv.y, uDirection);
  float cross = mix(uv.y, uv.x, uDirection);
  float pos = uPosStart + uProgress * (uPosEnd - uPosStart);
  float tw = uTime * uWaveSpeed;
  float waveX = (sin(cross * 6.0 + tw * 1.3) * 0.028
    + sin(cross * 13.0 - tw * 0.9 + 1.4) * 0.016
    + sin(cross * 21.0 + tw * 1.7 + 2.6) * 0.008) * uWaveAmount;
  float d = (axis - pos) - waveX;
  float band = exp(-d * d * uBandTight);
  float dh = -2.0 * d * uBandTight * band;
  vec3 N = normalize(vec3(mix(-dh, 0.0, uDirection) * 0.18, mix(0.0, dh, uDirection) * 0.18, 1.0));
  float trail = pow(clamp(0.5 - d * 1.3, 0.0, 1.0), 2.5) * 0.12;
  float mid = 4.0 * uProgress * (1.0 - uProgress);
  float intensity = clamp(max(band, trail) + exp(-d * d * 2.5) * 0.12 * mid * (1.0 - band), 0.0, 1.0);
  float ripple = sin(cross * 12.0 + axis * 3.0 + tw * 0.40) * 0.015 * uRippleAmount;
  float t = N.x * 0.12 + N.y * 0.08 + axis * 0.90 + cross * 0.16 + ripple + uHueShift + uTime * 0.04;
  vec3 col = clamp(
    pal(t, uPalA, uPalB, uPalC, uPalD) * 0.50
    + pal(t - 0.18, uPalA, uPalB, uPalC, uPalD) * 0.25
    + pal(t + 0.18, uPalA, uPalB, uPalC, uPalD) * 0.25,
    0.0, 1.0) * uBrightness;
  vec3 L = normalize(vec3(0.35, 0.55, 0.9));
  vec3 H = normalize(L + vec3(0.0, 0.0, 1.0));
  float NdotH = clamp(dot(N, H), 0.0, 1.0);
  float NdotV = clamp(N.z, 0.0, 1.0);
  float fresnel = pow(1.0 - NdotV, 3.0);
  float spec = pow(NdotH, 80.0);
  float entry = mix(0.5, 1.0, mid);
  float bodyA = intensity * uAlpha * entry;
  vec3 bodyPM = col * bodyA;
  float highMask = band * uAlpha * entry * uSwellAmount;
  vec3 highEmit = (col * fresnel * 0.55 + vec3(spec) * 1.1) * highMask;
  float highA = (fresnel * 0.4 + spec * 0.9) * highMask;
  gl_FragColor = vec4(bodyPM + highEmit, min(bodyA + highA, 1.0));
}
`;

const dirU = (d: Direction) =>
  d === "rtl" || d === "btt"
    ? { axis: d === "btt" ? 1 : 0, posStart: 1.2, posEnd: -0.2 }
    : { axis: d === "ttb" ? 1 : 0, posStart: -0.2, posEnd: 1.2 };

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

const FALLBACK: Palette = {
  a: [0.5, 0.5, 0.5],
  b: [0.5, 0.5, 0.5],
  c: [1, 1, 1],
  d: [0, 0.33, 0.67],
};

export function createWavyShader(opts: {
  canvas: HTMLCanvasElement;
  palette?: Palette;
  bandTight?: number;
  direction?: Direction;
}): ShaderController | null {
  if (typeof window === "undefined") return null;
  const canvas = opts.canvas;
  const gl = canvas.getContext("webgl", {
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
  });
  if (!gl) return null;
  const compile = (type: number, src: string) => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      gl.deleteShader(s);
      return null;
    }
    return s;
  };
  const vs = compile(gl.VERTEX_SHADER, VS);
  const fs = compile(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) return null;
  const prog = gl.createProgram();
  if (!prog) return null;
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    gl.deleteProgram(prog);
    return null;
  }
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aLoc = gl.getAttribLocation(prog, "a");
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);
  const u = (n: string) => gl.getUniformLocation(prog, n);
  const uRes = u("uRes");
  const uTime = u("uTime");
  const uProgress = u("uProgress");
  const uAlpha = u("uAlpha");
  const uBandTight = u("uBandTight");
  const uPosStart = u("uPosStart");
  const uPosEnd = u("uPosEnd");
  const uHueShift = u("uHueShift");
  const uDirection = u("uDirection");
  const uWaveAmount = u("uWaveAmount");
  const uRippleAmount = u("uRippleAmount");
  const uWaveSpeed = u("uWaveSpeed");
  const uBrightness = u("uBrightness");
  const uSwellAmount = u("uSwellAmount");
  const uPalA = u("uPalA");
  const uPalB = u("uPalB");
  const uPalC = u("uPalC");
  const uPalD = u("uPalD");
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  const state = {
    progress: 0,
    alpha: 0,
    palette: opts.palette ?? FALLBACK,
    bandTight: clamp(opts.bandTight ?? 14, 0.1, 200),
    direction: opts.direction ?? ("ltr" as Direction),
    waveAmount: 1,
    rippleAmount: 1,
    waveSpeed: 1,
    brightness: 1,
    swellAmount: 0,
  };
  const hueShift = Math.random() * 0.4;
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
  };
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  const t0 = performance.now();
  let raf = 0;
  const tick = () => {
    const dir = dirU(state.direction);
    const p = state.palette;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uRes, canvas.width, canvas.height);
    gl.uniform1f(uTime, (performance.now() - t0) / 1e3);
    gl.uniform1f(uProgress, state.progress);
    gl.uniform1f(uAlpha, state.alpha);
    gl.uniform1f(uBandTight, state.bandTight);
    gl.uniform1f(uPosStart, dir.posStart);
    gl.uniform1f(uPosEnd, dir.posEnd);
    gl.uniform1f(uDirection, dir.axis);
    gl.uniform1f(uWaveAmount, state.waveAmount);
    gl.uniform1f(uRippleAmount, state.rippleAmount);
    gl.uniform1f(uWaveSpeed, state.waveSpeed);
    gl.uniform1f(uBrightness, state.brightness);
    gl.uniform1f(uSwellAmount, state.swellAmount);
    gl.uniform1f(uHueShift, hueShift);
    gl.uniform3f(uPalA, p.a[0], p.a[1], p.a[2]);
    gl.uniform3f(uPalB, p.b[0], p.b[1], p.b[2]);
    gl.uniform3f(uPalC, p.c[0], p.c[1], p.c[2]);
    gl.uniform3f(uPalD, p.d[0], p.d[1], p.d[2]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return {
    canvas,
    setProgress: (p) => {
      state.progress = clamp(p, 0, 1);
    },
    setAlpha: (a) => {
      state.alpha = clamp(a, 0, 1.5);
    },
    setPalette: (p) => {
      state.palette = p;
    },
    setBandTight: (b) => {
      state.bandTight = clamp(b, 0.1, 200);
    },
    setDirection: (d) => {
      state.direction = d;
    },
    setWaveAmount: (v) => {
      state.waveAmount = clamp(v, 0, 2);
    },
    setRippleAmount: (v) => {
      state.rippleAmount = clamp(v, 0, 2);
    },
    setWaveSpeed: (v) => {
      state.waveSpeed = clamp(v, 0, 3);
    },
    setBrightness: (v) => {
      state.brightness = clamp(v, 0, 1.5);
    },
    setSwellAmount: (v) => {
      state.swellAmount = clamp(v, 0, 1);
    },
    getProgress: () => state.progress,
    getAlpha: () => state.alpha,
    destroy: () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.deleteProgram(prog);
      if (buf) gl.deleteBuffer(buf);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
    },
  };
}
