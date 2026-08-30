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
import { useEffect, useRef, useState } from "react";
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
 *
 * `width` is measured rather than declared, and that is what stops the plate
 * growing. The library packs `linesPerParagraph` rows to the width it is given
 * and emits them as inline blocks; give it a width wider than its container and
 * the browser wraps each row again, by a different amount on every roll. It was
 * a hard-coded 420 against a box that is 365px on a wide screen and 183px on a
 * narrow one, so the stage came out anywhere between 147 and 237px depending on
 * what it drew, and the sgb plate beside it moved along with it. Handed its own
 * width, nothing wraps, the row count is exactly `linesPerParagraph`, and the
 * height is (wordHeight + lineDistance) x rows at every viewport.
 */
export function SpectrumDemo() {
  const [seed, setSeed] = useState(0);
  // The stage's own content width, and the mount gate in one. It is only ever
  // written from a ResizeObserver, so the server and the first client render
  // both draw nothing, which is what keeps the random layout out of hydration.
  const [width, setWidth] = useState(0);
  const stage = useRef<HTMLDivElement>(null);
  const fx = useFX();

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      // contentRect excludes the stage's padding, which is exactly the room the
      // paragraph has. Rounded down, because a fractional width the library
      // fills to the pixel is a width the browser then wraps.
      setWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="spectrum">
      <div className="spectrum-stage" aria-hidden="true" ref={stage}>
        {width > 0 && (
          <Spectrum
            key={`${seed}:${width}`}
            width={width}
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
            // Seven rows at 9 + 9 is 126px, which with the 14/5 padding and the
            // 1px border is the 147px the stage already reserved. It was four,
            // and four only looked like a paragraph because each row was
            // wrapping into two. See the note above.
            linesPerParagraph={7}
            // The library puts a 24px margin under the paragraph by default,
            // which read as an empty band at the foot of the plate.
            paragraphDistance={0}
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
