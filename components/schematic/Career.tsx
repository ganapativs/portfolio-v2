"use client";
import { useEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { ERAS, MATERIALS } from "@/app/(press)/content";

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
 * and a bracket dimension under each era carrying its length. Twelve years is a
 * measurement, so it is drawn as one.
 *
 * Roles alternate above and below the axis, which is what stops six labels on
 * fourteen years from colliding.
 */
export function Career() {
  const [on, setOn] = useState(ERAS.length - 1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fx = useFX();

  // The axis is 720px wide and the panel is narrower than that on a phone, so
  // it opens scrolled to the left: a reader on a small screen saw a career that
  // stopped in 2018. Start at the right-hand end instead, which is now, and
  // which is also the era the caption is already showing.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = el.scrollWidth - el.clientWidth;
  }, []);
  const set = (i: number) => {
    if (i === on) return;
    setOn(i);
    fx?.tick();
  };
  const cur = ERAS[on];

  return (
    <>
      <div className="tl-scroll" ref={scrollRef}>
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

      <div className="tl-cap" aria-live="polite">
        <b>{cur.range}</b>
        {cur.body}
      </div>

      <p className="materials">materials in current use · {MATERIALS.join(" · ")}</p>
    </>
  );
}
