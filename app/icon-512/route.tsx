import { markPng } from "@/lib/icon-png";

// The splash-screen / high-DPI size. Required alongside 192 for installability.
export const dynamic = "force-static";

export function GET() {
  return markPng(512);
}
