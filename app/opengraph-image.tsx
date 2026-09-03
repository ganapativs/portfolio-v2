import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { CAREER_YEARS, PUBLIC_WORK, STARS_ROUNDED } from "@/lib/resume";

export const alt = "Ganapati V S, full-stack engineer with a design mind, in Bengaluru.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Required by `output: "export"` — a metadata image route is a route handler
// underneath, and the export builds only handlers marked static.
export const dynamic = "force-static";

export default async function Image() {
  return renderOG({
    // The sheet's own drawing title — see drawingTitle() in Header.tsx. The
    // old "no. 01 · the masthead" was the retired press design's numbering.
    eyebrow: "meetguns.com",
    title: `${CAREER_YEARS} years of shipping. Still writing code.`,
    accent: "dustblue",
    // No years chip — the title already carries the 13.
    dims: [
      { v: STARS_ROUNDED, l: "stars" },
      { v: `${PUBLIC_WORK.repos}`, l: "repos" },
      { v: `${PUBLIC_WORK.npm}`, l: "npm pkgs" },
    ],
  });
}
