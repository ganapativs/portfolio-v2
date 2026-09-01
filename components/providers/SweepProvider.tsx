"use client";
import { GlimmProvider } from "glimm/react";
import { setSweepController } from "@/lib/sweep";
// glimm takes an easing function as well as a name, and its named set does not
// contain this curve. Shared with the rAF-driven motion in the figures.
import { houseEase } from "@/components/schematic/useReducedMotion";

/**
 * The sweep that carries a palette change.
 *
 * glimm draws one WebGL band across the viewport and hands you a midpoint to
 * swap state on, so the new ground and the new ink arrive underneath the band
 * rather than being crossfaded over. It replaced a clip-path iris: a circle
 * opening from a control said "this control did it", but the thing that
 * actually happens on a press is a roller passing over the sheet.
 *
 * The FLAT shader, at the MESH's tempo — the settled hybrid, and both halves
 * are the owner's calls:
 *
 *   The mesh (`createMeshShader`) is gone because its lit ridge was a white
 *   bar riding the crest — horizontal across the top of the sheet on a
 *   keyboard (ttb) flip, over the header, on every press. White is the one
 *   colour the palette does not contain. The flat band in the tray's own
 *   inks is a wash of pigment instead of a searchlight.
 *
 *   `swellAmount 0`, and it must stay 0: it gates the flat shader's OWN
 *   specular highlight and fresnel rim — the same white bar by another
 *   switch, and the library defaults it to 0.55.
 *
 *   `sweepMs 900` / `outroMs 420` / `midpoint 0.45` / `easing houseEase` are
 *   the mesh era's timing, kept verbatim: a faster easeInOutCubic remake was
 *   tried and read hurried. This is the one place the motion law is
 *   deliberately exceeded — the whole sheet being re-inked, not a control
 *   answering — and it has been shortened twice and both times the sweep was
 *   simply missed.
 *
 *   `waveAmount 0`: dead straight. On a drawing the straight working edge is
 *   the professional mark.
 *
 *   `rippleAmount 0.35`: a third of the default. Enough vertical grain that
 *   the wash reads as pigment rather than as a gradient png, not so much
 *   that it shimmers.
 *
 *   `brightness 0.9` / `peakAlpha 0.85`: pulled down from 1 because the
 *   library is tuned for white sites and both grounds here are low-key.
 *
 *   `reducedMotion: "instant"` is the library's default and is left alone:
 *   the ink still changes, it just arrives.
 *
 * The band's colours are never a preset: lib/sweep.ts builds them from the
 * tray — `accentPair` for an ink pick, `accentChain` through all six for a
 * paper flip — always in the LIT (dark-ground) ink values on either paper,
 * because a veil of light has to be lit: the light-ground pigments are dark
 * and filmed the paper brown (measured in a pinned-frame harness).
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
      sweepMs={900}
      outroMs={420}
      // The palette swaps at 0.45 of 900ms, so the ink has moved 405ms after
      // the press: late enough that the band is over the middle of the sheet
      // when it happens, early enough that the control still feels answered.
      midpoint={0.45}
      easing={houseEase}
      direction="ltr"
      bandTight={13}
      waveAmount={0}
      rippleAmount={0.35}
      waveSpeed={0.8}
      brightness={0.9}
      peakAlpha={0.85}
      swellAmount={0}
      // Above the sheet and the ruler, below nothing: the band passes over the
      // whole drawing, including its frame.
      zIndex={60}
    >
      {children}
    </GlimmProvider>
  );
}
