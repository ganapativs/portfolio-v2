import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Résumé: Ganapati V S, VP Technology at Tracxn.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOG({
    eyebrow: "résumé",
    title: "Engineer turned VP. Eleven years, one place. Printable.",
    accent: "dustblue",
  });
}
