// The press ink system.
//
// Six Bengaluru inks, one active at a time. Nothing here writes CSS custom
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
  { id: "terracotta", label: "monsoon clay", hex: "#ae532d", darkHex: "#ee8e64", freq: 659.25 },
  { id: "saffron", label: "turmeric milk", hex: "#a4771c", darkHex: "#ecc166", freq: 783.99 },
  { id: "sage", label: "neem leaf", hex: "#357a43", darkHex: "#76c788", freq: 880.0 },
  { id: "rose", label: "gulkand rose", hex: "#b94e67", darkHex: "#f78c9e", freq: 987.77 },
  { id: "plum", label: "jamun", hex: "#80449f", darkHex: "#bf8ae6", freq: 587.33 },
  { id: "coffee", label: "filter coffee", hex: "#7c4e32", darkHex: "#ca9877", freq: 523.25 },
] as const;

export type InkId = (typeof INKS)[number]["id"];

export const DEFAULT_INK: InkId = "terracotta";

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
    paper: "#f5ecda",
    raise: "#fefaf0",
    sunk: "#e9dcc7",
    ink: "#21150f",
    ink2: "#52453d",
    ink3: "#6d6059",
    rule: "#dacfc2",
    rule2: "#c1b5a9",
  },
  dark: {
    paper: "#1a120c",
    raise: "#271d16",
    sunk: "#100a06",
    ink: "#f1eadf",
    ink2: "#beb6ab",
    ink3: "#9a9187",
    rule: "#3b3029",
    rule2: "#51453c",
  },
} as const;

export const STORAGE_KEYS = {
  theme: "mg_theme",
  ink: "mg_ink",
  mode: "mg_mode",
  sound: "mg_sound",
} as const;
