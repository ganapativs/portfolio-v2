import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { INK_HEX, SURFACE_HEX, type InkId } from "@/lib/ink";
import { MARK_BAR_PATH, MARK_G_PATH, MARK_VIEWBOX } from "@/lib/mark";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

// satori resolves neither CSS custom properties nor oklch(), so the drawing's
// grounds arrive here as the flat hexes mirrored in lib/ink.ts.
const PAPER = SURFACE_HEX.light.paper;
const SHEET = SURFACE_HEX.light.raise;
const INK = SURFACE_HEX.light.ink;
const INK_2 = SURFACE_HEX.light.ink2;
const INK_3 = SURFACE_HEX.light.ink3;
const RULE = SURFACE_HEX.light.rule;
const RULE_2 = SURFACE_HEX.light.rule2;

// @fontsource ships the raw files; next/font keeps its copies inside the build
// output where a render-time read cannot reach them.
let sans400: Buffer | null = null;
let sans700: Buffer | null = null;
let mono400: Buffer | null = null;

async function getFonts() {
  if (!sans400 || !sans700 || !mono400) {
    const sans = join(process.cwd(), "node_modules", "@fontsource", "hanken-grotesk", "files");
    const mono = join(process.cwd(), "node_modules", "@fontsource", "ibm-plex-mono", "files");
    const [a, b, c] = await Promise.all([
      readFile(join(sans, "hanken-grotesk-latin-400-normal.woff")),
      readFile(join(sans, "hanken-grotesk-latin-700-normal.woff")),
      readFile(join(mono, "ibm-plex-mono-latin-400-normal.woff")),
    ]);
    sans400 = a;
    sans700 = b;
    mono400 = c;
  }
  return { sans400, sans700, mono400 };
}

type RenderArgs = {
  eyebrow: string;
  title: string;
  footer?: string;
  accent?: InkId;
};

/** A corner registration tick, the same one the sheet carries. */
function Tick({ x, y, dx, dy }: { x: number; y: number; dx: number; dy: number }) {
  return (
    <div style={{ position: "absolute", left: x, top: y, display: "flex" }}>
      <div style={{ position: "absolute", width: 22, height: 2, background: RULE_2, top: 10 }} />
      <div style={{ position: "absolute", height: 22, width: 2, background: RULE_2, left: 10 }} />
      <div style={{ position: "absolute", width: dx, height: dy }} />
    </div>
  );
}

/**
 * The share card, set the way the sheet is: the drawing's ground, a title block
 * across the foot, registration ticks at the corners, and the mark in the live
 * ink. Nothing decorative — it is the same object at a different size.
 */
export async function renderOG({
  eyebrow,
  title,
  footer = "meetguns.com",
  accent = "amber",
}: RenderArgs) {
  const fonts = await getFonts();
  const ink = INK_HEX[accent];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: PAPER,
        color: INK,
        fontFamily: '"Sans"',
        padding: 28,
        position: "relative",
      }}
    >
      {/* The sheet, inset from the trim with its frame drawn. */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          border: `2px solid ${RULE_2}`,
          background: SHEET,
          padding: "44px 56px 0",
          position: "relative",
        }}
      >
        {/* Header line: the mark, the name, the drawing title. */}
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg
            width={(34 * MARK_VIEWBOX.width) / MARK_VIEWBOX.height}
            height={34}
            viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
          >
            <path d={MARK_G_PATH} fill={INK} />
            <path d={MARK_BAR_PATH} fill={ink} />
          </svg>
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6 }}>Ganapati V S</div>
          <div
            style={{
              marginLeft: "auto",
              fontFamily: '"Mono"',
              fontSize: 18,
              letterSpacing: 2.4,
              textTransform: "uppercase",
              color: INK_3,
            }}
          >
            {eyebrow}
          </div>
        </div>
        <div style={{ display: "flex", height: 1, background: RULE, marginTop: 22 }} />

        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          <div
            style={{
              fontWeight: 700,
              fontSize: title.length > 60 ? 62 : 78,
              lineHeight: 1.08,
              letterSpacing: -2,
              color: INK,
              maxWidth: 980,
            }}
          >
            {title}
          </div>
        </div>

        {/* The title block, cells and all, across the foot of the sheet. */}
        <div style={{ display: "flex", borderTop: `2px solid ${RULE_2}`, marginTop: 8 }}>
          {[
            ["Drawn by", "Ganapati V S"],
            ["Role", "VP, Technology · Tracxn"],
            ["Scale", "1:1"],
          ].map(([l, v], i) => (
            <div
              key={l}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 6,
                padding: "16px 24px 20px",
                borderLeft: i === 0 ? "none" : `1px solid ${RULE}`,
                paddingLeft: i === 0 ? 0 : 24,
              }}
            >
              <div
                style={{
                  fontFamily: '"Mono"',
                  fontSize: 14,
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  color: INK_3,
                }}
              >
                {l}
              </div>
              <div style={{ fontSize: 22, color: INK_2 }}>{v}</div>
            </div>
          ))}
          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "flex-end",
              padding: "16px 0 20px",
              fontFamily: '"Mono"',
              fontSize: 18,
              letterSpacing: 2,
              color: ink,
            }}
          >
            {footer}
          </div>
        </div>
      </div>

      <Tick x={6} y={6} dx={1} dy={1} />
      <Tick x={1172} y={6} dx={1} dy={1} />
      <Tick x={6} y={596} dx={1} dy={1} />
      <Tick x={1172} y={596} dx={1} dy={1} />
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Sans", data: fonts.sans400, style: "normal", weight: 400 },
        { name: "Sans", data: fonts.sans700, style: "normal", weight: 700 },
        { name: "Mono", data: fonts.mono400, style: "normal", weight: 400 },
      ],
    },
  );
}
