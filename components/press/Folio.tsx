"use client";
import { useEffect, useRef, useState } from "react";
import { Mark } from "./Mark";

/**
 * The folio bar. `no. 01 · the masthead` is the page's live state, not
 * decoration: it counts up as you descend, and the rule beneath it fills as you
 * read. Sections announce themselves with a `data-section` attribute, so this
 * never has to know the page's structure.
 */
export function Folio() {
  const [label, setLabel] = useState("no. 01 · the masthead");
  const railRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("[data-section]"));
    const labels = sections.map(
      (s, i) => `no. ${String(i + 2).padStart(2, "0")} · ${s.dataset.section}`,
    );
    let frame = 0;
    // scrollHeight/innerHeight force layout; measure on resize only.
    let max = 0;
    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };

    const update = () => {
      frame = 0;
      // The reading line sits at 45% of the viewport: a section is "current"
      // once its top has passed it.
      const line = window.innerHeight * 0.45;
      let next = "no. 01 · the masthead";
      for (let i = 0; i < sections.length; i++) {
        if (sections[i].getBoundingClientRect().top <= line) next = labels[i];
      }
      setLabel((prev) => (prev === next ? prev : next));
      if (railRef.current) {
        const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        railRef.current.style.setProperty("--p", String(p));
      }
    };

    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Section offsets move as images load and fonts swap in.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    measure();
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div className="folio">
      <div className="wrap folio-in">
        <span className="folio-lead">
          <Mark />
          meetguns press · est. 2013 · Bengaluru
        </span>
        <span className="folio-right">
          <span className="folio-dot" aria-hidden="true" />
          {/* The key restarts the tick animation on every change, so the number
              reads as a counter turning over rather than text being replaced. */}
          <span key={label} className="folio-no">
            {label}
          </span>
        </span>
      </div>
      <span ref={railRef} className="folio-rail" aria-hidden="true" />
    </div>
  );
}
