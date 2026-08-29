import { ImageResponse } from "next/og";
import { INK_HEX, SURFACE_HEX } from "@/lib/ink";
import { MARK_BAR_PATH, MARK_G_PATH, MARK_VIEWBOX } from "@/lib/mark";

/**
 * The raster mark, one function for every PNG icon the site serves:
 * /icon-192, /icon-512, /icon-512-maskable and /apple-icon.
 *
 * Every one of them is a printed object — ink on the light paper — rather than
 * a transparent glyph. A home-screen tile and an Android launcher icon are
 * composited onto surfaces we don't control, and a transparent G disappears on
 * half of them. The tab-strip favicon is the exception and stays a transparent
 * SVG (app/icon.tsx), because there the surrounding chrome *is* the paper.
 *
 * Aubergine in development so a dev install is tellable from the real one.
 */
export function markPng(size: number, { maskable = false } = {}) {
  const isProd = process.env.NODE_ENV === "production";
  const accent = INK_HEX[isProd ? "amber" : "aubergine"];
  const bg = SURFACE_HEX.light.paper;

  // Android crops a maskable icon to an arbitrary shape and only guarantees the
  // central 80%; the safe circle inside that is narrower still. 0.42 of the
  // canvas keeps the whole glyph inside it, where 0.62 — right for a square
  // icon nobody crops — would lose the bar.
  const glyphH = Math.round(size * (maskable ? 0.42 : 0.62));
  const glyphW = Math.round((glyphH * MARK_VIEWBOX.width) / MARK_VIEWBOX.height);

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: bg,
      }}
    >
      <svg
        width={glyphW}
        height={glyphH}
        viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
        fill={accent}
      >
        <path d={MARK_G_PATH} />
        <path d={MARK_BAR_PATH} />
      </svg>
    </div>,
    { width: size, height: size },
  );
}
