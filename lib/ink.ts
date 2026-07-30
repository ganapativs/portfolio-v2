// The press ink system.
//
// Six press inks, one active at a time. Nothing here writes CSS custom
// properties from JavaScript: the whole palette lives in styles/press.css keyed
// on `[data-ink]` × `[data-theme]` × `[data-mode]`. JS only ever stamps three
// data attributes on <html>.
//
// Two things fall out of that:
//   1. The no-flash script in app/layout.tsx is three attribute writes, so there
//      is no palette to keep in sync between here and there.
//   2. `--accent` and friends are @property-registered <color>s, so an ink
//      change is a real 340ms oklch interpolation rather than a hard swap.

export const INKS = [
  { id: "bottle", label: "bottle green", hex: "#1b6c46", darkHex: "#7dbf92", freq: 659.25 },
  { id: "brass", label: "brass", hex: "#a48030", darkHex: "#e2c276", freq: 783.99 },
  { id: "oxblood", label: "oxblood", hex: "#97403e", darkHex: "#e78c7f", freq: 880.0 },
  { id: "dustblue", label: "dust blue", hex: "#36698c", darkHex: "#84b2d9", freq: 987.77 },
  { id: "aubergine", label: "aubergine", hex: "#6b3c7e", darkHex: "#c08acc", freq: 587.33 },
  { id: "umber", label: "burnt umber", hex: "#72523d", darkHex: "#c19f88", freq: 523.25 },
] as const;

export type InkId = (typeof INKS)[number]["id"];

export const DEFAULT_INK: InkId = "bottle";

// Press run. The dock labels these 2 INK / SPOT / 1 INK:
//   colorful — ink plus its wash, the full two-colour run
//   mono     — ink kept for spot use only, washes off
//   plain    — one ink: the accent collapses onto the text colour
export type Mode = "colorful" | "mono" | "plain";
export const MODES: readonly Mode[] = ["colorful", "mono", "plain"];
export const MODE_LABEL: Record<Mode, string> = {
  colorful: "2 ink",
  mono: "spot",
  plain: "1 ink",
};

const INK_IDS: readonly InkId[] = INKS.map((i) => i.id);

export function isInkId(v: unknown): v is InkId {
  return typeof v === "string" && (INK_IDS as readonly string[]).includes(v);
}

export function isMode(v: unknown): v is Mode {
  return v === "colorful" || v === "mono" || v === "plain";
}

// Flat id → hex map. Used by the edge-rendered OG/Twitter cards, which run in
// satori and can read neither CSS custom properties nor oklch(). Mirrors the
// light-paper column of the ink matrix in styles/press/tokens.css.
export const INK_HEX = Object.fromEntries(INKS.map((i) => [i.id, i.hex])) as Record<InkId, string>;

// Surface hexes, mirrored from the oklch values in styles/press.css. Same
// consumers, same reason. Keep both sides in step.
export const SURFACE_HEX = {
  light: {
    paper: "#e7eee4",
    raise: "#f9fcf6",
    sunk: "#d3e0d2",
    ink: "#001a0d",
    ink2: "#344d3f",
    ink3: "#566a5e",
    rule: "#c2d2c4",
    rule2: "#a2b5a7",
  },
  dark: {
    paper: "#03180c",
    raise: "#142519",
    sunk: "#000a04",
    ink: "#efeee7",
    ink2: "#bebfb5",
    ink3: "#91978a",
    rule: "#2c3a2c",
    rule2: "#465143",
  },
} as const;

export const STORAGE_KEYS = {
  theme: "mg_theme",
  ink: "mg_ink",
  mode: "mg_mode",
  sound: "mg_sound",
} as const;
