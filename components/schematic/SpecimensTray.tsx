"use client";
import { useState } from "react";
import { useFX } from "@/components/providers/FXProvider";

/**
 * The client half of the specimen tray, and deliberately the whole of it.
 *
 * The tray used to be one client component carrying all twenty-five chart
 * builds, because the eight were shuffled in the browser. The charts are
 * static SVG with no listeners, so that JavaScript bought nothing a build
 * could not do: the server draws several random sets at build time and
 * renders them all (Specimens.tsx), and this shell only decides which set is
 * visible. The chart library ships zero bytes to the client for this figure.
 *
 * Which set a load opens on is random again, without a flicker, and the
 * mechanism is the site's own no-flash pattern: the inline script below is
 * the tray's FIRST child, so it runs during parse — before any specimen has
 * painted — and stamps a random index into `data-active`. A crawler or a
 * reader without JavaScript keeps the server's set 0, fully rendered in the
 * HTML like everything else on the sheet; a reader with it gets one of the
 * pre-drawn sets at random with no swap to see. React then hydrates against
 * the DOM the script already wrote: the state initializer reads the stamped
 * index back, so the client's first render and the document agree.
 *
 * The sets are server children, so this cannot re-render them and does not
 * need to: `data-active` on the group and four rules in home.css do the swap,
 * and display: none → contents restarts each specimen's entry fade for free.
 */
export function SpecimensTray({ count, children }: { count: number; children: React.ReactNode }) {
  const [active, setActive] = useState(() => {
    if (typeof window === "undefined") return 0;
    const n = (window as { __mgSpec?: number }).__mgSpec;
    return typeof n === "number" && Number.isInteger(n) && n >= 0 && n < count ? n : 0;
  });
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
      // The pre-paint script rewrites data-active before hydration; the state
      // initializer reads it back, so the two agree in every healthy load.
      // Suppressed anyway for the unhealthy ones (an extension stripping
      // globals, a blocked script) — the fallback on both sides is set 0.
      suppressHydrationWarning
    >
      <script
        // Stamps the random set before the specimens parse. Kept to one
        // statement per concern and wrapped in try/catch the way the
        // no-flash script is: a failure must leave set 0 showing, not a
        // blank tray.
        dangerouslySetInnerHTML={{
          __html: `try{var n=Math.floor(Math.random()*${count});document.currentScript.parentElement.dataset.active=n;window.__mgSpec=n}catch(e){}`,
        }}
      />
      {children}
      <span className="specs-foot">
        <span className="specs-note">8 of the 106, rendered live</span>
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
