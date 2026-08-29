"use client";
// The ESM build by explicit path, not the bare specifier.
//
// react-spectrum declares `"type": "module"` but points `main` at a CommonJS
// file that does `module.exports = Component` with no `__esModule` marker. The
// bundler resolves that file, wraps `require("react")` in a synthetic namespace,
// and the component's `React.memo` call then throws `n.memo is not a function`
// at runtime. The package publishes a correct ESM build beside it and has no
// `exports` map, so pointing at it directly is legal and is the only fix that
// does not involve patching the package.
import Spectrum from "react-spectrum/dist/react-spectrum.es.js";
import { useEffect, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";

/**
 * Fig. 4 — react-spectrum, running.
 *
 * The actual npm package, not a redraw of it: react-spectrum takes a palette and
 * a few shape rules and lays out a paragraph of coloured word blocks. Its whole
 * job is that no two runs look alike, which is exactly why it earns a place on a
 * drawing where everything else is measured.
 *
 * Two consequences of it picking widths and colours at random:
 *
 *   It cannot be server-rendered. The server's roll and the client's roll differ,
 *   and React calls that a hydration mismatch. So it mounts empty and fills in,
 *   and the box holds its height so nothing under it moves.
 *
 *   Re-rolling it is the demo. `seed` is not passed to the library; it only
 *   forces a remount, which is what makes it draw again.
 */
export function SpectrumDemo() {
  const [seed, setSeed] = useState(0);
  const [mounted, setMounted] = useState(false);
  const fx = useFX();

  useEffect(() => setMounted(true), []);

  return (
    <div className="spectrum">
      <div className="spectrum-stage" aria-hidden="true">
        {mounted && (
          <Spectrum
            key={seed}
            width={420}
            // The drawing's own ink at two densities, plus two rule tones. The
            // library takes any CSS colour, so the placeholder is printed in
            // whichever ink the reader picked.
            colors={[
              "var(--accent)",
              "color-mix(in oklab, var(--accent) 55%, transparent)",
              "var(--ink-3)",
              "var(--rule)",
            ]}
            wordWidths={[24, 40, 62, 86, 108]}
            wordDistances={[5, 9]}
            wordHeight={9}
            wordRadius={2}
            lineDistance={9}
            linesPerParagraph={5}
          />
        )}
      </div>
      <button
        type="button"
        className="chip"
        data-analytics="cta:demo.react-spectrum"
        onClick={() => {
          setSeed((s) => s + 1);
          fx?.pluck(560);
        }}
      >
        draw another
      </button>
    </div>
  );
}
