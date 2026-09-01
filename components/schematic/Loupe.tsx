"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import "@microcharts/react/styles.css";
import { Sparkline } from "@microcharts/react/sparkline";
import { CHART } from "@/app/(press)/content";
import { useFX } from "@/components/providers/FXProvider";

/**
 * Fig. 2 — the detail callout.
 *
 * A draggable loupe over one sentence. Whatever is under the glass is enlarged
 * in the box below, tied to it by two tangent lines, exactly the way a drawing
 * ties an enlarged detail to the place it was taken from. Over a word you get
 * the word at 44px with its x-height and baseline ruled; over the inline chart
 * you get the chart at eight times the size, dimensioned.
 *
 * The hit testing is the browser's, not arithmetic: `elementsFromPoint` looks
 * straight through the loupe ring and reports the word underneath. Measuring
 * word boxes and finding the nearest centre gets it wrong on every line break,
 * and the nearest-centre fallback here is used only when the pointer is
 * genuinely above or below the sentence.
 */

// One token per span. `null` marks the inline chart, which is a word in every
// sense that matters here — it is set at word size and read in the line.
const WORDS: (string | null)[] = [
  "106",
  "word-sized",
  "React",
  "chart",
  "types,",
  "like",
  null,
  "set",
  "inline",
  "with",
  "prose,",
  "zero",
  "runtime",
  "dependencies,",
  "accessible",
  "by",
  "default.",
];

/* The lens starts on the chart, not on a word.

   It was `useState(5)`, which is "like": the plate's claim is that the thing in
   the sentence is the real component, so the detail box should be showing the
   component when the reader arrives, not an adverb next to it. Derived from the
   array rather than typed, so it survives the next copy edit. */
const CHART_WORD = WORDS.indexOf(null);

/* The enlarged chart's box, and where its line actually starts and ends.

   The dimension under it has to measure the thing it is under, and it did not:
   it ran 20 to 260 of a 280 box while the curve ran 2 to 278, so the arrows
   pointed at eighteen pixels of nothing at each end. The inset is the
   component's own, measured off the rendered path rather than guessed. The
   dimension SVG shares this width and viewBox scale, so the two coordinate
   systems are the same one. If the chart's size or its dots change, re-measure
   with `path.getBBox()`. */
const MAG_W = 280;
const MAG_X0 = 2;
const MAG_X1 = MAG_W - MAG_X0;

type Rect = { x: number; y: number; l: number; r: number; t: number; b: number };

/* The shipped-work curve fig. 6 draws, at word size.
 *
 * Read what this is before adding anything that states a value from it. CHART
 * is a hand-plotted path in fig. 6's own 272x64 SVG space, so `c.y` is a pixel
 * position and `52 - c.y` is a height above the baseline, running 2 to 44. The
 * shape is real, it is fourteen years of shipped work in order with a story on
 * every point, but the numbers are coordinates and they are not a quantity of
 * anything.
 *
 * Both charts below therefore run with `readout={false}`, which keeps the
 * crosshair and drops the chip that was printing "44" at a reader. Fig. 3
 * carries no numbers at all for the same reason: a plausible-looking figure
 * that means nothing is the one dishonest thing this page could do. If this is
 * ever given a real series, the readouts can come back with it. */
const SPARK = CHART.map((c) => 52 - c.y);
/* Read what that is before making either chart below state a value from it.
 *
 * CHART is a hand-plotted path in fig. 6's own 272x64 SVG space, so `c.y` is a
 * pixel position and `52 - c.y` is a height above a baseline, running 2 to 44.
 * The shape is real, fourteen years of shipped work in order, but the numbers
 * are coordinates and are not a quantity of anything.
 *
 * Which is why both charts here are the STATIC entry point. The interactive one
 * ships a picker, and the picker printed "44" in a hover chip and announced
 * "Point 1 of 14: 2" to a screen reader. It was buying nothing either way: the
 * loupe is this figure's interaction, and a second focusable control inside the
 * sentence competes with it. Fig. 3 carries no numbers at all for the same
 * reason. If this is ever given a real series, the picker can come with it. */

export function Loupe() {
  const stageRef = useRef<HTMLDivElement>(null);
  const sentenceRef = useRef<HTMLParagraphElement>(null);
  const loupeRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const l1 = useRef<HTMLSpanElement>(null);
  const l2 = useRef<HTMLSpanElement>(null);
  const wordEls = useRef<HTMLElement[]>([]);
  const rects = useRef<Rect[]>([]);
  const dragging = useRef(false);
  const moved = useRef(false);
  const fx = useFX();
  const [cur, setCur] = useState(CHART_WORD);

  const measure = useCallback(() => {
    const stage = stageRef.current;
    const sentence = sentenceRef.current;
    if (!stage || !sentence) return;
    wordEls.current = Array.from(sentence.querySelectorAll<HTMLElement>(".w"));
    const base = stage.getBoundingClientRect();
    rects.current = wordEls.current.map((w) => {
      const r = w.getBoundingClientRect();
      return {
        x: r.left - base.left + r.width / 2,
        y: r.top - base.top + r.height / 2,
        l: r.left - base.left,
        r: r.right - base.left,
        t: r.top - base.top,
        b: r.bottom - base.top,
      };
    });
  }, []);

  // Place the lens and redraw the two tangents. Kept out of React state on
  // purpose: this runs on every pointermove of a drag, and a transform written
  // straight to the node is one style recalculation instead of a render.
  const place = useCallback((i: number, instant = false) => {
    const stage = stageRef.current;
    const loupe = loupeRef.current;
    const detail = detailRef.current;
    const r = rects.current[i];
    if (!stage || !loupe || !detail || !r) return;
    // A layout resync is not a journey. The first placement lands before the
    // fonts do, and when Hanken swapped in, every word box moved and the lens
    // eased 260ms onto the chart — a slide across the sentence on page load
    // that nobody caused. Resyncs (mount, fonts.ready, resize) snap; only a
    // reader's goTo travels. A timer, not rAF, restores the transition — a
    // hidden tab freezes rAF and would leave the ease off the first real move.
    const els = [loupe, l1.current, l2.current];
    if (instant) {
      for (const el of els) if (el) el.style.transition = "none";
      window.setTimeout(() => {
        for (const el of els) if (el) el.style.transition = "";
      }, 50);
    }
    loupe.style.transform = `translate(${r.x - 29}px,${r.y - 29}px)`;
    // Until this has run once, the lens has no transform and CSS has it at the
    // stage's top left corner. The placing effect runs after the first paint,
    // so it was painted there for a frame and then jumped onto the sentence.
    // It is hidden until it is somewhere.
    loupe.dataset.placed = "true";
    const d = detail.getBoundingClientRect();
    const base = stage.getBoundingClientRect();
    const dt = d.top - base.top;
    const dl = d.left - base.left;
    const dr = dl + d.width;
    const line = (el: HTMLSpanElement | null, x1: number, y1: number, x2: number, y2: number) => {
      if (!el) return;
      const dx = x2 - x1;
      const dy = y2 - y1;
      el.style.width = `${Math.hypot(dx, dy)}px`;
      el.style.transform = `translate(${x1}px,${y1}px) rotate(${Math.atan2(dy, dx)}rad)`;
    };
    // Both tangents leave the lens itself, on its ring. The lens is 58px, so
    // its radius is 29, and at 16 either side of centre the ring is at
    // sqrt(29^2 - 16^2) = 24.2 below it. Starting them at the foot of the
    // sentence block instead kept them off the prose, but it also left the
    // callout drawn from nothing: two lines rising to a circle they never
    // touch. A leader that does not touch what it leads from is not a leader.
    const sy = r.y + 24;
    line(l1.current, r.x - 16, sy, dl, dt);
    line(l2.current, r.x + 16, sy, dr, dt);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const n = wordEls.current.length || WORDS.length;
      const next = Math.max(0, Math.min(n - 1, i));
      setCur((prev) => {
        if (prev !== next) fx?.tick();
        return next;
      });
      place(next);
    },
    [fx, place],
  );

  // The current stop, readable by the resync effect below without putting
  // `cur` in its deps — with `cur` there, every goTo re-ran the effect and an
  // instant re-place snapped the ease the goTo had just started.
  const curRef = useRef(cur);
  curRef.current = cur;
  useEffect(() => {
    // All three of these are layout resyncs, so they place instantly.
    measure();
    place(curRef.current, true);
    let rz = 0;
    const onResize = () => {
      clearTimeout(rz);
      rz = window.setTimeout(() => {
        measure();
        place(curRef.current, true);
      }, 150);
    };
    window.addEventListener("resize", onResize);
    // Font swap changes every word box, so re-measure once the faces land.
    document.fonts?.ready
      .then(() => {
        measure();
        place(curRef.current, true);
      })
      .catch(() => {});
    return () => {
      clearTimeout(rz);
      window.removeEventListener("resize", onResize);
    };
  }, [measure, place]);

  const wordAt = (clientX: number, clientY: number) => {
    for (const el of document.elementsFromPoint(clientX, clientY)) {
      const w = el.closest?.(".w");
      if (w) return wordEls.current.indexOf(w as HTMLElement);
    }
    return -1;
  };
  const nearest = (cx: number, cy: number) => {
    let best = 0;
    let bd = 1e9;
    rects.current.forEach((r, i) => {
      // Vertical distance weighted 3× so a pointer below the last line snaps to
      // that line rather than to whatever is horizontally closest two lines up.
      const d = (r.x - cx) ** 2 + (r.y - cy) ** 2 * 3;
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    return best;
  };
  const setDragFlag = (on: boolean) => {
    if (stageRef.current) stageRef.current.dataset.dragging = String(on);
  };
  const localOf = (e: React.PointerEvent) => {
    const base = stageRef.current?.getBoundingClientRect();
    return { x: e.clientX - (base?.left ?? 0), y: e.clientY - (base?.top ?? 0) };
  };

  return (
    <div className="lp-stage" ref={stageRef}>
      <div className="lp-lines" aria-hidden="true">
        <span className="lp-line" ref={l1} />
        <span className="lp-line" ref={l2} />
      </div>

      <p
        className="lp-sentence"
        ref={sentenceRef}
        onPointerDown={(e) => {
          measure();
          const t = (e.target as HTMLElement).closest?.(".w");
          if (t) goTo(wordEls.current.indexOf(t as HTMLElement));
          else {
            const p = localOf(e);
            goTo(nearest(p.x, p.y));
          }
        }}
      >
        {/* The space between tokens is a real text node, not a gap: the words
            have to wrap and justify like prose, because the whole conceit is
            that this is a sentence you can put a lens on. */}
        {WORDS.map((w, i) => (
          <Fragment key={w === null ? "spark" : `${w}-${i}`}>
            {w === null ? (
              // The real component, in the real sentence, at the real size.
              // This is the claim the panel is making, so it is made rather
              // than illustrated.
              <span className="w spark" data-lit={cur === i}>
                <Sparkline
                  data={SPARK}
                  width={58}
                  height={14}
                  // Same reason as the enlarged one below. A CSS rule tried to
                  // ink this for a while and never matched: it selected
                  // `polyline`, and the component draws a `path`.
                  color="var(--accent)"
                  summary="a sparkline, set inline"
                />
              </span>
            ) : (
              <span className="w" data-lit={cur === i}>
                {w}
              </span>
            )}
            {i < WORDS.length - 1 ? " " : null}
          </Fragment>
        ))}
      </p>

      <div
        className="loupe"
        ref={loupeRef}
        role="slider"
        tabIndex={0}
        aria-label="Detail loupe. Arrow keys move it along the sentence."
        aria-valuemin={0}
        aria-valuemax={WORDS.length - 1}
        aria-valuenow={cur}
        aria-valuetext={WORDS[cur] ?? "inline sparkline"}
        onPointerDown={(e) => {
          measure();
          dragging.current = true;
          moved.current = false;
          // On the stage rather than on the lens: the two leader lines are in a
          // sibling element, and they were still easing over 260ms while the
          // lens itself followed the hand exactly, so they trailed behind it
          // for the whole drag.
          setDragFlag(true);
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
          e.preventDefault();
        }}
        onPointerMove={(e) => {
          if (!dragging.current) return;
          moved.current = true;
          const i = wordAt(e.clientX, e.clientY);
          if (i >= 0) goTo(i);
          else {
            const p = localOf(e);
            goTo(nearest(p.x, p.y));
          }
        }}
        onPointerUp={(e) => {
          // Only a press that STARTED on the loupe may step it. Clicking a word
          // moves the lens under the cursor at pointerdown, so that press's
          // pointerup lands here — and without this guard it advanced to the
          // next word every single time.
          if (!dragging.current) return;
          dragging.current = false;
          setDragFlag(false);
          if (moved.current) return;
          const i = wordAt(e.clientX, e.clientY);
          if (i >= 0 && i !== cur) goTo(i);
          else goTo((cur + 1) % WORDS.length);
        }}
        // Without this the lens stays latched: the browser can take a captured
        // pointer away -- a system gesture, a context menu, a touch turning into
        // a scroll -- and then pointerup never comes.
        onPointerCancel={() => {
          dragging.current = false;
          setDragFlag(false);
        }}
        onKeyDown={(e) => {
          // A held arrow is a drag by another name: key-repeat arrives faster
          // than the detail box's swap fade, so without the drag flag the box
          // sat blank for the whole hold. A single press keeps its fade — the
          // flag goes up only on repeat and comes down on release.
          if (e.repeat) setDragFlag(true);
          if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(cur + 1);
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(cur - 1);
          else if (e.key === "Home") goTo(0);
          else if (e.key === "End") goTo(WORDS.length - 1);
          else return;
          e.preventDefault();
        }}
        onKeyUp={() => setDragFlag(false)}
      />

      <div className="lp-detail" ref={detailRef}>
        {WORDS[cur] === null ? (
          /* The enlarged detail is the same component as the word in the
             sentence, at eight times the size and on the smooth curve.
             
             It used to be a hand-drawn <polyline> with nine literal points, a
             picture of the chart sitting under a lens whose whole claim is that
             the thing in the sentence is real. Enlarging a detail on a drawing
             does not redraw it, it shows the same part closer. Same `SPARK`
             series as the inline one, so the two cannot drift. */
          <div className="lp-mag">
            <span className="lp-mag-key">106 types</span>
            <Sparkline
              data={SPARK}
              width={MAG_W}
              height={64}
              curve="smooth"
              dots="minmax"
              // The series colour by the library's own prop, the same way
              // SpectrumDemo passes its palette. Without it the enlarged curve
              // comes out of the --mc-* bridge in --ink-2, while the word it is
              // an enlargement of is in the ink.
              color="var(--accent)"
              summary="the shipped-work curve, enlarged"
            />
            <svg
              className="lp-dims"
              width={MAG_W}
              height="34"
              viewBox={`0 0 ${MAG_W} 34`}
              aria-hidden="true"
            >
              <defs>
                <marker
                  id="lp-arrow"
                  viewBox="0 0 8 8"
                  refX="7"
                  refY="4"
                  markerWidth="7"
                  markerHeight="7"
                  orient="auto-start-reverse"
                >
                  <path d="M0 .8 8 4 0 7.2z" fill="context-stroke" />
                </marker>
              </defs>
              <line
                className="dline"
                x1={MAG_X0}
                y1="10"
                x2={MAG_X1}
                y2="10"
                markerStart="url(#lp-arrow)"
                markerEnd="url(#lp-arrow)"
              />
              <line className="dline" x1={MAG_X0} y1="2" x2={MAG_X0} y2="18" />
              <line className="dline" x1={MAG_X1} y1="2" x2={MAG_X1} y2="18" />
              <text x={MAG_W / 2} y="30" textAnchor="middle">
                1-7 kB gzip each
              </text>
            </svg>
          </div>
        ) : (
          /* Keyed on the word, or React reuses these two nodes and the
             `lp-swap` animation on `.lp-detail > *` never restarts. It fired
             only when the branch above flipped, so for 16 of the 17 stops the
             box swapped at t=0 while the lens was still travelling -- which is
             precisely the behaviour the comment on that keyframe says it
             fixed. */
          <Fragment key={cur}>
            <div className="lp-word">
              {WORDS[cur]}
              <span className="lp-hair" style={{ bottom: "0.148em" }} />
              <span className="lp-hair" style={{ bottom: "0.641em" }} />
            </div>
            <span className="lp-key">
              x-height
              <br />
              baseline
            </span>
          </Fragment>
        )}
      </div>

      <p className="lp-hint">drag the loupe, or focus it and use arrow keys</p>
    </div>
  );
}
