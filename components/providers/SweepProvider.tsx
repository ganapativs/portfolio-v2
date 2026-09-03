"use client";
import { GlimmProvider } from "glimm/react";
import { setSweepController, sweepShader } from "@/lib/sweep";
import { houseEase } from "@/components/schematic/useReducedMotion";

/**
 * The sweep that carries a palette change.
 *
 * A custom flat shader (lib/sweep-shader.ts), fetched with glimm on the first
 * press. glimm's own band multiplies a 0.4% sine by waveAmount, so even 2
 * reads as a straight stripe. Ours uses the mesh's three sine harmonics at
 * ~5% — a real wave — with swell 0 (no white ridge) and a clamped palette
 * so a six-ink theme chain cannot overshoot into white on the wake.
 *
 *   `sweepMs 900` / `outroMs 420` / `midpoint 0.45` / `easing houseEase`
 *   Ink only. A paper flip is the iris in lib/vt.ts — a band from the left
 *   is what made the theme switch flicker.
 *
 *   `waveAmount 1` / `rippleAmount 1` / `waveSpeed 0.8`
 *   `brightness 0.9` / `peakAlpha 0.85` / `swellAmount 0`
 */
export function SweepProvider({ children }: { children: React.ReactNode }) {
  return (
    <GlimmProvider
      onController={setSweepController}
      shaderFactory={sweepShader}
      sweepMs={900}
      outroMs={420}
      midpoint={0.45}
      easing={houseEase}
      direction="ltr"
      bandTight={13}
      waveAmount={1}
      rippleAmount={1}
      waveSpeed={0.8}
      brightness={0.9}
      peakAlpha={0.85}
      swellAmount={0}
      zIndex={60}
    >
      {children}
    </GlimmProvider>
  );
}
