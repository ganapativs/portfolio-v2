import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { CAREER_YEARS, identity, STARS_ROUNDED } from "@/lib/resume";

export const alt = `Résumé: ${identity.name}, ${identity.jobTitle} at ${identity.worksFor.name}.`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Required by `output: "export"` — a metadata image route is a route handler
// underneath, and the export builds only handlers marked static.
export const dynamic = "force-static";

export default async function Image() {
  return renderOG({
    eyebrow: "specification sheet",
    title: `${CAREER_YEARS} years, one company since 2015. Printable.`,
    accent: "bottle",
    // No years chip — the title already carries the 13.
    dims: [
      { v: "4", l: "promotions" },
      { v: "5", l: "titles" },
      { v: STARS_ROUNDED, l: "stars" },
    ],
  });
}
