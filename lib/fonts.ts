import { Anek_Latin, Anek_Kannada, Fragment_Mono, Piazzolla } from "next/font/google";

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

const anekKannada = Anek_Kannada({
  variable: "--font-anek-kannada",
  subsets: ["kannada", "latin"],
  display: "swap",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

const piazzolla = Piazzolla({
  variable: "--font-piazzolla",
  subsets: ["latin"],
  style: ["normal", "italic"],
  // Piazzolla ships an optical-size axis; carrying it lets `font-optical-sizing:
  // auto` thin the serifs at display sizes and thicken them at 19px prose.
  axes: ["opsz"],
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
