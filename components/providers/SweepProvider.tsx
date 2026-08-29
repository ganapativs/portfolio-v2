"use client";
import { GlimmProvider } from "glimm/react";

/**
 * cubic-bezier(.22, 1, .36, 1), the one curve the rest of the site eases on,
 * solved for y at a given x by bisection. Twelve iterations is well past the
 * precision a 380ms sweep can show.
 *
 * glimm takes an easing function as well as a name, and its named set does not
 * contain this curve. A second easing vocabulary for one element is how a
 * design system starts to come apart, so the curve is solved here instead.
 */
const bezX = (t: number) =>
  3 * t * (1 - t) * (1 - t) * 0.22 + 3 * t * t * (1 - t) * 0.36 + t * t * t;
const bezY = (t: number) => 3 * t * (1 - t) * (1 - t) + 3 * t * t * (1 - t) + t * t * t;

function houseEase(x: number) {
  let lo = 0;
  let hi = 1;
  let t = x;
  for (let i = 0; i < 12; i++) {
    const e = bezX(t) - x;
    if (Math.abs(e) < 1e-4) break;
    if (e > 0) hi = t;
    else lo = t;
    t = (lo + hi) / 2;
  }
  return bezY(t);
}

/**
 * The sweep that carries a palette change.
 *
 * glimm draws one WebGL band across the viewport and hands you a midpoint to
 * swap state on, so the new ground and the new ink arrive underneath the band
 * rather than being crossfaded over. It replaced a clip-path iris: a circle
 * opening from the control said "this control did it", but the thing that
 * actually happens on a press is a roller passing over the sheet, and a band
 * moving left to right says that instead.
 *
 * The defaults here are the restrained end of what the library offers, and
 * every one of them is a decision:
 *
 *   `sweepMs`/`outroMs` are short. The design's motion law caps everything the
 *   reader caused at 260ms and allows 500ms for a full-page reveal; 520 plus a
 *   280ms fade is the smallest setting where the band still reads as a pass
 *   over the sheet rather than a flash.
 *
 *   `waveAmount: 0` and a tight band. The organic edge displacement is lovely
 *   and belongs on a different site. This one is drawn with a straightedge, so
 *   the band has a straight edge.
 *
 *   `brightness` and `peakAlpha` are pulled down because both grounds here are
 *   low-key. At the library's defaults the band blew out to near-white on
 *   graphite, which is the one colour the palette does not contain.
 *
 *   `reducedMotion: "instant"` is the library's default and is left alone: the
 *   ink still changes, it just arrives.
 *
 * The provider builds nothing until the first sweep, so a reader who never
 * touches the palette pays for none of it.
 */
export function SweepProvider({ children }: { children: React.ReactNode }) {
  return (
    <GlimmProvider
      sweepMs={380}
      outroMs={200}
      // The palette swaps at 0.35 of 380ms, so the ink has moved 133ms after
      // the press. It used to be 234ms of a control that had visibly done
      // nothing, which is a long time on the most-pressed control on the page.
      midpoint={0.35}
      easing={houseEase}
      direction="ltr"
      bandTight={22}
      waveAmount={0}
      rippleAmount={0.2}
      swellAmount={0.25}
      brightness={0.8}
      peakAlpha={0.85}
      // Above the sheet and the ruler, below nothing: the band passes over the
      // whole drawing, including its frame.
      zIndex={60}
    >
      {children}
    </GlimmProvider>
  );
}
