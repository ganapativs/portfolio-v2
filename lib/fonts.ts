import { Anek_Latin, Fragment_Mono, Piazzolla } from "next/font/google";
import localFont from "next/font/local";

// Four faces, four jobs (see AGENTS.md "Faces"):
//   Anek Latin   — roles, headings, navigation, structure
//   Anek Kannada — ಗಣಪತಿ ವಿ ಎಸ್ at display size, same family proportions
//   Piazzolla    — all prose and essays
//   Fragment Mono — years, counts, repo names, labels. Tabular everywhere.
//
// The brief hand-rolled `AnekFB` / `PiazzollaFB` @font-face fallbacks with
// size-adjust / ascent-override to get zero shift on swap. next/font does that
// for us: `adjustFontFallback` (on by default) measures the real face and emits
// a metric-matched local fallback, so we only declare the family order here.

const anekLatin = Anek_Latin({
  variable: "--font-anek",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

// Anek Kannada (SIL OFL — licence beside the file), self-hosted and cut to the
// characters of ಗಣಪತಿ ವಿ ಎಸ್ by scripts/subset-kannada.py.
//
// Google's Kannada block is 111 kB — the largest single asset the site can
// request — and the colophon carries the name on every page, so it was 111 kB
// at font priority, forever, to set one string. The cut is 9.7 kB and shapes
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
  // The same metric-matched local fallback next/font/google emitted for this
  // face, so a swap still moves nothing.
  adjustFontFallback: "Arial",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

const piazzolla = Piazzolla({
  variable: "--font-piazzolla",
  subsets: ["latin"],
  style: ["normal", "italic"],
  // Piazzolla ships an optical-size axis; carrying it lets `font-optical-sizing:
  // auto` thin the serifs at display sizes and thicken them at 19px prose.
  axes: ["opsz"],
  // Preloaded (the default), and it has to be: on a phone the masthead is
  // small enough that the LCP element is `.lede` — a paragraph of this face —
  // so leaving it to be discovered from the stylesheet cost mobile LCP a full
  // second. The italic comes along for the ride at 55 kB nothing above the
  // fold needs; `preload` is per-loader-call, not per-style, and the only way
  // to split them is a second family that italic text would never fall through
  // to (CSS font matching synthesizes an oblique instead). Not worth it.
  display: "swap",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const fragmentMono = Fragment_Mono({
  variable: "--font-fragment",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  fallback: ["ui-monospace", "Menlo", "monospace"],
});

export const pressFontVars = [
  anekLatin.variable,
  anekKannada.variable,
  piazzolla.variable,
  fragmentMono.variable,
].join(" ");
