import { ImageResponse } from "next/og";
import { MONO_400_B64, SANS_400_B64, SANS_700_B64 } from "@/lib/og-fonts";
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

/**
 * The three faces, decoded once per isolate.
 *
 * These used to be read off disk out of node_modules at render time.
 * @fontsource ships the raw files and next/font keeps its copies inside the
 * build output where a render-time read cannot reach them, so reading the
 * package directly was the way to get at a woff. It worked under `next build`
 * and `next start`, and it threw the moment the site moved to a Cloudflare
 * Worker, which has no filesystem: every share card 500d on a cache miss.
 *
 * lib/og-fonts.ts carries the same bytes as base64, generated and committed by
 * scripts/gen-og-fonts.mjs, so the bundler brings them along and one code path
 * serves Node and the edge. Decoding is lazy and memoised because satori wants
 * the bytes on every render and base64 of 47 kB is not free.
 */
let decoded: { sans400: ArrayBuffer; sans700: ArrayBuffer; mono400: ArrayBuffer } | null = null;

/** Base64 to the ArrayBuffer satori's `data` takes. */
function fromBase64(b64: string): ArrayBuffer {
  // `atob` rather than `Buffer`: Buffer is a Node global the Worker provides
  // only under nodejs_compat, and this needs no polyfill to work anywhere.
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  // Allocated here, so the backing store is a plain ArrayBuffer.
  return out.buffer as ArrayBuffer;
}

function getFonts() {
  decoded ??= {
    sans400: fromBase64(SANS_400_B64),
    sans700: fromBase64(SANS_700_B64),
    mono400: fromBase64(MONO_400_B64),
  };
  return decoded;
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
  accent = "dustblue",
}: RenderArgs) {
  const fonts = getFonts();
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
