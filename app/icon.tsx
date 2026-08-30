import { INK_HEX } from "@/lib/ink";
import { markSvg } from "@/lib/mark";

export const dynamic = "force-static";
export const size = { width: 32, height: 32 };
export const contentType = "image/svg+xml";

/**
 * The tab-strip favicon. Vector and transparent, unlike the PNG family in
 * lib/icon-png.tsx: the browser chrome around it is the paper, so a printed
 * tile would read as a sticker rather than a mark.
 */
export default function Icon() {
  const isProd = process.env.NODE_ENV === "production";
  // Live ink. Aubergine in development so a dev tab is tellable at a glance.
  const accent = INK_HEX[isProd ? "dustblue" : "aubergine"];
  return new Response(markSvg(accent), {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": isProd ? "public, max-age=86400, must-revalidate" : "no-store",
    },
  });
}
