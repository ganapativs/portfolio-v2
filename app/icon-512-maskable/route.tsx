import { markPng } from "@/lib/icon-png";

// The adaptive-icon cut: same mark, drawn small enough to survive Android
// cropping it to a circle, a squircle or a teardrop. A separate route rather
// than a second `purpose` on /icon-512, because a maskable icon that reuses
// the un-inset artwork gets its edges shaved off.
export const dynamic = "force-static";

export function GET() {
  return markPng(512, { maskable: true });
}
