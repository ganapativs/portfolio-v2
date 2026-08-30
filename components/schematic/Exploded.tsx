"use client";
import { useEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { Caption } from "./Caption";
import { useCoarsePointer } from "./useCoarsePointer";
import { useDrawOnFirstView } from "./useDrawOnFirstView";

/**
 * Fig. 1 — the assistant, exploded.
 *
 * Five layers of a real system, lifted apart the way a parts drawing lifts a
 * mechanism apart, so the stack is legible as a stack. Hovering a slab hatches
 * it, lifts it 4px and names it below; the leader lines tie the label column to
 * the geometry.
 *
 * Each glyph is a technical symbol for what that layer does, not decoration: a
 * ruled page, a one-to-three bus, an integrated circuit with pins, a checklist
 * with two of three passing, and a plug entering a socket. Drawn in a 1px
 * non-scaling stroke so they read as printed on the slab.
 *
 * Every stroke runs along one of the face's own two axes. That is the rule that
 * makes them legible: the projection turns a horizontal into a line sloping
 * down-right and a vertical into one sloping down-left, so a symbol built from
 * those two directions reads as a rectangle lying on the surface, while one
 * built from free angles and curves collapses into a scribble. The first two
 * sets did exactly that.
 */
type Stroke = { d: string; solid?: boolean };

const PARTS: { name: string; note: string; glyph: Stroke[] }[] = [
  {
    name: "OpenAPI → docs",
    note: "The API documentation portal writes itself from the OpenAPI spec, and the assistant lives inside it. One source, two readers: a person and a model.",
    // A page with a folded corner and two rules. The spec goes in one end and a
    // documentation site comes out the other.
    glyph: [
      { d: "M-12 -13 H5 L12 -6 V13 H-12 Z" },
      { d: "M5 -13 V-6 H12" },
      { d: "M-7 0 H7" },
      { d: "M-7 6 H2" },
    ],
  },
  {
    name: "model router",
    note: "One question in, one model out. The router reads what is being asked and sends it to the model that should answer it, so nothing costs more than it needs to.",
    // One line in, three models, one of them filled. Choosing is the whole job,
    // and a solid bar is the one mark that says "this one" after the shear.
    glyph: [
      { d: "M-16 0 H-4" },
      { d: "M-4 -14 H14 V-6 H-4 Z" },
      { d: "M-4 -4 H14 V4 H-4 Z", solid: true },
      { d: "M-4 6 H14 V14 H-4 Z" },
    ],
  },
  {
    name: "tools + skills",
    note: "The layer that goes and gets things. It reads Tracxn records on the assistant's behalf, and every skill is a separate testable unit rather than one enormous prompt.",
    // Four parts on a grid. A skill is a part you can pull out and test on its
    // own, which is the whole point of the layer.
    glyph: [
      { d: "M-14 -14 H-2 V-2 H-14 Z" },
      { d: "M2 -14 H14 V-2 H2 Z" },
      { d: "M-14 2 H-2 V14 H-14 Z" },
      { d: "M2 2 H14 V14 H2 Z" },
    ],
  },
  {
    name: "eval harness",
    note: "Every prompt is versioned, and a version only ships when the evals pass. The logs are complete enough to answer, later, why a given answer came out the way it did.",
    // A case, and a pass. Two strokes, which is all that survives at this size.
    glyph: [{ d: "M-13 -13 H13 V13 H-13 Z" }, { d: "M-8 0 L-2 6 L8 -7" }],
  },
  {
    name: "MCP server",
    note: "Read-only connectors behind OAuth, added after launch, so a coding client can reach the API without anyone pasting a key. The team co-owns it now.",
    // Two things and the line between them. That is what the layer is for: a
    // coding client at one end, the API at the other.
    glyph: [{ d: "M-16 -7 H-5 V7 H-16 Z" }, { d: "M-5 0 H5" }, { d: "M5 -7 H16 V7 H5 Z" }],
  },
];

/**
 * The slab, and why it is this shape.
 *
 * The top face used to be 190 x 54, a 3.5:1 lozenge, and nothing drawn on it
 * survived: a square came out as a 46-degree rhombus and every symbol closed up
 * into a scribble. At 190 x 80 the face is 2.4:1, the internal angle opens to
 * about 67 degrees, and a page reads as a page. The stack is taller for it, and
 * the plate had the height to spare.
 */
const W = 300;
const HALF_W = 95;
const HALF_H = 40;
/** How thick the slab is: the two side faces under the top one. */
const DEPTH = 8;
/** One slab's full height, so consecutive slabs meet at their vertices. */
const STEP = HALF_H * 2 + DEPTH;
const Y0 = 14;
const H = Y0 + STEP * 4 + HALF_H * 2 + DEPTH + 6;
const CX = 125;
/**
 * The glyph's change of basis into the face's own plane.
 *
 * The face's two axes are (HALF_W, HALF_H) and (-HALF_W, HALF_H), so a unit of
 * the symbol's x runs down-right and a unit of its y runs down-left. 2.6 is as
 * large as the symbol can be drawn and still clear the edges: the face allows a
 * projected half-extent of HALF_W either way, and 2.6 x 16 x 2 is 83 of 95.
 */
const GS = 2.6;
const GK = (HALF_H / HALF_W) * GS;

export function Exploded() {
  const [on, setOn] = useState(-1);
  const coarse = useCoarsePointer();
  const fx = useFX();
  const clearTid = useRef(0);
  const svgRef = useDrawOnFirstView<SVGSVGElement>();

  useEffect(() => () => window.clearTimeout(clearTid.current), []);

  const enter = (i: number) => {
    window.clearTimeout(clearTid.current);
    if (i === on) return;
    setOn(i);
    fx?.tick();
  };
  // A short grace period, because moving from a slab to its own label leaves
  // both for a frame and the caption would otherwise blink.
  const leave = () => {
    window.clearTimeout(clearTid.current);
    clearTid.current = window.setTimeout(() => setOn(-1), 60);
  };

  return (
    <>
      <div className="xp">
        <svg ref={svgRef} className="willdraw" viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
          <defs>
            <pattern
              id="hatchP"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <line x1="0" y1="0" x2="0" y2="6" stroke="var(--accent)" strokeWidth="1" />
            </pattern>
          </defs>
          {PARTS.map((p, i) => {
            const y = Y0 + i * STEP;
            const m = y + HALF_H;
            const b = y + HALF_H * 2;
            const top = `${CX},${y} ${CX + HALF_W},${m} ${CX},${b} ${CX - HALF_W},${m}`;
            return (
              <g key={p.name}>
                <g
                  className="slab"
                  data-on={on === i}
                  style={{ ["--i" as string]: i }}
                  onPointerEnter={() => enter(i)}
                  onPointerLeave={leave}
                  onClick={() => enter(i)}
                >
                  <polygon
                    className="side"
                    points={`${CX - HALF_W},${m} ${CX},${b} ${CX},${b + DEPTH} ${CX - HALF_W},${m + DEPTH}`}
                    pathLength="1"
                  />
                  <polygon
                    className="side"
                    points={`${CX},${b} ${CX + HALF_W},${m} ${CX + HALF_W},${m + DEPTH} ${CX},${b + DEPTH}`}
                    pathLength="1"
                  />
                  <polygon points={top} pathLength="1" />
                  <polygon className="hatch" points={top} />
                  {/* Projected into the slab's own plane, so the symbol lies
                      on the face rather than being pasted over it. The matrix
                      is the face's geometry, not a guess; see GS and GK above.

                      The symbols were redrawn three times for this. Free angles
                      and curves do not survive the shear, and neither does fine
                      internal detail: what reads is four strokes or fewer, wide
                      apart, and one solid mark where something has to be
                      singled out. */}
                  <g
                    className="glyph"
                    transform={`translate(${CX} ${m}) matrix(${GS} ${GK} ${-GS} ${GK} 0 0)`}
                  >
                    {p.glyph.map((g) => (
                      <path key={g.d} d={g.d} className={g.solid ? "solid" : undefined} />
                    ))}
                  </g>
                </g>
                <path
                  className="leader"
                  d={`M${CX + HALF_W + 2} ${m} L${W - 4} ${m}`}
                  pathLength="1"
                />
              </g>
            );
          })}
        </svg>

        <div className="xp-labels">
          {PARTS.map((p, i) => (
            <button
              key={p.name}
              type="button"
              className="xp-label"
              data-on={on === i}
              data-analytics={`cta:assistant.${p.name}`}
              style={{ top: `${((Y0 + i * STEP + HALF_H) / H) * 100}%` }}
              onPointerEnter={() => enter(i)}
              onPointerLeave={leave}
              onFocus={() => enter(i)}
              onBlur={leave}
              onClick={() => enter(i)}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <Caption
        className="xp-cap"
        itemKey={String(on)}
        label={on < 0 ? "five layers" : PARTS[on].name}
      >
        {on < 0
          ? coarse
            ? "Tap a layer to read what it does."
            : "Point at a layer to read what it does."
          : PARTS[on].note}
      </Caption>
    </>
  );
}
