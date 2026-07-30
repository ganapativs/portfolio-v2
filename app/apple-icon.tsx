import { markPng } from "@/lib/icon-png";

// The iOS home-screen tile. iOS composites onto its own rounded rect and does
// not crop the artwork, so this takes the un-inset mark — see lib/icon-png.tsx
// for why /icon-512-maskable takes a smaller one.
export const dynamic = "force-static";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return markPng(size.width);
}
