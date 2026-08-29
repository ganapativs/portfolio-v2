"use client";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { approach, useReducedMotion } from "./useReducedMotion";

type Sec = { id: string; label: string; top: number };

/**
 * The measuring edge.
 *
 * A scale rule down the left edge of the sheet, with a traveller that rides the
 * scroll a beat behind it. The lag is the point: a traveller that tracked the
 * scroll exactly would read as a progress bar, and this is a thing being
 * carried along a rule.
 *
 * The section labels are not configured here. Every page marks its own sections
 * with `data-sec="label"` and the ruler reads them off the DOM, so a page that
 * grows a section grows a tick without touching this file.
 *
 * Below 900px there is no room for a rule beside the sheet, so it collapses to
 * a 2px progress line across the top.
 */
export function Ruler() {
  const pathname = usePathname();
  const fx = useFX();
  const [secs, setSecs] = useState<Sec[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const reduced = useReducedMotion();
  const rulerRef = useRef<HTMLElement>(null);
  const travRef = useRef<HTMLSpanElement>(null);
  const progRef = useRef<HTMLSpanElement>(null);

  const layout = useCallback(() => {
    const H = document.documentElement.scrollHeight;
    const found = Array.from(document.querySelectorAll<HTMLElement>("[data-sec]")).map((el) => ({
      id: el.id,
      label: el.dataset.sec ?? "",
      // Capped at 97% so the last label never collides with the bottom tick.
      top: Math.min(97, ((el.getBoundingClientRect().top + window.scrollY) / H) * 100),
    }));
    setSecs(found.filter((s) => s.id));
  }, []);

  useEffect(() => {
    layout();
    let rz = 0;
    const onResize = () => {
      clearTimeout(rz);
      rz = window.setTimeout(layout, 150);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(layout).catch(() => {});
    return () => {
      clearTimeout(rz);
      window.removeEventListener("resize", onResize);
    };
  }, [layout, pathname]);

  // The traveller. One rAF chain that stops itself as soon as it has caught up,
  // so a page sitting still costs nothing.
  useEffect(() => {
    const ruler = rulerRef.current;
    if (!ruler) return;
    let y = 0;
    let raf = 0;
    let last = 0;

    const target = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      return { p, y: p * (ruler.clientHeight - 2) };
    };
    const paint = (p: number, ty: number) => {
      if (travRef.current) travRef.current.style.transform = `translate3d(0,${ty}px,0)`;
      if (progRef.current) progRef.current.style.transform = `scaleX(${p})`;
    };
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      // Clamped, because a tab that was backgrounded hands back a delta of
      // several seconds and the traveller would teleport.
      const dt = Math.min(now - (last || now - 16.667), 50);
      last = now;
      const t = target();
      // The lag is the point: a traveller that tracked the scroll exactly would
      // read as a progress bar. Time-scaled so that lag is 130ms on a 60Hz
      // panel and 130ms on a 120Hz one.
      if (reduced.current) y = t.y;
      else y += (t.y - y) * approach(0.12, dt);
      paint(t.p, y);
      if (Math.abs(t.y - y) < 0.4) {
        y = t.y;
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
    };
    const wake = () => {
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
    };
    const direct = () => {
      const t = target();
      paint(t.p, t.y);
    };
    const onScroll = wake;
    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
        raf = 0;
      } else wake();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("visibilitychange", onVis);
    direct();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [pathname, reduced]);

  // Which label is lit. A section counts as current once its top has passed the
  // upper third of the viewport, which is where a reader's eye actually is.
  useEffect(() => {
    if (secs.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-33% 0px -60% 0px" },
    );
    for (const s of secs) {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    }
    return () => io.disconnect();
  }, [secs]);

  const go = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    fx?.tick();
    el.scrollIntoView({ behavior: reduced.current ? "auto" : "smooth", block: "start" });
  };

  return (
    <>
      <nav className="ruler" aria-label="Sections" ref={rulerRef}>
        <span className="ruler-ticks" aria-hidden="true" />
        {secs.map((s) => (
          <button
            key={s.id}
            type="button"
            className="ruler-sec"
            style={{ top: `${s.top}%` }}
            data-on={active === s.id}
            data-analytics={`nav:ruler.${s.id}`}
            onClick={() => go(s.id)}
          >
            {s.label}
          </button>
        ))}
        <span className="trav" ref={travRef} aria-hidden="true" />
      </nav>
      <span className="progress" ref={progRef} aria-hidden="true" />
    </>
  );
}
