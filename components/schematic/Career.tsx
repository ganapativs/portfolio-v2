"use client";
import { useEffect, useRef, useState } from "react";
import { ERAS, MATERIALS } from "@/app/(press)/content";
import { Caption } from "./Caption";

const Y0 = 2013;
const YSPAN = 14;
// 1.5% of inset so the first tick is not on the panel's own edge, 97% of run so
// the last one is not either.
const pct = (y: number) => 1.5 + ((y - Y0) / YSPAN) * 97;

/**
 * Fig. 5 — the career, dimensioned.
 *
 * A timeline drawn the way a part is dimensioned rather than the way a résumé
 * is listed: an axis with year ticks, station points where the role changed,
 * and a bracket dimension under each era carrying its length. Thirteen years is a
 * measurement, so it is drawn as one.
 *
 * Roles alternate above and below the axis, which is what stops six labels on
 * fourteen years from colliding.
 */
export function Career() {
  const [on, setOn] = useState(ERAS.length - 1);
  const scrollRef = useRef<HTMLDivElement>(null);

  // The axis is 720px wide and the panel is narrower than that on a phone, so
  // it opens scrolled to the left: a reader on a small screen saw a career that
  // stopped in 2018. Start at the right-hand end instead, which is now, and
  // which is also the era the caption is already showing.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, []);
  // No tick here: the roles are real buttons, so PageFX's delegated hover cue
  // already covers them — with the moved + scroll-settle gating this handler
  // lacked, which had the timeline ticking once per role on a scroll past a
  // resting cursor.
  const set = (i: number) => {
    if (i === on) return;
    setOn(i);
  };
  const cur = ERAS[on];

  return (
    <>
      {/* Focusable (WCAG 2.1.1): on a phone this is a real horizontal
          scrollport and Chrome does not make overflow containers focusable on
          its own, so half the career was unreachable by keyboard. On desktop
          nothing overflows and the tab stop is a harmless extra. */}
      <div
        className="tl-scroll"
        ref={scrollRef}
        // A scrollable region must be keyboard-focusable (axe
        // scrollable-region-focusable; WCAG 2.1.1) — the sanctioned exception
        // to the no-noninteractive-tabindex rule.
        // oxlint-disable-next-line no-noninteractive-tabindex
        tabIndex={0}
        role="group"
        aria-label="Career timeline, 2013 to now, scrollable"
      >
        <div className="tl">
          <div className="tl-axis" />
          {Array.from({ length: 14 }, (_, i) => Y0 + i).map((y) => (
            <span key={y}>
              <span className="tl-tick" style={{ left: `${pct(y)}%` }} />
              <span className="tl-year" style={{ left: `${pct(y)}%` }}>
                &apos;{String(y).slice(2)}
              </span>
            </span>
          ))}
          {ERAS.map((e, i) => {
            const mid = pct((e.from + e.to) / 2);
            const now = i === ERAS.length - 1;
            return (
              <span key={e.short}>
                <button
                  type="button"
                  className={`tl-role ${i % 2 === 0 ? "above" : "below"}${now ? " now" : ""}`}
                  style={{ left: `${mid}%` }}
                  data-on={on === i}
                  aria-describedby="tl-cap-career"
                  onPointerEnter={() => set(i)}
                  onFocus={() => set(i)}
                >
                  {e.short}
                </button>
                <span className={`tl-node${now ? " now" : ""}`} style={{ left: `${mid}%` }} />
                <span
                  className="tl-brk"
                  data-on={on === i}
                  style={{
                    left: `calc(${pct(e.from)}% + 2px)`,
                    width: `calc(${pct(e.to) - pct(e.from)}% - 4px)`,
                  }}
                />
                <span className="tl-dur" data-on={on === i} style={{ left: `${mid}%` }}>
                  {e.length}
                </span>
              </span>
            );
          })}
        </div>
      </div>

      <Caption className="tl-cap" id="tl-cap-career" itemKey={cur.range} label={cur.range}>
        {cur.body}
      </Caption>

      <p className="materials">materials in current use · {MATERIALS.join(" · ")}</p>
    </>
  );
}
