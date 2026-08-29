"use client";
import { useRef } from "react";
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
          {/* The star count used to tick up from 150 below on first view. It
              was a scroll-triggered animation with no way to interrupt it, and
              it made a real number look uncertain for half a second on the one
              page whose whole argument is that its numbers are checkable. */}
          <span className="sp">
            {p.spec.replace("{stars}", (p.stars ?? 0).toLocaleString("en-US"))}
          </span>
          <span className="yr">{p.year}</span>
        </div>
      ))}
    </div>
  );
}
