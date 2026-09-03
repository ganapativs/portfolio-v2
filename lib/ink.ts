// The drawing inks.
//
// Six inks, one active at a time. Nothing here writes CSS custom properties
// from JavaScript: the whole palette lives in styles/press/tokens.css keyed on
// `[data-ink]` × `[data-theme]` stamped on <html>. JS only ever stamps those
// two attributes.
//
// Two things fall out of that:
//   1. The no-flash script in app/layout.tsx is two attribute writes plus the
//      ground colour, so there is no palette to keep in sync between here and
//      there.
//   2. `--accent` is an @property-registered <color>, so an ink change is a
//      real 340ms interpolation rather than a hard swap. A pointer pick has a
//      glimm band travelling over the top of it — see lib/sweep.ts.

// Tray order, which is also the order of keys 1-6 and of the rising pitch run.
// The default leads it: the ink the sheet arrives in is the first one offered.
// The pitches belong to the POSITION, not to the ink — they rise by 52 Hz so
// that playing the tray left to right is a run, and reordering the inks without
// reassigning them would put a step in the middle of it.
export const INKS = [
  { id: "dustblue", label: "dust blue", hex: "#2b6083", darkHex: "#86b3db", freq: 440 },
  { id: "amber", label: "drafting amber", hex: "#8f5c0c", darkHex: "#d9962b", freq: 492 },
  { id: "bottle", label: "bottle green", hex: "#176540", darkHex: "#7fbf93", freq: 544 },
  { id: "oxblood", label: "oxblood", hex: "#8d3936", darkHex: "#e58c7f", freq: 596 },
  { id: "aubergine", label: "aubergine", hex: "#6a3c7c", darkHex: "#c28fce", freq: 648 },
  { id: "olive", label: "olive", hex: "#65681f", darkHex: "#bebd66", freq: 700 },
] as const;

export type InkId = (typeof INKS)[number]["id"];

// Dust blue: the ink a drawing office reproduced in. Blueprint stock, the diazo
// line, the pencil-blue a draughtsman set out with. A working colour rather
// than a brand one, which is the test the other five have to pass too.
export const DEFAULT_INK: InkId = "dustblue";

const INK_IDS: readonly InkId[] = INKS.map((i) => i.id);

export function isInkId(v: unknown): v is InkId {
  return typeof v === "string" && (INK_IDS as readonly string[]).includes(v);
}

// Flat id → hex maps. Used by the edge-rendered OG/Twitter cards and by the
// portrait canvas, neither of which can read a CSS custom property. Mirrors the
// ink matrix in styles/press/tokens.css — change one, change the other.
export const INK_HEX = Object.fromEntries(INKS.map((i) => [i.id, i.hex])) as Record<InkId, string>;
export const INK_HEX_DARK = Object.fromEntries(INKS.map((i) => [i.id, i.darkHex])) as Record<
  InkId,
  string
>;

// The two grounds, mirrored from tokens.css. Same consumers, same reason.
// Light is warm drawing paper; dark is graphite.
export const SURFACE_HEX = {
  light: {
    paper: "#f5f3ec",
    raise: "#faf8f1",
    sunk: "#f0ede2",
    ink: "#1d1e1a",
    ink2: "#42433c",
    ink3: "#68695f",
    rule: "#cfc9b6",
    rule2: "#98937f",
    rule3: "#e6e1d2",
  },
  dark: {
    paper: "#131417",
    raise: "#191b1f",
    sunk: "#15171b",
    ink: "#e8e9e4",
    ink2: "#b6b9bd",
    ink3: "#8e9299",
    rule: "#2e3238",
    rule2: "#4c525c",
    rule3: "#23262b",
  },
} as const;

export const STORAGE_KEYS = {
  theme: "mg_theme",
  ink: "mg_ink",
  sound: "mg_sound",
} as const;
