"use client";
import { GlimmProvider } from "glimm/react";

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
      sweepMs={520}
      outroMs={280}
      midpoint={0.45}
      easing="easeOutQuart"
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
