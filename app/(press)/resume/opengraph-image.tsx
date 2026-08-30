import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { CAREER_YEARS } from "@/lib/resume";

export const alt = "Résumé: Ganapati V S, VP Technology at Tracxn.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOG({
    eyebrow: "résumé",
    title: `${CAREER_YEARS} years, one company since 2015. Printable.`,
    accent: "dustblue",
  });
}
