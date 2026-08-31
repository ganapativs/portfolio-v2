"use client";
import { GlimmProvider } from "glimm/react";
import { setSweepController } from "@/lib/sweep";

/**
 * The sweep that carries a palette change.
 *
 * glimm draws one WebGL band across the viewport and hands you a midpoint to
 * swap state on, so the new ground and the new ink arrive underneath the band
 * rather than being crossfaded over. It replaced a clip-path iris: a circle
 * opening from a control said "this control did it", but the thing that
 * actually happens on a press is a roller passing over the sheet.
 *
 * This is the library's FLAT band, at close to the library's own defaults —
 * the same look glimm.dev wears. It used to be `createMeshShader` with a lit
 * crest, refraction, dispersion and bloom, and on this sheet all of that read
 * as a bright travelling blob: the mesh's specular ridge blew toward white
 * over both grounds, and white is the one colour the palette does not
 * contain. A drawing is re-inked with a roller, not a searchlight. The flat
 * band in the tray's own inks is quieter than the mesh and more legible than
 * the reference site's rainbows, because the colours mean something here.
 *
 * Every remaining setting is a decision:
 *
 *   `easing: "easeInOutCubic"` and not the house out-curve. The sweep is the
 *   one motion on the site that is a pass over the whole sheet rather than a
 *   control answering a hand, and a front-loaded curve made it dart from the
 *   edge and coast — which read as hurried next to the 340ms token tween
 *   underneath it. The symmetric curve gathers, crosses, and settles. It is
 *   the same reasoning that gives the pipeline's auto pass its own in-out
 *   curve in JS.
 *
 *   `sweepMs 800` / `outroMs 350` are the library's own defaults and the one
 *   place the motion law is deliberately exceeded — this is the whole sheet
 *   being re-inked, not a control responding. It ran at 950 for a while and
 *   was called slow; below ~700 it has been missed entirely, twice.
 *
 *   `midpoint 0.42`, just before centre: the 340ms token tween underneath
 *   starts at the swap, and firing early lets it finish while the veil is
 *   still at strength, so the page never visibly morphs after the band has
 *   already thinned.
 *
 *   `bandTight 14` is the default. Lower was tried and the veil lost its
 *   travelling centre — a wash with no crest reads as a dirty screen.
 *
 *   `waveAmount 0`: dead straight. On a drawing the straight working edge is
 *   the professional mark.
 *
 *   `rippleAmount 0.35`: a third of the default. Enough vertical grain that
 *   the wash reads as pigment rather than as a gradient png, not so much
 *   that it shimmers.
 *
 *   `brightness 0.9` / `peakAlpha 0.85`: pulled down from 1 because both
 *   grounds here are low-key and the library is tuned for white sites.
 *
 *   `swellAmount 0` — see the inline note; it is what kills the white bar.
 *
 *   `reducedMotion: "instant"` is the library's default and is left alone:
 *   the ink still changes, it just arrives.
 *
 * The band's colours are never a preset: lib/sweep.ts builds them from the
 * tray — `accentPair` for an ink pick (the two inks either side of the
 * change), `accentChain` through all six for a paper flip. The sweep is the
 * palette, moving.
 *
 * The provider builds nothing until the first sweep, so a reader who never
 * touches the palette pays for none of it.
 */
export function SweepProvider({ children }: { children: React.ReactNode }) {
  return (
    <GlimmProvider
      // Handed to lib/sweep.ts so a second press can wind the band back to the
      // start rather than joining the one already crossing. See sweepApply.
      onController={setSweepController}
      sweepMs={800}
      outroMs={350}
      // Slightly before centre: the token tween underneath is 340ms, and
      // firing at 0.42 of 800ms lets it finish while the veil is still at
      // strength — the swap is masked, not exposed as an after-flicker.
      midpoint={0.42}
      easing="easeInOutCubic"
      direction="ltr"
      bandTight={14}
      waveAmount={0}
      rippleAmount={0.35}
      waveSpeed={0.8}
      brightness={0.9}
      peakAlpha={0.85}
      // Zero, and this is the load-bearing one: swell gates the shader's
      // specular highlight and fresnel rim, and at any non-zero value the
      // crest carries a white bar — horizontal across the top on a keyboard
      // (ttb) flip, which read as a glitch over the header. White is the one
      // colour the palette does not contain. 0 is the library's own
      // "pre-depth flat-stripe look".
      swellAmount={0}
      // Above the sheet and the ruler, below nothing: the band passes over the
      // whole drawing, including its frame.
      zIndex={60}
    >
      {children}
    </GlimmProvider>
  );
}
