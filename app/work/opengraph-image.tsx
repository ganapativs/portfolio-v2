import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Work — a decade of code, told in seven case studies.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOG({
    eyebrow: "work · 2014 — 2026",
    title: "A decade of code, told in seven case studies.",
    accent: "sage",
  });
}
