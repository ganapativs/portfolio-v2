"use client";
import { useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { useCoarsePointer } from "./useCoarsePointer";
import { useDrawOnFirstView } from "./useDrawOnFirstView";

/**
 * Fig. 3 — sgb, in general arrangement.
 *
 * A drawing of the real interface rather than a screenshot of it, and rather
 * than a chart of invented numbers. The site is a grid of every live Sovereign
 * Gold Bond series; one of those tiles is taken out and drawn at size with its
 * parts named, which is what a detail callout on a drawing is for.
 *
 * Nothing here is a number. The tile shows where the ticker, the live price and
 * the two derived rates sit, and the callouts say what each one is. Inventing a
 * plausible-looking 0.81% would have been the easy way to fill the space and
 * would have been the only dishonest thing on the page.
 */
const PARTS = [
  {
    id: "series",
    label: "65 series",
    note: "Every live series on one page. The scraper reads them on a schedule and writes one JSON file.",
  },
  {
    id: "price",
    label: "live price",
    note: "The traded price on NSE and BSE, against the IBJA gold price for the day.",
  },
  {
    id: "rates",
    label: "what you earn",
    note: "The two derived rates: effective interest rate, and effective cash flow rate. These are the numbers the coupon printed on the face value does not tell you, and the whole reason the tracker exists.",
  },
] as const;

export function SgbFigure() {
  const [on, setOn] = useState<string | null>(null);
  const coarse = useCoarsePointer();
  const fx = useFX();
  const svgRef = useDrawOnFirstView<SVGSVGElement>();
  const cur = PARTS.find((p) => p.id === on);

  const enter = (id: string) => {
    if (id === on) return;
    setOn(id);
    fx?.tick();
  };

  return (
    <>
      <svg
        ref={svgRef}
        className="sgbfig willdraw"
        viewBox="0 0 300 112"
        role="img"
        aria-label="A drawing of the sgb interface: a grid of bond series, with one series card enlarged and its parts named"
      >
        {/* The population: 65 tiles, drawn as the field the detail is taken
            from. Eight across, so the last row is deliberately short — 65 is
            not a round number and the drawing does not pretend it is. */}
        <g
          className="sgb-grid sgb-hit"
          data-on={on === "series"}
          onPointerEnter={() => enter("series")}
          onPointerLeave={() => setOn(null)}
          onClick={() => enter("series")}
        >
          {/* One transparent target over the whole field. Without it the only
              hoverable pixels are the 1px strokes themselves, and the pointer
              crossing a gap reads as a leave: the caption flickered on every
              small movement. */}
          <rect className="sgb-hitbox" x="0" y="20" width="122" height="70" />
          {Array.from({ length: 65 }, (_, i) => (
            <rect
              key={i}
              className="sgb-tile"
              x={4 + (i % 8) * 14}
              y={24 + Math.floor(i / 8) * 10}
              width={11}
              height={7}
              pathLength="1"
            />
          ))}
        </g>

        {/* The two tangents that tie the detail to the tile it came from. */}
        <path className="sgb-ldr" d="M16 24 L150 10" pathLength="1" />
        <path className="sgb-ldr" d="M16 31 L150 104" pathLength="1" />
        <rect className="sgb-pick" x="3.5" y="23.5" width="12" height="8" pathLength="1" />

        {/* The detail: one series card at size. */}
        <g className="sgb-card">
          <rect className="sgb-frame" x="150" y="10" width="146" height="94" pathLength="1" />
          <g
            className="sgb-hit"
            data-on={on === "price"}
            onPointerEnter={() => enter("price")}
            onPointerLeave={() => setOn(null)}
            onClick={() => enter("price")}
          >
            <rect className="sgb-hitbox" x="150" y="10" width="146" height="37" />
            {/* A real ticker off the live site, not a plausible-looking one.
                There is no series maturing in 2031. */}
            <text className="sgb-t" x="162" y="28">
              SGBSEP28VI
            </text>
            <text className="sgb-t sgb-dim" x="162" y="40">
              Sep 20 - Sep 28 · NSE · BSE
            </text>
          </g>
          <line className="sgb-rule" x1="150" y1="47" x2="296" y2="47" pathLength="1" />
          <g
            className="sgb-hit"
            data-on={on === "rates"}
            onPointerEnter={() => enter("rates")}
            onPointerLeave={() => setOn(null)}
            onClick={() => enter("rates")}
          >
            <rect className="sgb-hitbox" x="150" y="47" width="146" height="57" />
            <text className="sgb-t sgb-dim" x="162" y="62">
              effective interest rate
            </text>
            <rect className="sgb-bar" x="162" y="68" width="86" height="4" pathLength="1" />
            <text className="sgb-t sgb-dim" x="162" y="87">
              effective cash flow rate
            </text>
            <rect className="sgb-bar" x="162" y="93" width="54" height="4" pathLength="1" />
          </g>
        </g>
      </svg>

      <div className="xp-cap" aria-live="polite">
        <div className="cap-in" key={on ?? "none"}>
          <b>{cur ? cur.label : "general arrangement"}</b>
          {cur
            ? cur.note
            : coarse
              ? "Tap a part of the interface to read what it is."
              : "Point at a part of the interface to read what it is."}
        </div>
      </div>
    </>
  );
}
