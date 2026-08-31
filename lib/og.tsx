import { ImageResponse } from "next/og";
import { MONO_400_B64, SANS_400_B64, SANS_700_B64 } from "@/lib/og-fonts";
import { INK_HEX, INKS, SURFACE_HEX, type InkId } from "@/lib/ink";
import { MARK_BAR_PATH, MARK_G_PATH, MARK_VIEWBOX } from "@/lib/mark";
// The name and the role on the card come from the résumé's single source. The
// cards render at build time, so pulling resume.ts in costs the reader nothing;
// hand-typed copies here printed a stale title long after a change.
import { identity } from "@/lib/resume";

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
  /**
   * The dimension row under the title — measured values, set the way the sheet
   * sets a measurement: mono, the number in ink, the unit in the annotation
   * grey. Pass what the route can back up (years, stars, a date, a read time).
   */
  dims?: { v: string; l?: string }[];
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
/**
 * The figure the card carries: a hand-plotted series with its dimension drawn
 * under it, the same convention as fig. 5 on the sheet. A shape, not data —
 * like `CHART` on the home page it states no values, which is why the only
 * label it takes is `dim`, a measurement the route can actually back up.
 */
function FigureSVG({ ink, ink3, rule2 }: { ink: string; ink3: string; rule2: string }) {
  const pts =
    "8,170 36,150 64,158 92,118 120,132 148,94 176,106 204,64 232,82 260,42 288,56 316,26";
  return (
    <svg width={340} height={244} viewBox="0 0 340 244">
      {/* The series' area, washed in the ink the way --accent-soft washes. */}
      <path d={`M${pts.split(" ").join(" L")} L316,190 L8,190 Z`} fill={`${ink}1f`} />
      <polyline points={pts} fill="none" stroke={ink} strokeWidth={3} strokeLinejoin="round" />
      {/* The baseline, with survey ticks. */}
      <line x1={8} y1={190} x2={316} y2={190} stroke={rule2} strokeWidth={2} />
      {[8, 85, 162, 239, 316].map((x) => (
        <line key={x} x1={x} y1={190} x2={x} y2={196} stroke={rule2} strokeWidth={2} />
      ))}
      {/* The reading head: the last point, marked. */}
      <circle cx={316} cy={26} r={6} fill={ink} />
      <circle cx={316} cy={26} r={11} fill="none" stroke={ink} strokeWidth={1.5} opacity={0.45} />
      {/* The dimension: extension lines, the line, two arrowheads. */}
      <line x1={8} y1={196} x2={8} y2={226} stroke={ink3} strokeWidth={1.5} />
      <line x1={316} y1={196} x2={316} y2={226} stroke={ink3} strokeWidth={1.5} />
      <line x1={14} y1={218} x2={310} y2={218} stroke={ink3} strokeWidth={1.5} />
      <path d="M8 218 L20 213 L20 223 Z" fill={ink3} />
      <path d="M316 218 L304 213 L304 223 Z" fill={ink3} />
    </svg>
  );
}

export async function renderOG({
  eyebrow,
  title,
  footer = "meetguns.com",
  accent = "dustblue",
  dims = [],
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
          <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.6 }}>{identity.name}</div>
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

        {/* The body: the title and its measured dimensions on the left, the
            figure with its own dimension line on the right — the sheet's two
            registers, language and measurement, side by side. */}
        <div style={{ display: "flex", flex: 1, alignItems: "center", gap: 52 }}>
          <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: 30 }}>
            <div
              style={{
                fontWeight: 700,
                fontSize: title.length > 56 ? 48 : title.length > 32 ? 58 : 70,
                lineHeight: 1.08,
                letterSpacing: -1.5,
                color: INK,
              }}
            >
              {title}
            </div>
            {dims.length > 0 && (
              <div style={{ display: "flex", alignItems: "baseline", gap: 34 }}>
                {dims.map((d) => (
                  <div
                    key={d.v + (d.l ?? "")}
                    style={{ display: "flex", alignItems: "baseline", gap: 8 }}
                  >
                    <div style={{ fontFamily: '"Mono"', fontSize: 33, color: INK }}>{d.v}</div>
                    {d.l && (
                      <div
                        style={{
                          fontFamily: '"Mono"',
                          fontSize: 15,
                          letterSpacing: 1.5,
                          textTransform: "uppercase",
                          color: INK_3,
                        }}
                      >
                        {d.l}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
            <FigureSVG ink={ink} ink3={INK_3} rule2={RULE_2} />
            <div
              style={{
                fontFamily: '"Mono"',
                fontSize: 15,
                letterSpacing: 1.8,
                color: INK_3,
              }}
            >
              running series · 1:1
            </div>
          </div>
        </div>

        {/* The title block, cells and all, across the foot of the sheet. */}
        <div style={{ display: "flex", borderTop: `2px solid ${RULE_2}`, marginTop: 8 }}>
          {[
            ["Drawn by", identity.name],
            ["Role", `${identity.jobTitle} · ${identity.worksFor.name}`],
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
          {/* The ink tray, the same six the header offers, with the card's own
              ink ringed. The one cell that is colour rather than type. */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
              padding: "16px 24px 20px",
              borderLeft: `1px solid ${RULE}`,
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
              Inks
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {INKS.map((i) => (
                <div
                  key={i.id}
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: 3,
                    background: i.hex,
                    border: i.id === accent ? `2px solid ${INK}` : `2px solid transparent`,
                  }}
                />
              ))}
            </div>
          </div>
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
