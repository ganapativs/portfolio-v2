"use client";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import "@microcharts/react/styles.css";
import { Sparkline } from "@microcharts/react/sparkline/interactive";
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

type Rect = { x: number; y: number; l: number; r: number; t: number; b: number };

// The shipped-work curve fig. 6 draws, at word size. Real numbers in a real
// sentence beats a nice-looking squiggle.
const SPARK = CHART.map((c) => 52 - c.y);

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
  const [cur, setCur] = useState(5);

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
  const place = useCallback((i: number) => {
    const stage = stageRef.current;
    const loupe = loupeRef.current;
    const detail = detailRef.current;
    const r = rects.current[i];
    if (!stage || !loupe || !detail || !r) return;
    loupe.style.transform = `translate(${r.x - 29}px,${r.y - 29}px)`;
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

  useEffect(() => {
    measure();
    place(cur);
    let rz = 0;
    const onResize = () => {
      clearTimeout(rz);
      rz = window.setTimeout(() => {
        measure();
        place(cur);
      }, 150);
    };
    window.addEventListener("resize", onResize);
    // Font swap changes every word box, so re-measure once the faces land.
    document.fonts?.ready
      .then(() => {
        measure();
        place(cur);
      })
      .catch(() => {});
    return () => {
      clearTimeout(rz);
      window.removeEventListener("resize", onResize);
    };
  }, [measure, place, cur]);

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
                <Sparkline data={SPARK} width={58} height={14} summary="a sparkline, set inline" />
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
          e.currentTarget.dataset.dragging = "true";
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
          e.currentTarget.dataset.dragging = "false";
          if (moved.current) return;
          const i = wordAt(e.clientX, e.clientY);
          if (i >= 0 && i !== cur) goTo(i);
          else goTo((cur + 1) % WORDS.length);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(cur + 1);
          else if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(cur - 1);
          else if (e.key === "Home") goTo(0);
          else if (e.key === "End") goTo(WORDS.length - 1);
          else return;
          e.preventDefault();
        }}
      />

      <div className="lp-detail" ref={detailRef}>
        {WORDS[cur] === null ? (
          <svg className="lp-mag" width="280" height="112" viewBox="0 0 280 112">
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
            <polyline points="20,66 50,46 80,56 110,31 140,41 170,21 200,36 230,11 260,26" />
            <line
              className="dline"
              x1="20"
              y1="84"
              x2="260"
              y2="84"
              markerStart="url(#lp-arrow)"
              markerEnd="url(#lp-arrow)"
            />
            <line className="dline" x1="20" y1="76" x2="20" y2="92" />
            <line className="dline" x1="260" y1="76" x2="260" y2="92" />
            <text x="140" y="100" textAnchor="middle">
              1-7 kB gzip each
            </text>
            <text x="264" y="16">
              106 types
            </text>
          </svg>
        ) : (
          <>
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
          </>
        )}
      </div>

      <p className="lp-hint">drag the loupe, or focus it and use arrow keys</p>
    </div>
  );
}
