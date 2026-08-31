"use client";
import type { KeyboardEvent } from "react";
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
    note: "Every live series on one page. A scraper reads the exchanges on a schedule and writes one JSON file to S3, which is the whole of the backend.",
  },
  {
    id: "price",
    label: "live price",
    note: "The traded price on NSE and BSE, set against the IBJA gold price published for that day. Both are read fresh, because a stale quote ranks the wrong series.",
  },
  {
    id: "rates",
    label: "what you earn",
    note: "Two derived rates, the effective interest rate and the effective cash flow rate. The coupon on the face value tells you neither, which is why this exists.",
  },
] as const;

export function SgbFigure({ fig, body }: { fig: string; body: string }) {
  // `dir` rides with `on` because it is read during render. The three parts are
  // in drawing order, so moving along them carries the note the same way.
  const [{ on, dir }, setSel] = useState<{ on: string | null; dir: number }>({
    on: null,
    dir: 1,
  });
  const coarse = useCoarsePointer();
  const fx = useFX();
  const { ref: svgRef, replay } = useDrawOnFirstView<SVGSVGElement>();
  const cur = PARTS.find((p) => p.id === on);

  const idx = (id: string | null) => PARTS.findIndex((p) => p.id === id);
  const enter = (id: string) => {
    if (id === on) return;
    setSel({ on: id, dir: idx(id) > idx(on) ? 1 : -1 });
    fx?.tick();
  };
  const leave = () => setSel({ on: null, dir: -1 });

  /**
   * Each named part of the drawing is a real control.
   *
   * They were `<g>` elements with pointer handlers and nothing else, so the
   * three notes — which are the only place this figure says what it is showing
   * — could not be reached from a keyboard at all. An SVG group takes
   * `tabIndex` and a role, and Enter and Space have to be handled by hand
   * because it is not a `<button>`.
   */
  const part = (id: string, label: string) => ({
    className: "sgb-hit",
    role: "button",
    tabIndex: 0,
    "aria-label": label,
    "aria-describedby": "xp-cap-sgb",
    "data-on": on === id,
    onPointerEnter: () => enter(id),
    onPointerLeave: leave,
    onFocus: () => enter(id),
    onBlur: leave,
    onClick: () => enter(id),
    onKeyDown: (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        enter(id);
      }
    },
  });

  const rest = coarse
    ? "general arrangement · tap a part"
    : "general arrangement · point at a part";

  return (
    <>
      <button
        type="button"
        className="p-fig p-fig-replay"
        data-analytics="cta:figure.replay.sgb"
        onClick={replay}
      >
        {fig}
        <span className="sr-only">: replay the drawing</span>
      </button>
      <svg
        ref={svgRef}
        className="sgbfig willdraw"
        viewBox="0 0 300 112"
        role="img"
        aria-label="A drawing of the sgb interface, a grid of bond series with one series card enlarged and its parts named"
      >
        {/* The population: 65 tiles, drawn as the field the detail is taken
            from. Eight across, so the last row is deliberately short — 65 is
            not a round number and the drawing does not pretend it is. */}
        <g {...part("series", "65 series")} className="sgb-grid sgb-hit">
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
          <g {...part("price", "live price")}>
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
          <g {...part("rates", "what you earn")}>
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

      {/* One note slot that never resizes, the same arrangement as fig. 1 and
          for the same reason. This plate used to carry its copy in a paragraph
          above the drawing and a Caption below it, and the Caption measured and
          animated its height on every part: hovering the grid grew the block,
          hovering the rates grew it further, and because both plates in this
          row are grid items of one track, the react-spectrum plate beside it
          rose and fell along with it. The copy moved into the slot as its
          resting state, and every string the slot can hold is rendered into the
          same grid cell so it reserves the tallest of them at any width. See
          the longer note in Exploded.tsx. */}
      <div className="p-body xp-note" id="xp-cap-sgb">
        <div
          className="cap-in"
          key={on ?? "none"}
          style={{ "--cap-dir": dir } as React.CSSProperties}
        >
          <b>{cur ? cur.label : rest}</b>
          {cur ? cur.note : body}
        </div>
        {[{ b: rest, n: body }, ...PARTS.map((p) => ({ b: p.label, n: p.note }))].map((x) => (
          <div className="xp-ghost" key={x.b} aria-hidden="true">
            <b>{x.b}</b>
            {x.n}
          </div>
        ))}
      </div>
    </>
  );
}
