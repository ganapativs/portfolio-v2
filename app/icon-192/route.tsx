import { markPng } from "@/lib/icon-png";

// Chrome's install prompt requires a 192px PNG, and Google's SERP favicon
// rules want a raster that is a multiple of 48 — this is both.
export const dynamic = "force-static";

export function GET() {
  return markPng(192);
}
