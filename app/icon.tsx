import { INK_HEX } from "@/lib/ink";

export const size = { width: 32, height: 32 };
export const contentType = "image/svg+xml";

const G_PATH =
  "M99.95,111.65L100.7,64.7l-19.5.15L98.3,18.5c-5.25-1.35-13.2-4.05-25.8-5.1C38.15,13.85,18.65,35.75,17,66.35c0.75,16.8,3.9,29.4,13.65,38.55,12.15,11.25,25.65,13.65,40.5,13.65l28.8-.15v-6.75ZM30.5,66.35C30.95,35.9,54.05,22.4,80.9,25.55l-28.2,78C39.65,97.55,30.05,83.75,30.5,66.35Zm45.3,7.8H88.25L87.8,106.4c-4.05,0-15.3.45-22.95,0.45Z";
const BAR_PATH = "M16.7,133.015h84v12h-84v-12Z";

export default function Icon() {
  const isProd = process.env.NODE_ENV === "production";
  // Live ink, on light paper — the tab strip is a light surface everywhere.
  // Sage in development so a dev tab is tellable from a real one at a glance.
  const accent = INK_HEX[isProd ? "terracotta" : "sage"];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 84 131.615" fill="${accent}"><g transform="translate(-16.7 -13.39998)"><path d="${G_PATH}"/><path d="${BAR_PATH}"/></g></svg>`;
  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": isProd ? "public, max-age=86400, must-revalidate" : "no-store",
    },
  });
}
