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
 * Each glyph is drawn to say what that layer actually does, not to decorate it:
 * a spec sheet with a brace, a fan-out from one input to three models, a socket
 * board with one empty socket, a gauge whose needle sits in the pass band, and
 * a plug going into a keyed port. They are projected into the same isometric as
 * the slab they sit on, with a non-scaling 1px stroke, so each reads as printed
 * on the surface rather than dropped over it.
 */
const PARTS: { name: string; note: string; glyph: string[] }[] = [
  {
    name: "OpenAPI → docs",
    note: "The API documentation portal writes itself from the OpenAPI spec, and the assistant lives inside it. One source, two readers: people and the model.",
    // A spec sheet with a folded corner, ruled lines, and a brace pulling one
    // line out into a second sheet: a spec generating a document.
    glyph: [
      "M-9 -9 H1 L5 -5 V7 H-9 Z",
      "M1 -9 V-5 H5",
      "M-6 -2 H2 M-6 1 H2 M-6 4 H-1",
      "M7 -4 Q9 -1 7 1 Q9 3 7 6",
    ],
  },
  {
    name: "model router",
    note: "One question in, one model out. The router reads what is being asked and sends it to the model that should answer it, so nothing costs more than it needs to.",
    // One line in, a node, three lines out at different angles.
    glyph: [
      "M-11 0 H-3",
      "M-3 0 A2.4 2.4 0 1 0 1.8 0 A2.4 2.4 0 1 0 -3 0",
      "M2 -1.6 L10 -7 M2 0 H10 M2 1.6 L10 7",
    ],
  },
  {
    name: "tools + skills",
    note: "The layer that goes and gets things: it reads Tracxn records on the assistant's behalf, and each skill is a separate, testable unit rather than one large prompt.",
    // A socket board: three filled sockets and one empty, being added to.
    glyph: [
      "M-10 -8 H10 V8 H-10 Z",
      "M-7 -5 H-3 V-1 H-7 Z",
      "M-1 -5 H3 V-1 H-1 Z",
      "M-7 1 H-3 V5 H-7 Z",
      "M3 3 H7 M5 1 V5",
    ],
  },
  {
    name: "eval harness",
    note: "Every prompt is versioned, and a version only ships when the evals pass. The logs are complete enough to answer, later, why a given answer came out the way it did.",
    // A dial with a marked pass band and the needle inside it.
    glyph: [
      "M-9 4 A9 9 0 0 1 9 4",
      "M-6.4 -2.4 L-4.9 -1 M0 -5.4 V-3.4 M6.4 -2.4 L4.9 -1",
      "M2.2 -4.6 A7 7 0 0 1 6.6 -0.6",
      "M0 4 L4.4 -1.6",
      "M1.4 4 A1.4 1.4 0 1 0 -1.4 4 A1.4 1.4 0 1 0 1.4 4",
    ],
  },
  {
    name: "MCP server",
    note: "Read-only connectors behind OAuth, added after launch, so a coding client can reach the API without anyone pasting a key. The team co-owns it now.",
    // A plug with two pins entering a keyed port.
    glyph: ["M-6 -1 H6 V6 H-6 Z", "M-3 -1 V-8 M3 -1 V-8", "M0 6 V10", "M-9 10 H9"],
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
                  <g
                    className="glyph"
                    transform={`translate(${CX} ${y + 27}) matrix(1.8 .5 -1.8 .5 0 0)`}
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
