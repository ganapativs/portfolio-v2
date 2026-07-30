"use client";
import { useCallback, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { YEARS, PROMOTIONS, PROMOTION_WORDS } from "@/app/(press)/content";

/**
 * Eleven years, wound back one at a time.
 *
 * An ARIA slider, so it is a real control: drag it, or focus it and use the
 * arrow keys, Home and End. The fill and the print head both ride a single
 * `--p` (0…1) through transforms — container query units let the head travel a
 * percentage of the track's own width without JS ever measuring it, so a drag
 * never touches layout.
 */
export function PressRun() {
  const last = YEARS.length - 1;
  const [idx, setIdx] = useState(last);
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const fx = useFX();

  const commit = useCallback(
    (next: number) => {
      const n = Math.max(0, Math.min(last, next));
      setIdx((prev) => {
        if (prev === n) return prev;
        fx?.tick();
        fx?.haptic(4);
        return n;
      });
    },
    [last, fx],
  );

  const fromClientX = useCallback(
    (clientX: number) => {
      const r = trackRef.current?.getBoundingClientRect();
      if (!r) return;
      const p = (clientX - r.left) / Math.max(1, r.width);
      commit(Math.round(p * last));
    },
    [commit, last],
  );

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    let next: number | null = null;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") next = idx + 1;
    else if (e.key === "ArrowLeft" || e.key === "ArrowDown") next = idx - 1;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    else if (e.key === "PageUp") next = idx + 3;
    else if (e.key === "PageDown") next = idx - 3;
    if (next === null) return;
    e.preventDefault();
    commit(next);
  };

  const [year, line] = YEARS[idx];
  const promos = PROMOTIONS[idx];
  const p = (idx + 1) / YEARS.length;

  return (
    <div className="press-block">
      <div className="press-top">
        <div className="press-count-row">
          <span className="press-count">{idx}</span>
          <span className="press-count-meta">
            Years
            <br />
            one company
            <br />
            {PROMOTION_WORDS[promos]} promotion{promos === 1 ? "" : "s"}
          </span>
        </div>
        <div className="press-hint">
          Press run
          <br />
          drag · or arrow keys
        </div>
      </div>

      <div
        ref={trackRef}
        className="track"
        data-dragging={dragging || undefined}
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- a range input cannot carry the tick row, the ink fill or the print head
        role="slider"
        tabIndex={0}
        aria-label="Year on the press"
        aria-valuemin={Number(YEARS[0][0])}
        aria-valuemax={Number(YEARS[last][0])}
        aria-valuenow={Number(year)}
        aria-valuetext={`${year}. ${line}`}
        style={{ ["--p" as string]: p }}
        onKeyDown={onKeyDown}
        onPointerDown={(e) => {
          setDragging(true);
          e.currentTarget.setPointerCapture?.(e.pointerId);
          fromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging) fromClientX(e.clientX);
        }}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
      >
        <span className="track-ink" aria-hidden="true" />
        <span className="track-ticks" aria-hidden="true">
          {YEARS.map(([y], i) => (
            <span key={y} className="tick" data-on={i <= idx}>
              {y.slice(2)}
            </span>
          ))}
        </span>
        <span className="track-head" aria-hidden="true" />
      </div>

      <div className="press-read">
        <span className="press-year">{year}</span>
        {/* Keyed so the line re-enters on each change — the one place the page
            animates text, and it is animating because the reader moved it. */}
        <span key={year} className="press-line">
          {line}
        </span>
      </div>
    </div>
  );
}
