"use client";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { ParticlePortrait } from "@/components/ParticlePortrait";

/**
 * The halftone portrait, carried over from the previous design and re-inked for
 * the press.
 *
 * ParticlePortrait draws to a fixed-pixel canvas, so the size has to come from
 * a measurement rather than a CSS clamp. The observer feeds it the coin's real
 * width; the component re-samples the image whenever that changes.
 *
 * The photograph underneath is not decoration. A canvas is a black box to a
 * crawler and to a reader with no JavaScript: no `alt`, nothing to index, an
 * empty disc. So the real image is what renders on the server, and the canvas
 * takes over only once it has actually measured and mounted — which is exactly
 * the condition under which the halftone can be drawn at all.
 */
export function PortraitCoin() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [w, setW] = useState(0);

  useLayoutEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Measure once, synchronously. Routing the first measurement through
    // requestAnimationFrame means the canvas never mounts at all on a page that
    // isn't getting frames yet — a background tab, or one still occluded.
    setW(Math.round(host.getBoundingClientRect().width));

    let frame = 0;
    const ro = new ResizeObserver(([entry]) => {
      const next = Math.round(entry.contentRect.width);
      if (!next) return;
      // Resampling 52×60 cells is not free, so coalesce a drag-resize into one
      // pass per frame. Only later changes go through here.
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setW(next));
    });
    ro.observe(host);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={hostRef} className="coin" data-drawn={w > 0 ? "true" : undefined}>
      <Image
        className="coin-photo"
        src="/portrait/ganapativs.webp"
        alt="Ganapati V S"
        fill
        sizes="(max-width: 700px) 190px, (max-width: 1100px) 28vw, 300px"
        quality={80}
        priority={false}
      />
      {/* "print" — dark ink on light paper, in both themes. See .coin in
          styles/press/home.css for why the coin doesn't flip. */}
      {w > 0 && <ParticlePortrait width={w} shape="circle" mode="print" />}
    </div>
  );
}
