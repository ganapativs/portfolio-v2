import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Writing: notes on the bones of better software.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOG({
    eyebrow: "no. 04 · writing",
    title: "Notes on the bones of better software.",
    accent: "dustblue",
  });
}
