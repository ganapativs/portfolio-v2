"use client";
import { useEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
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
type Stroke = { d: string; solid?: boolean; dash?: boolean };

const PARTS: { name: string; note: string; glyph: Stroke[] }[] = [
  {
    name: "OpenAPI → docs",
    note: "The API documentation portal writes itself from the OpenAPI spec, and the assistant lives inside it. One source, read once by a person and once by a model.",
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
    // One line in, three models. The one it picked is solid; the two it did not
    // are dashed, which is the drawing convention for a thing that is there but
    // not taken. A decision, drawn as a decision.
    glyph: [
      { d: "M-16 0 H-4" },
      { d: "M-4 -14 H14 V-6 H-4 Z", dash: true },
      { d: "M-4 -4 H14 V4 H-4 Z", solid: true },
      { d: "M-4 6 H14 V14 H-4 Z", dash: true },
    ],
  },
  {
    name: "tools + skills",
    note: "The layer that fetches. It reads Tracxn records on the assistant's behalf, and every skill is a separate testable unit rather than one enormous prompt.",
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
    note: "Every prompt is versioned, and a version ships only when the evals pass. The logs are full enough to answer, later, why an answer came out the way it did.",
    // Two cases: one passes, one does not. A single tick read as "done", which
    // is not what an eval suite is. A suite is a thing that can fail, and the
    // cross is the half that makes the tick mean anything.
    glyph: [
      { d: "M-15 -13 H-1 V1 H-15 Z" },
      { d: "M-12 -6 L-9 -3 L-4 -10" },
      { d: "M1 -1 H15 V13 H1 Z" },
      { d: "M4 2 L12 10" },
      { d: "M12 2 L4 10" },
    ],
  },
  {
    name: "MCP server",
    note: "Read-only connectors behind OAuth, added after launch, so a coding client can reach the API without anyone pasting a key. The team co-owns it now.",
    // A plug entering a port. Not the protocol's own mark, which is drawn in
    // curves that would not survive this projection and is not mine to reuse
    // anyway: this is the metaphor its own documentation opens with, that MCP
    // is a USB-C port for AI applications. So a port with the tongue in it, and
    // a plug on a lead going in.
    glyph: [
      { d: "M-16 0 H-11" },
      { d: "M-11 -7 H-3 V7 H-11 Z" },
      { d: "M-3 -3 H2" },
      { d: "M-3 3 H2" },
      { d: "M2 -11 H16 V11 H2 Z" },
      { d: "M7 -4 H12 V4 H7 Z", solid: true },
    ],
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
 * The face's two axes are (HALF_W, HALF_H) and (-HALF_W, HALF_H). The symbol's
 * x runs up-right along the first and its y runs down-right along the second,
 * which is the quarter turn from the obvious mapping: with x down-right and y
 * down-left every symbol read as if it had been laid on the slab sideways.
 * Either assignment keeps the symbol in the plane, because both are just ways
 * of parameterising the same face, so this is purely a question of which way
 * the figure faces. It faces the reader now.
 *
 * 2.6 is as large as the symbol can be drawn and still clear the edges: the
 * face allows a projected half-extent of HALF_W either way, and 2.6 x 16 x 2 is
 * 83 of 95.
 */
const GS = 2.6;
const GK = (HALF_H / HALF_W) * GS;

export function Exploded({ fig, body }: { fig: string; body: string }) {
  // `dir` rides with `on` rather than in a ref, because it is read during
  // render: the note enters from the side of the stack the pointer came from,
  // and a ref written just before setState is not guaranteed to survive a
  // double render.
  const [{ on, dir }, setSel] = useState({ on: -1, dir: 1 });
  const coarse = useCoarsePointer();
  const fx = useFX();
  const clearTid = useRef(0);
  const { ref: svgRef, replay } = useDrawOnFirstView<SVGSVGElement>();

  useEffect(() => () => window.clearTimeout(clearTid.current), []);

  const enter = (i: number) => {
    window.clearTimeout(clearTid.current);
    if (i === on) return;
    // Down the stack, the note rises into place from below; up the stack it
    // drops in from above. The text travels the way the eye just did.
    setSel({ on: i, dir: i > on ? 1 : -1 });
    fx?.tick();
  };
  // A short grace period, because moving from a slab to its own label leaves
  // both for a frame and the note would otherwise blink.
  const leave = () => {
    window.clearTimeout(clearTid.current);
    clearTid.current = window.setTimeout(() => setSel({ on: -1, dir: -1 }), 60);
  };

  const rest = coarse ? "five layers · tap one" : "five layers · point at one";

  return (
    <>
      {/* The plate number is the replay control. The assembly draws itself once
          per load, and a reader who scrolled past it in a hidden tab never saw
          it; this is the same pass, on request, and it is where a reader would
          look to find out what they were looking at. */}
      <button type="button" className="p-fig p-fig-replay" onClick={replay}>
        {fig}
        <span className="sr-only"> — replay the drawing</span>
      </button>
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
                  {/* The setting-out line.
                      
                      The slab's own outline, faint and undashed, present from
                      the first byte of HTML and rubbed out once the inked line
                      has been drawn over it. Without it the plate is simply
                      empty until the draw-in runs, which is a 370px hole where
                      the figure is going to be: the drawn stroke is hidden by
                      its dash offset and the faces are hidden by fill-opacity,
                      so there is nothing left to see. A drawing is set out in
                      pencil before it is inked, so that is what is there. */}
                  <polygon className="ghost" points={top} />
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
                    transform={`translate(${CX} ${m}) matrix(${GS} ${-GK} ${GS} ${GK} 0 0)`}
                  >
                    {p.glyph.map((g) => (
                      <path
                        key={g.d}
                        d={g.d}
                        className={g.solid ? "solid" : g.dash ? "dash" : undefined}
                      />
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
              aria-describedby="xp-cap-assistant"
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

      {/* One note slot, and it does not resize.
          
          It used to be a Caption, which measures its old and new heights and
          interpolates between them, and it sat above a second paragraph that
          carried the panel's own copy. Two blocks of prose, and the top one
          grew and shrank every time a pointer crossed a label: five expansions
          and five collapses to read five layers, with the whole plate pumping
          under them.
          
          So the panel's copy moved in here as the resting state, and the slot
          reserves its own height. Every string it can hold is rendered into the
          same grid cell, all but the live one `visibility: hidden`, so the row
          is always as tall as the tallest of them at whatever width the plate
          happens to be. Evening the copy up gets close and breaks at one
          viewport in five, because a line break is a function of where the
          spaces fall and not of the character count. This is exact at every
          width, and it stays exact when the copy is next edited.
          
          It is not a live region. It changes under the pointer, and a figure
          with five parts announced five times while a pointer crossed it. The
          labels point at it with aria-describedby instead, so it is read once,
          on focus, as the description of the thing focused. */}
      <div className="p-body xp-note" id="xp-cap-assistant">
        <div
          className="cap-in"
          key={String(on)}
          style={{ "--cap-dir": dir } as React.CSSProperties}
        >
          <b>{on < 0 ? rest : PARTS[on].name}</b>
          {on < 0 ? body : PARTS[on].note}
        </div>
        {[{ b: rest, n: body }, ...PARTS.map((p) => ({ b: p.name, n: p.note }))].map((x) => (
          <div className="xp-ghost" key={x.b} aria-hidden="true">
            <b>{x.b}</b>
            {x.n}
          </div>
        ))}
      </div>
    </>
  );
}
