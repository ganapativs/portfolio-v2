import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "About — a decade in one place. Building, shipping, growing the team.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOG({
    eyebrow: "about",
    title: "A decade in one place. Building, shipping, growing the team.",
    accent: "saffron",
  });
}
