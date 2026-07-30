import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { INK_HEX, SURFACE_HEX, type InkId } from "@/lib/ink";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

// satori resolves neither CSS custom properties nor oklch(), so the press
// surfaces arrive here as the flat hexes mirrored in lib/ink.ts.
const PAPER = SURFACE_HEX.light.paper;
const INK = SURFACE_HEX.light.ink;
const INK_2 = SURFACE_HEX.light.ink2;
const INK_3 = SURFACE_HEX.light.ink3;
const RULE = SURFACE_HEX.light.rule;

// @fontsource ships the raw files; next/font keeps its copies inside the build
// output where a render-time read can't reach them. Same reason the retired
// design kept its own @fontsource devDependency for this.
let anek400: Buffer | null = null;
let anek700: Buffer | null = null;
let fragment400: Buffer | null = null;

async function getFonts() {
  if (!anek400 || !anek700 || !fragment400) {
    const anek = join(process.cwd(), "node_modules", "@fontsource", "anek-latin", "files");
    const mono = join(process.cwd(), "node_modules", "@fontsource", "fragment-mono", "files");
    const [a, b, c] = await Promise.all([
      readFile(join(anek, "anek-latin-latin-400-normal.woff")),
      readFile(join(anek, "anek-latin-latin-700-normal.woff")),
      readFile(join(mono, "fragment-mono-latin-400-normal.woff")),
    ]);
    anek400 = a;
    anek700 = b;
    fragment400 = c;
  }
  return { anek400, anek700, fragment400 };
}

type RenderArgs = {
  eyebrow: string;
  title: string;
  footer?: string;
  accent?: InkId;
};

/**
 * The share card, set the way the page is: warm paper, a rule at the top in the
 * live ink, the folio line in Fragment Mono and the title in Anek.
 */
export async function renderOG({
  eyebrow,
  title,
  footer = "meetguns.com",
  accent = "bottle",
}: RenderArgs) {
  const fonts = await getFonts();
  const ink = INK_HEX[accent];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PAPER,
        color: INK,
        fontFamily: '"Anek"',
        padding: "64px 80px",
        position: "relative",
      }}
    >
      {/* The ink rule across the head of the sheet. */}
      <div
        style={{ position: "absolute", top: 0, left: 0, right: 0, height: 12, background: ink }}
      />

      {/* Folio line, same words as the bar on the site. */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: '"Fragment"',
          fontSize: 21,
          letterSpacing: 2,
          textTransform: "uppercase",
          color: INK_3,
        }}
      >
        <span>meetguns press · est. 2013 · Bengaluru</span>
        <span style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span
            style={{
              width: 14,
              height: 14,
              borderRadius: 999,
              border: `3px solid ${ink}`,
              display: "block",
            }}
          />
          <span>{eyebrow}</span>
        </span>
      </div>

      <div style={{ display: "flex", flex: 1, alignItems: "center", marginTop: 28 }}>
        <div
          style={{
            fontFamily: '"Anek"',
            fontWeight: 700,
            fontSize: title.length > 60 ? 72 : 92,
            lineHeight: 1.02,
            letterSpacing: -2.5,
            color: INK,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          paddingTop: 24,
          borderTop: `3px solid ${INK}`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 16,
            fontSize: 30,
            color: INK,
          }}
        >
          <span style={{ fontWeight: 700 }}>Ganapati V S</span>
          <span style={{ fontSize: 24, color: INK_2 }}>VP, Technology · Tracxn</span>
        </div>
        <div
          style={{
            fontFamily: '"Fragment"',
            fontSize: 21,
            letterSpacing: 2,
            textTransform: "uppercase",
            color: INK_3,
          }}
        >
          {footer}
        </div>
      </div>

      {/* Registration marks, bottom corners — the same pair the site fixes to
          the viewport. */}
      <div
        style={{
          position: "absolute",
          left: 26,
          bottom: 26,
          width: 18,
          height: 18,
          borderLeft: `2px solid ${RULE}`,
          borderBottom: `2px solid ${RULE}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 26,
          bottom: 26,
          width: 18,
          height: 18,
          borderRight: `2px solid ${RULE}`,
          borderBottom: `2px solid ${RULE}`,
        }}
      />
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Anek", data: fonts.anek400, style: "normal", weight: 400 },
        { name: "Anek", data: fonts.anek700, style: "normal", weight: 700 },
        { name: "Fragment", data: fonts.fragment400, style: "normal", weight: 400 },
      ],
    },
  );
}
