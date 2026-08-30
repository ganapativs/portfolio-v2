/**
 * Fig. 1's traffic, in WGSL.
 *
 * The exploded view's whole subject is a question moving down through five
 * layers, and until now the drawing showed none of it: five slabs, five labels,
 * and nothing between them. This is the movement the caption already describes.
 *
 * The particles are stateless, which is what makes thousands of them cost the
 * same as one. Nothing is stored between frames: a particle's position is a
 * pure function of its lane, its phase offset and the clock, so the shader
 * never asks where anything *was*. Per pixel it does the inverse — project onto
 * every segment of the route, take the nearest, and ask whether a mark is
 * passing through this point right now. Fourteen segments is a handful of dot
 * products, and the answer is exact at every zoom rather than being a sprite.
 *
 * Everything it draws is a mark on a drawing. Square dashes, one ink, no glow,
 * no trails: this is a flow annotation on a general arrangement, of the kind a
 * P&ID has had for eighty years, and the only reason it needs a GPU is that
 * there are enough of them, moving independently enough, that laying them out
 * as elements would be a thousand nodes animating on the main thread.
 *
 * Three things in it are the architecture rather than decoration:
 *
 *   The router splits into three and only one lane is inked. That is the whole
 *   claim of the layer: one question in, one model out.
 *
 *   The eval gate turns some marks back. They run the segment again and pass
 *   the second time, which is what a version failing its evals actually costs.
 *
 *   Hovering a layer stops the traffic everywhere else. The drawing answers the
 *   question you are asking it.
 */
export const FLOW_WGSL = /* wgsl */ `
struct Flow {
  /** The figure's viewBox, so pixels can be read in the drawing's own units. */
  vb: vec4f,
  /** Ink for ordinary traffic. */
  ink: vec4f,
  /** Ink for the taken route and for a passing eval. */
  accent: vec4f,
  res: vec2f,
  /** x: seconds. y: 0..1 master level, so it can fade rather than stop dead. */
  clock: vec2f,
  /** x: layer under the pointer, -1 for none. y: unused. */
  focus: vec2f,
};

@group(0) @binding(0) var<uniform> flow: Flow;

/** Slab geometry, matching components/schematic/Exploded.tsx exactly. */
const CX: f32 = 125.0;
const HALF_W: f32 = 95.0;
const HALF_H: f32 = 40.0;
const STEP: f32 = 88.0;
const Y0: f32 = 14.0;

/** Where a slab's face centre sits. */
fn mid(i: i32) -> f32 { return Y0 + f32(i) * STEP + HALF_H; }

/** The three points a route uses on one face, and the vertex below it. */
fn lft(i: i32) -> vec2f { return vec2f(CX - HALF_W + 6.0, mid(i)); }
fn rgt(i: i32) -> vec2f { return vec2f(CX + HALF_W - 6.0, mid(i)); }
fn bot(i: i32) -> vec2f { return vec2f(CX, mid(i) + HALF_H); }

/**
 * The route, and every segment of it lies on the drawing.
 *
 * Three segments per layer: across the face from its left vertex to its right
 * one, down the slab's front-right edge to the vertex where the stack meets,
 * and down the next slab's back-left edge to its left vertex. Nothing cuts
 * across the plate. The first draft ran straight diagonals between layers and
 * they read as a saltire laid over the figure, because a line that does not
 * follow the geometry is not part of the drawing.
 *
 * Lanes 1 and 2 are the router's roads not taken. Lane 3 is the eval run that
 * is sent back and tried again.
 */
struct Seg { a: vec2f, b: vec2f, layer: i32, lane: i32 };

fn seg(i: i32) -> Seg {
  switch i {
    case 0:  { return Seg(lft(0), rgt(0), 0, 0); }
    case 1:  { return Seg(rgt(0), bot(0), 0, 0); }
    case 2:  { return Seg(bot(0), lft(1), 1, 0); }

    case 3:  { return Seg(lft(1), rgt(1), 1, 0); }
    // The two the router did not pick, leaving the decision and stopping.
    case 4:  { return Seg(vec2f(CX, mid(1)), vec2f(CX + 45.0, mid(1) - 19.0), 1, 1); }
    case 5:  { return Seg(vec2f(CX, mid(1)), vec2f(CX + 45.0, mid(1) + 19.0), 1, 2); }
    case 6:  { return Seg(rgt(1), bot(1), 1, 0); }
    case 7:  { return Seg(bot(1), lft(2), 2, 0); }

    case 8:  { return Seg(lft(2), rgt(2), 2, 0); }
    case 9:  { return Seg(rgt(2), bot(2), 2, 0); }
    case 10: { return Seg(bot(2), lft(3), 3, 0); }

    case 11: { return Seg(lft(3), rgt(3), 3, 0); }
    // Sent back by the gate, and run again.
    case 12: { return Seg(vec2f(CX + 40.0, mid(3) - 9.0), vec2f(CX - 22.0, mid(3) + 9.0), 3, 3); }
    case 13: { return Seg(rgt(3), bot(3), 3, 0); }
    case 14: { return Seg(bot(3), lft(4), 4, 0); }

    case 15: { return Seg(lft(4), rgt(4), 4, 0); }
    default: { return Seg(rgt(4), vec2f(CX + HALF_W + 2.0, mid(4)), 4, 0); }
  }
}

const SEGS: i32 = 17;
/** Distance between marks, in drawing units. */
const PITCH: f32 = 17.0;
/** Half the length of one mark. */
const MARK: f32 = 2.0;
/** Drawing units a second. */
const SPEED: f32 = 46.0;

@fragment
fn fs_main(@location(0) uv: vec2f) -> @location(0) vec4f {
  // Into the drawing's own coordinates, so every constant above is the same
  // number it is in the component.
  let p = flow.vb.xy + uv * flow.vb.zw;
  // One drawing unit in device pixels, for anti-aliasing that holds at any size.
  let px = flow.vb.z / flow.res.x;

  var acc = 0.0;
  var lit = 0.0;

  for (var i = 0; i < SEGS; i = i + 1) {
    let s = seg(i);
    let ab = s.b - s.a;
    let len = length(ab);
    if (len < 0.001) { continue; }
    let dir = ab / len;
    let along = clamp(dot(p - s.a, dir), 0.0, len);
    // Distance to the *segment*, not to the line it lies on. Using the
    // perpendicular distance instead let every segment's clamped end-cap paint
    // a solid band out to the edge of the plate: past the end the travel stops
    // moving, so the whole region shares one phase, and any phase inside a mark
    // fills it. Five segments doing that is five bands across the drawing.
    let dist = length(p - (s.a + dir * along));
    if (dist > MARK + px * 2.0) { continue; }

    // How far the whole route has been walked by the time it reaches here.
    // The offset per segment keeps marks from lining up across a corner.
    let base = f32(i) * 37.0;
    var travel = base + along - flow.clock.x * SPEED;
    // The rejected eval run walks backwards, which is the point of it.
    if (s.lane == 3) { travel = base - along + flow.clock.x * SPEED * 0.7; }

    // Phase within one mark spacing: the particle system, inverted.
    let ph = abs(fract(travel / PITCH) - 0.5) * PITCH;
    let d = max(ph - MARK, dist - 1.6);
    let a = 1.0 - smoothstep(0.0, px * 1.6 + 0.35, d);
    if (a <= 0.0) { continue; }

    // A layer under the pointer keeps its traffic; the rest steps back.
    var level = 1.0;
    if (flow.focus.x >= 0.0) {
      level = select(0.18, 1.0, f32(s.layer) == flow.focus.x);
    }
    // The roads not taken are drawn, faintly. A router that showed only the
    // chosen path would not be showing a choice.
    if (s.lane == 1 || s.lane == 2) { level = level * 0.3; }

    if (s.lane == 0 && s.layer >= 1) {
      lit = max(lit, a * level);
    }
    acc = max(acc, a * level);
  }

  if (acc <= 0.002) { discard; }
  let col = mix(flow.ink, flow.accent, clamp(lit / max(acc, 0.001), 0.0, 1.0));
  let o = col.a * acc * flow.clock.y;
  return vec4f(col.rgb * o, o);
}
`;
