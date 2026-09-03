import { Hanken_Grotesk, IBM_Plex_Mono } from "next/font/google";
import localFont from "next/font/local";

// Three faces, three jobs (see AGENTS.md "Faces"):
//   Hanken Grotesk — everything set as language: prose, headings, navigation
//   IBM Plex Mono  — everything set as a measurement: dimensions, years,
//                    counts, part numbers, labels on the drawing
//   Anek Kannada   — ಗಣಪತಿ ವಿ ಎಸ್, and only that
//
// The split is the whole type system. A drawing distinguishes what is written
// on it from what is measured on it, and the reader can tell which is which
// before reading either.
//
// next/font's `adjustFontFallback` (on by default) measures the real face and
// emits a metric-matched local fallback, so we only declare the family order.

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  // Four weights, all of them load-bearing: 400 prose, 500 mid-weight labels,
  // 600 headings and emphasis, 700 the name in the header.
  weight: ["400", "500", "600", "700"],
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

// Preload is off. Plex Mono sets the drawing's annotations — ruler ticks,
// dimensions, the title block — none of which is the LCP element on any
// viewport, and a preload here competes with Hanken for the same pipe. The
// annotations arrive a beat after the prose, which is the correct order.
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  preload: false,
  fallback: ["ui-monospace", "Menlo", "monospace"],
});

// Anek Kannada (SIL OFL — licence beside the file), self-hosted and cut to the
// characters of ಗಣಪತಿ ವಿ ಎಸ್ by scripts/subset-kannada.py.
//
// Google's Kannada block is 111 kB — the largest single asset the site can
// request — and the header carries the name on every page, so it was 111 kB at
// font priority, forever, to set one string. The cut is 9.7 kB and shapes
// identically: measured against the un-subsetted face it is the same width to
// the tenth of a pixel at 400, 500 and 600.
//
// That equality is load-bearing and fragile — see the GDEF note in AGENTS.md
// under "Fonts on the wire". Re-measure after any change to the script; the
// failure mode is "slightly loose", which survives a visual check.
//
// Regenerate with `pnpm gen:kannada-subset`.
const anekKannada = localFont({
  src: "../fonts/anek-kannada-name-subset.woff2",
  variable: "--font-anek-kannada",
  weight: "100 800",
  style: "normal",
  display: "swap",
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

export const pressFontVars = [hanken.variable, plexMono.variable, anekKannada.variable].join(" ");
