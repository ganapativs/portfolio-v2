// Six "hue" accents tuned to a C-major pentatonic spread (C5–B5) so
// successive picks harmonise. Two "pure" extremes — paper (white) and
// ink (black) — sit beside them as polarity overrides: when picked, the
// page collapses to a two-tone monochrome (pure bg + opposite fg) and
// ignores the active theme. Each frequency maps to a distinct musical
// pitch so the picker also doubles as a tiny chime.
export const ACCENTS = [
  {
    id: "terracotta",
    label: "monsoon clay",
    kind: "hue",
    c: "#D88762",
    soft: "rgba(216,135,98,0.14)",
    freq: 659.25,
  }, // E5
  {
    id: "saffron",
    label: "turmeric milk",
    kind: "hue",
    c: "#E8B86B",
    soft: "rgba(232,184,107,0.16)",
    freq: 783.99,
  }, // G5
  {
    id: "sage",
    label: "neem leaf",
    kind: "hue",
    c: "#8FA37A",
    soft: "rgba(143,163,122,0.16)",
    freq: 880.0,
  }, // A5
  {
    id: "rose",
    label: "gulkand rose",
    kind: "hue",
    c: "#C97B7B",
    soft: "rgba(201,123,123,0.16)",
    freq: 987.77,
  }, // B5
  {
    id: "plum",
    label: "jamun",
    kind: "hue",
    c: "#6E5167",
    soft: "rgba(110,81,103,0.18)",
    freq: 587.33,
  }, // D5
  {
    id: "coffee",
    label: "filter coffee",
    kind: "hue",
    c: "#7C4628",
    soft: "rgba(124,70,40,0.14)",
    freq: 523.25,
  }, // C5
  {
    id: "paper",
    label: "rice paper",
    kind: "pure",
    polarity: "light",
    c: "#000000",
    soft: "rgba(0,0,0,0.06)",
    freq: 1318.51,
  }, // E6 — bright bell
  {
    id: "ink",
    label: "lamp black",
    kind: "pure",
    polarity: "dark",
    c: "#FFFFFF",
    soft: "rgba(255,255,255,0.08)",
    freq: 130.81,
  }, // C3 — deep gong
] as const;

export type AccentId = (typeof ACCENTS)[number]["id"];
export type AccentDef = (typeof ACCENTS)[number];
// The 6 hue accents (excluding the two `pure` polarity overrides). Used as the
// rotating brand-color token on cards/tickets/blog posts.
export type HueAccentId = Extract<AccentDef, { kind: "hue" }>["id"];

export const DEFAULT_ACCENT: AccentId = "terracotta";

const HUE_ACCENTS = ACCENTS.filter((a) => a.kind === "hue") as ReadonlyArray<
  Extract<AccentDef, { kind: "hue" }>
>;

const HUE_ACCENT_IDS: readonly HueAccentId[] = HUE_ACCENTS.map((a) => a.id);

export const accentAt = (i: number): HueAccentId => HUE_ACCENT_IDS[i % HUE_ACCENT_IDS.length];

export function getAccent(id: string): AccentDef {
  return ACCENTS.find((x) => x.id === id) ?? ACCENTS[0];
}

export function isPureAccent(id: string): boolean {
  const a = ACCENTS.find((x) => x.id === id);
  return a?.kind === "pure";
}

export function applyAccent(id: string) {
  const a = getAccent(id);
  const r = document.documentElement;
  r.style.setProperty("--accent", a.c);
  r.style.setProperty("--accent-soft", a.soft);
  r.style.setProperty(
    "--accent-hover",
    a.kind === "pure" ? a.c : `color-mix(in oklab, ${a.c} 78%, black)`,
  );
  r.style.setProperty("--link", a.c);
  r.style.setProperty("--link-hover", a.c);
  r.style.setProperty("--highlight", a.c);
  r.style.setProperty("--accent-live", a.c);
  r.style.setProperty("--accent-live-soft", a.soft);

  if (a.kind === "pure") {
    r.dataset.pure = a.id;
    // Pure modes carry their own polarity; record it for CSS so meta-color
    // (theme-color, scrollbar) can match without us touching ThemeProvider state.
    r.dataset.purePolarity = a.polarity;
  } else {
    delete r.dataset.pure;
    delete r.dataset.purePolarity;
  }
}

export function applyMono(on: boolean) {
  const r = document.documentElement;
  if (on) r.dataset.mono = "true";
  else delete r.dataset.mono;
}

// The view-transition helper moved to lib/vt.ts when the press design landed —
// both shells share it. Re-exported here so the /old components keep their
// existing import path.
export { withViewTransition, type RecolorOrigin } from "./vt";
