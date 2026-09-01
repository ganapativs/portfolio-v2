"use client";
import { useState } from "react";
import { useFX } from "@/components/providers/FXProvider";

/**
 * The client half of the specimen tray, and deliberately the whole of it.
 *
 * The tray used to be one client component carrying all twenty-five chart
 * builds, because the eight were shuffled in the browser. The charts are
 * static SVG with no listeners, so that JavaScript bought nothing a build
 * could not do: the server now draws several random sets at build time and
 * renders them all (Specimens.tsx), and this shell only decides which set is
 * visible. The chart library ships zero bytes to the client for this figure.
 *
 * The sets are server children, so this cannot re-render them and does not
 * need to: `data-active` on the group and four rules in home.css do the swap,
 * and display: none → contents restarts each specimen's entry fade for free.
 */
export function SpecimensTray({ count, children }: { count: number; children: React.ReactNode }) {
  const [active, setActive] = useState(0);
  // Whether the reader has drawn at least once. The entry fade is gated on it
  // in home.css, so the tray arrives still on load and only animates a swap
  // the reader caused.
  const [touched, setTouched] = useState(false);
  const fx = useFX();
  return (
    <div
      className="specimens"
      role="group"
      aria-label="Chart specimens"
      data-active={active}
      data-touched={touched || undefined}
    >
      {children}
      <span className="specs-foot">
        <span className="specs-note">8 of the 106 · the real components, not screenshots</span>
        <button
          type="button"
          className="chip"
          data-analytics="cta:demo.microcharts-specimens"
          // Plucks its own note. See the rule in PageFX.
          data-cue="self"
          onClick={() => {
            setTouched(true);
            setActive((a) => (a + 1) % count);
            fx?.pluck(620);
          }}
        >
          draw another eight
        </button>
      </span>
    </div>
  );
}
