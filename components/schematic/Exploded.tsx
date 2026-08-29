"use client";
import { useEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
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
 * spec page carrying a brace pair, a multiplexer fanning one input to three
 * models, an integrated circuit with pins, runs measured against a threshold
 * with a pass tick, and a plug entering a socket. Drawn in a 1px non-scaling
 * stroke so they read as printed on the slab.
 */
const PARTS: { name: string; note: string; glyph: string[] }[] = [
  {
    name: "OpenAPI → docs",
    note: "The API documentation portal writes itself from the OpenAPI spec, and the assistant lives inside it. One source, two readers: a person and a model.",
    // A page with a brace pair on it. Braces are what a spec looks like, and a
    // page is what comes out, so the symbol is the sentence.
    glyph: [
      "M-11 -13 H5 L11 -7 V13 H-11 Z",
      "M5 -13 V-7 H11",
      "M-5 -3 Q-8 -3 -8 0 Q-8 3 -5 3",
      "M4 -3 Q7 -3 7 0 Q7 3 4 3",
      "M-1 0 H1",
    ],
  },
  {
    name: "model router",
    note: "One question in, one model out. The router reads what is being asked and sends it to the model that should answer it, so nothing costs more than it needs to.",
    // A multiplexer: one line in, a decision node, three lines out.
    glyph: [
      "M-14 0 H-5",
      "M-5 0 A3 3 0 1 0 1 0 A3 3 0 1 0 -5 0",
      "M1 0 H5 L14 -9",
      "M5 0 H14",
      "M1 0 H5 L14 9",
    ],
  },
  {
    name: "tools + skills",
    note: "The layer that goes and gets things. It reads Tracxn records on the assistant's behalf, and every skill is a separate testable unit rather than one enormous prompt.",
    // An integrated circuit: a body with pins. A skill is a part you can pull
    // out and test on its own, which is the whole point of the layer.
    glyph: [
      "M-9 -8 H9 V8 H-9 Z",
      "M-9 -4 H-14 M-9 0 H-14 M-9 4 H-14",
      "M9 -4 H14 M9 0 H14 M9 4 H14",
      "M-4 -3 H4 M-4 1 H1",
    ],
  },
  {
    name: "eval harness",
    note: "Every prompt is versioned, and a version only ships when the evals pass. The logs are complete enough to answer, later, why a given answer came out the way it did.",
    // Runs measured against a threshold, and a tick for the gate. Three clear
    // it, one does not, which is what an eval suite actually looks like.
    glyph: [
      "M-14 6 H14",
      "M-14 -3 H6",
      "M-11 6 V-1 M-6 6 V-6 M-1 6 V2 M4 6 V-5",
      "M8 -6 L11 -3 L15 -10",
    ],
  },
  {
    name: "MCP server",
    note: "Read-only connectors behind OAuth, added after launch, so a coding client can reach the API without anyone pasting a key. The team co-owns it now.",
    // A plug entering a socket.
    glyph: ["M-14 -6 H-2 V6 H-14 Z", "M-2 -3 H3 M-2 3 H3", "M3 -7 H10 V7 H3 Z", "M10 0 H14"],
  },
];

const W = 300;
const H = 330;
const STEP = 62;
const Y0 = 14;
const CX = 125;

export function Exploded() {
  const [on, setOn] = useState(-1);
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

                      The symbols themselves had to be redrawn for it. The first
                      set was too finely detailed to survive the shear and the
                      strokes collapsed into each other; these are five strokes
                      each, spaced wide enough that the projection cannot close
                      them up. */}
                  <g
                    className="glyph"
                    transform={`translate(${CX} ${y + 27}) matrix(2.2 .625 -2.2 .625 0 0)`}
                  >
                    {p.glyph.map((d) => (
                      <path key={d} d={d} pathLength="1" />
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
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      <div className="xp-cap" aria-live="polite">
        <b>{on < 0 ? "five layers" : PARTS[on].name}</b>
        {on < 0 ? "Point at a layer to read what it does." : PARTS[on].note}
      </div>
    </>
  );
}
