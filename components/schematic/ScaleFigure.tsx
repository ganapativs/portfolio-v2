import { AXIS, DOTS, GROOVE, HIT, MARKS, NOW, RULING, VIEW } from "@/lib/scale-of-time";

/**
 * Fig. 3 — scale of time, in its logarithmic groove.
 *
 * The real construction, not a picture of it: 13.8 billion years wound into a
 * spiral where one turn is a power of ten, with every one of the 1,040 sourced
 * milestones on the site plotted at its own "years ago". The geometry and the
 * paths are in lib/scale-of-time.ts.
 *
 * This is a server component and it has no state, which is deliberate. The
 * seven named marks are ordinary links to the milestone they point at, so
 * hovering or tabbing to one is a plain CSS state:
 * `.sotfig:has([data-mk="…"]:hover) ~ .sot-note` swaps the note slot. That is
 * the whole interaction, so the plate ships as HTML and adds nothing at all to
 * the page's JavaScript — the 1,040 values never leave the build.
 *
 * Nothing is written on the drawing except the ruling, which is the scale
 * itself. A ring is a detail mark and the note under the plate says what it is,
 * the same arrangement as fig. 4's three named parts. Labels led out to a
 * margin were drawn first and cost the figure a third of its width, which at
 * half a row set the groove at half size and stacked the labels.
 *
 * The note slot is the reserve-don't-animate arrangement figs. 1 and 4 use:
 * every string it can hold is rendered into one grid cell with all but the live
 * one `visibility: hidden`, so the row is as tall as its tallest note and the
 * plate cannot move when the text swaps.
 */
export function ScaleFigure({ fig, body }: { fig: string; body: string }) {
  const rest = "logarithmic spiral · one turn is a power of ten";
  return (
    <>
      <span className="p-fig p-fig-lead">{fig}</span>
      <svg
        className="sotfig"
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        role="img"
        aria-label="A logarithmic spiral of 13.8 billion years. Each turn is a power of ten, from the Big Bang on the outside to now at the centre, with 1,040 milestones marked along it."
      >
        {/* The ruling: an axis up from the centre, a tick at every other decade
            and a name on it. The names carry a paper-coloured stroke under
            their own glyphs (`paint-order`) because the marks crowd the axis in
            the last three turns and a label reading through a dot is not a
            label. */}
        <line className="sot-axis" x1={AXIS.x} y1={AXIS.y1} x2={AXIS.x} y2={AXIS.y2} />
        <path className="sot-groove" d={GROOVE} />
        {RULING.map((r) => (
          <g key={r.name}>
            <circle className="sot-tk" cx={AXIS.x} cy={r.y} r="1.1" />
            <text className="sot-lb" x={AXIS.x + 7} y={r.y + 2.6}>
              {r.name}
            </text>
          </g>
        ))}

        {/* All 1,040, as one path. See the note on DOTS. */}
        <path className="sot-dots" d={DOTS} />

        <circle className="sot-now" cx={NOW.x} cy={NOW.y} r="1.8" />
        <text className="sot-lb sot-lb-now" x={NOW.x + 7} y={NOW.y + 2.6}>
          NOW
        </text>

        {/* The seven named marks. Each is a link to that milestone on the live
            site, which is what makes it focusable, audible (PageFX ticks any
            `a`) and countable without a line of script here. */}
        {MARKS.map((m) => (
          <a
            key={m.id}
            className="sot-mk"
            data-mk={m.id}
            href={`https://scale-of-time.vercel.app/?e=${m.eid}`}
            target="_blank"
            rel="noopener"
            aria-label={`${m.label}, ${m.sub}`}
            aria-describedby="xp-cap-sot"
            data-analytics={`cta:scale-of-time.${m.id}`}
          >
            <circle className="sot-mdot" cx={m.x} cy={m.y} r="3.4" />
            <circle className="sot-hit" cx={m.x} cy={m.y} r={HIT} />
          </a>
        ))}
      </svg>

      <div className="p-body xp-note sot-note" id="xp-cap-sot">
        <div data-n="rest">
          <b>{rest}</b>
          {body}
        </div>
        {MARKS.map((m) => (
          <div data-n={m.id} key={m.id}>
            <b>
              {m.label}, {m.sub}
            </b>
            {m.note}
          </div>
        ))}
      </div>
    </>
  );
}
