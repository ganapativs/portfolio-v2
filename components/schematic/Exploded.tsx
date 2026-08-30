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
const PARTS: { name: string; note: string; glyph: string[] }[] = [
  {
    name: "OpenAPI → docs",
    note: "The API documentation portal writes itself from the OpenAPI spec, and the assistant lives inside it. One source, two readers: a person and a model.",
    // A ruled page. The spec goes in one end and a documentation site comes out
    // the other, and a page of ruled lines is what that looks like from above.
    glyph: ["M-11 -9 H11 V9 H-11 Z", "M-7 -4 H7", "M-7 0 H7", "M-7 4 H2"],
  },
  {
    name: "model router",
    note: "One question in, one model out. The router reads what is being asked and sends it to the model that should answer it, so nothing costs more than it needs to.",
    // One line in, a node, a bus, three lines out. Manhattan routing, because a
    // fan of free angles is the first thing the projection destroys.
    glyph: [
      "M-15 0 H-7",
      "M-7 -4 H-1 V4 H-7 Z",
      "M-1 0 H4",
      "M4 -9 V9",
      "M4 -9 H15",
      "M4 0 H15",
      "M4 9 H15",
    ],
  },
  {
    name: "tools + skills",
    note: "The layer that goes and gets things. It reads Tracxn records on the assistant's behalf, and every skill is a separate testable unit rather than one enormous prompt.",
    // An integrated circuit: a body and its pins. A skill is a part you can pull
    // out and test on its own, which is the whole point of the layer.
    glyph: [
      "M-8 -7 H8 V7 H-8 Z",
      "M-8 -4 H-14",
      "M-8 0 H-14",
      "M-8 4 H-14",
      "M8 -4 H14",
      "M8 0 H14",
      "M8 4 H14",
    ],
  },
  {
    name: "eval harness",
    note: "Every prompt is versioned, and a version only ships when the evals pass. The logs are complete enough to answer, later, why a given answer came out the way it did.",
    // A checklist, two of three passing. An eval suite is a list of cases and a
    // verdict on each, and this is that list.
    glyph: [
      "M-14 -10 H-8 V-4 H-14 Z",
      "M-12 -7 L-10.5 -5.5 L-9 -9",
      "M-4 -7 H14",
      "M-14 -3 H-8 V3 H-14 Z",
      "M-12 0 L-10.5 1.5 L-9 -2",
      "M-4 0 H14",
      "M-14 4 H-8 V10 H-14 Z",
      "M-4 7 H8",
    ],
  },
  {
    name: "MCP server",
    note: "Read-only connectors behind OAuth, added after launch, so a coding client can reach the API without anyone pasting a key. The team co-owns it now.",
    // A plug entering a socket.
    glyph: ["M-15 0 H-9", "M-9 -6 H-3 V6 H-9 Z", "M-3 -3 H2", "M-3 3 H2", "M2 -9 H14 V9 H2 Z"],
  },
];

const W = 300;
const H = 330;
const STEP = 62;
const Y0 = 14;
const CX = 125;

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
            const top = `${CX},${y} ${CX + 95},${y + 27} ${CX},${y + 54} ${CX - 95},${y + 27}`;
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
                    points={`${CX - 95},${y + 27} ${CX},${y + 54} ${CX},${y + 62} ${CX - 95},${y + 35}`}
                    pathLength="1"
                  />
                  <polygon
                    className="side"
                    points={`${CX},${y + 54} ${CX + 95},${y + 27} ${CX + 95},${y + 35} ${CX},${y + 62}`}
                    pathLength="1"
                  />
                  <polygon points={top} pathLength="1" />
                  <polygon className="hatch" points={top} />
                  {/* Projected onto the slab's own plane, so each symbol lies
                      on the face rather than being pasted over it.

                      The matrix is the slab's geometry, not a guess: the top
                      face runs 95 across and 27 down, so its two axes are
                      (95, 27) and (-95, 27) normalised, which is (1, .284) and
                      (-1, .284). Scaled 2.2x because a symbol foreshortened
                      into that plane loses most of its apparent height.

                      2.6 rather than the 2.2 it started at: the face allows a
                      projected half-extent of 47.5 units either way, and
                      2.6 x 15 is 39, which fills the slab and still clears its
                      edges.

                      The symbols themselves had to be redrawn for it, twice.
                      Free angles and curves do not survive the shear — they
                      close up into a scribble — so every stroke now runs along
                      one of the face's own two axes and reads as a figure lying
                      on the surface. */}
                  <g
                    className="glyph"
                    transform={`translate(${CX} ${y + 27}) matrix(2.6 .739 -2.6 .739 0 0)`}
                  >
                    {p.glyph.map((d) => (
                      <path key={d} d={d} />
                    ))}
                  </g>
                </g>
                <path
                  className="leader"
                  d={`M${CX + 97} ${y + 27} L${W - 4} ${y + 27}`}
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
              style={{ top: `${((Y0 + i * STEP + 27) / H) * 100}%` }}
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

      {/* Keyed on the part, so the text remounts and replays `cap-in` on every
          change. The slot itself transitions its height around it. */}
      <div className="xp-cap" aria-live="polite">
        <div className="cap-in" key={on}>
          <b>{on < 0 ? "five layers" : PARTS[on].name}</b>
          {on < 0
            ? coarse
              ? "Tap a layer to read what it does."
              : "Point at a layer to read what it does."
            : PARTS[on].note}
        </div>
      </div>
    </>
  );
}
