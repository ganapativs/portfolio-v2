"use client";
import { useEffect, useRef, useState } from "react";
import { PARTS } from "@/app/(press)/content";

/**
 * The parts list.
 *
 * Every drawing has one: numbered items, a name, a spec and a date, in a ruled
 * table. It is the least decorated block on the page and deliberately so — this
 * is the part where the work is just listed.
 *
 * The hover bar is one element that slides to whichever row the cursor is over,
 * rather than eight rows each painting their own background. That is cheaper,
 * and it also reads as a rule being run down a printed list.
 */
export function PartsList() {
  const listRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  return (
    <div
      className="plist"
      ref={listRef}
      onPointerOver={(e) => {
        const row = (e.target as HTMLElement).closest?.<HTMLElement>(".prow");
        const bar = barRef.current;
        if (!row || !bar) return;
        bar.style.height = `${row.offsetHeight}px`;
        bar.style.transform = `translateY(${row.offsetTop}px)`;
        bar.style.opacity = "1";
      }}
      onPointerLeave={() => {
        if (barRef.current) barRef.current.style.opacity = "0";
      }}
    >
      <span className="pbar" ref={barRef} aria-hidden="true" />
      <div className="phead">
        <span>item</span>
        <span>part</span>
        <span>spec</span>
        <span style={{ textAlign: "right" }}>year</span>
      </div>
      {PARTS.map((p, i) => (
        <div key={p.name} className="prow">
          <span className="no">{String(i + 1).padStart(3, "0")}</span>
          <span className="nm">
            {p.href ? (
              <a href={p.href} target="_blank" rel="noopener" data-analytics={`cta:part.${p.name}`}>
                {p.name}
              </a>
            ) : (
              p.name
            )}
          </span>
          <span className="sp">{p.stars ? <StarCount to={p.stars} label={p.spec} /> : p.spec}</span>
          <span className="yr">{p.year}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * The one number on the page that arrives rather than being there.
 *
 * It counts the last 150 up over half a second, once, the first time it is
 * scrolled to. That is not decoration: the count is live-ish data on a page
 * whose argument is that everything on it is real, and a number that lands
 * rather than sits says "this was fetched". It renders at its true value on
 * the server and under reduced motion, so nothing depends on the animation.
 */
function StarCount({ to, label }: { to: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(to);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const from = to - 150;
        const t0 = performance.now();
        const step = () => {
          const p = Math.min(1, (performance.now() - t0) / 500);
          setN(Math.round(from + (to - from) * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(step);
        };
        step();
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [to]);

  const [head, tail] = label.split("{stars}");
  return (
    <span ref={ref}>
      {head}
      {n.toLocaleString("en-US")}
      {tail}
    </span>
  );
}
