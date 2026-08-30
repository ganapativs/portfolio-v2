/**
 * The drafting lamp, in WGSL.
 *
 * The 2D version of this field (components/schematic/DitherField.tsx) walks a
 * grid of 4px cells on the CPU and fills a 2x2 block wherever a Gaussian beats
 * a Bayer threshold. That is all a main thread can afford, and it shows: the
 * dots are one size, the pool is a circle, and the light has no relationship to
 * anything else on the page.
 *
 * On the GPU the same idea costs nothing per pixel, so it can be the thing it
 * was always a sketch of:
 *
 *   The dot grows. A halftone screen carries tone by varying dot size against a
 *   fixed pitch, which is exactly what a coverage term does and exactly what a
 *   per-cell CPU loop cannot afford. The pitch stays at 4px so the field reads
 *   as the same screen the portrait is printed with.
 *
 *   The pool stretches. Distance is measured in a frame aligned to the hand's
 *   travel, so a moved lamp leaves an elongated pool and a still one leaves a
 *   circle. It is the difference between a light being carried and a light
 *   being teleported.
 *
 *   The sheet takes the light. A raking band just inside the sheet's own frame
 *   lifts where the lamp is near it, so the edge of the paper catches the lamp
 *   the way an edge does. The frame rectangle is passed in from the DOM; the
 *   drawing and the light finally know about each other.
 *
 * Everything else is unchanged from the 2D field on purpose: same 4px pitch,
 * same Bayer matrix, same token colour, same "at the edge of visible" level.
 * This is the same lamp, turned up.
 */
export const LAMP_WGSL = /* wgsl */ `
struct Lamp {
  /** The sheet's frame in CSS px: x, y, width, height. */
  sheet: vec4f,
  /** The dot colour, straight from --dither-dot. */
  ink: vec4f,
  res: vec2f,
  cur: vec2f,
  /** Direction and speed of travel, speed already clamped to 0..1. */
  vel: vec2f,
  /** x: overall level, 0 when the pointer has left. y: how much the frame lifts. */
  cfg: vec2f,
};

@group(0) @binding(0) var<uniform> lamp: Lamp;

/** The 4x4 ordered-dither threshold, by bit interleave rather than a lookup. */
fn bayer4(px: u32, py: u32) -> f32 {
  let x = px & 3u;
  let y = py & 3u;
  let a = x ^ y;
  let v = ((a & 1u) << 3u) | ((y & 1u) << 2u) | (((a >> 1u) & 1u) << 1u) | ((y >> 1u) & 1u);
  return (f32(v) + 0.5) / 16.0;
}

const PITCH: f32 = 4.0;
const SIGMA: f32 = 178.0;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  let p = uv * lamp.res;

  // The pool, measured in the hand's own frame so travel stretches it.
  var d = p - lamp.cur;
  let sp = length(lamp.vel);
  if (sp > 0.001) {
    let ax = lamp.vel / sp;
    let ay = vec2f(-ax.y, ax.x);
    d = vec2f(dot(d, ax) / (1.0 + sp * 0.85), dot(d, ay));
  }
  var f = lamp.cfg.x * 0.62 * exp(-dot(d, d) / (2.0 * SIGMA * SIGMA));

  // The sheet's edge, catching it. The inner distance is to the nearest
  // frame side; the band sits a few px inside and falls off with the lamp.
  let s = lamp.sheet;
  let inner = min(min(p.x - s.x, s.x + s.z - p.x), min(p.y - s.y, s.y + s.w - p.y));
  if (inner > 0.0 && s.z > 0.0) {
    let band = exp(-abs(inner - 5.0) / 9.0);
    let near = exp(-length(p - lamp.cur) / 470.0);
    f = f + band * near * lamp.cfg.x * lamp.cfg.y;
  }

  // The screen: one square per cell, its side set by how much tone is here.
  let cell = floor(p / PITCH);
  let tone = clamp(f * 1.35 - bayer4(u32(cell.x), u32(cell.y)) * 0.55, 0.0, 1.0);
  if (tone <= 0.002) {
    discard;
  }
  let q = abs(p - (cell + 0.5) * PITCH);
  let cov = clamp(tone * PITCH * 0.5 - max(q.x, q.y) + 0.5, 0.0, 1.0);
  let o = lamp.ink.a * cov;
  return vec4f(lamp.ink.rgb * o, o);
}
`;
