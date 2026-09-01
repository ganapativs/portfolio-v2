"use client";
import { GlimmProvider } from "glimm/react";
import { glimmNow, setSweepController } from "@/lib/sweep";
// glimm takes an easing function as well as a name, and its named set does not
// contain this curve. Shared with the rAF-driven motion in the figures.
import { houseEase } from "@/components/schematic/useReducedMotion";

/**
 * The mesh band, rather than the flat one.
 *
 * `createShader` draws a stripe across a fullscreen quad. `createMeshShader`
 * displaces a 96x56 grid into a crest and lights it, so the band arrives with
 * a leading edge, a lit ridge and a rim: the thing passing over the sheet
 * reads as a wave with a body rather than as a lighter rectangle. The nine
 * "idea" flags are the library's own extras and four of them are on:
 *
 *   secondaryCrest       a second, smaller wave trailing the first, so the
 *                        pass has a beginning and an end rather than one edge
 *   refraction           the crest bends what is under it, which is the one
 *                        thing that makes it read as a material and not a
 *                        gradient
 *   chromaticDispersion  the rim splits colour the way a real lens edge does,
 *                        held at 0.5 because at full strength the sheet's own
 *                        greys start to fringe
 *   bloom                a soft falloff off the ridge, so the crest has a
 *                        highlight instead of a hard top
 *
 * Left off: sparkles and curlWake, which are lovely and belong to a different
 * site; noiseEdge, which fights the straight leading edge; cameraSweep, which
 * moves the whole plane and made the fixed sheet frame look loose.
 *
 * `createMeshShader` is reached through `glimmNow()` rather than imported at
 * the top of this file, because that import put glimm's whole root module in
 * the root layout chunk on every route. glimm calls this factory
 * synchronously, from inside `sweep()`, and `sweepApply` awaits the module
 * before it sweeps -- so by the time anything calls this, it is here.
 */
const meshFactory: Parameters<typeof GlimmProvider>[0]["shaderFactory"] = (opts) =>
  glimmNow()?.createMeshShader({
    ...opts,
    elevation: 0.24,
    ideas: {
      secondaryCrest: 1,
      refraction: 1,
      chromaticDispersion: 0.5,
      bloom: 1,
      asymmetricSwell: 0.6,
    },
  }) ?? null;

/**
 * The sweep that carries a palette change.
 *
 * glimm draws one WebGL band across the viewport and hands you a midpoint to
 * swap state on, so the new ground and the new ink arrive underneath the band
 * rather than being crossfaded over. It replaced a clip-path iris: a circle
 * opening from the control said "this control did it", but the thing that
 * actually happens on a press is a roller passing over the sheet.
 *
 * Every setting here is a decision:
 *
 *   `sweepMs`/`outroMs` are the one place the motion law is deliberately
 *   exceeded. Everything the reader caused is capped at 260ms, but this is not
 *   a control responding: it is the whole sheet being re-inked. 900 plus a
 *   420ms fade is slow enough to watch. It has been shortened twice and both
 *   times the sweep was simply missed.
 *
 *   `waveAmount` and `rippleAmount` are on now. The band used to be dead
 *   straight, on the argument that a drawing is made with a straightedge. The
 *   straightedge is the drawing; the roller is not part of it, and a roller
 *   with a straight edge and no texture is just a rectangle of light.
 *
 *   `brightness` and `peakAlpha` are still pulled down. Both grounds here are
 *   low-key, and at the library's defaults the band blows out to near-white on
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
      shaderFactory={meshFactory}
      // Handed to lib/sweep.ts so a second press can wind the band back to the
      // start rather than joining the one already crossing. See sweepApply.
      onController={setSweepController}
      sweepMs={900}
      outroMs={420}
      // The palette swaps at 0.45 of 900ms, so the ink has moved 405ms after
      // the press: late enough that the crest is over the middle of the sheet
      // when it happens, early enough that the control still feels answered.
      midpoint={0.45}
      easing={houseEase}
      direction="ltr"
      bandTight={13}
      waveAmount={0.55}
      rippleAmount={0.45}
      waveSpeed={0.8}
      swellAmount={0.75}
      brightness={0.72}
      peakAlpha={0.82}
      // Above the sheet and the ruler, below nothing: the band passes over the
      // whole drawing, including its frame.
      zIndex={60}
    >
      {children}
    </GlimmProvider>
  );
}
