import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { CAREER_YEARS } from "@/lib/resume";

export const alt = "Ganapati V S, full-stack engineer with a design mind, in Bengaluru.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Required by `output: "export"` — a metadata image route is a route handler
// underneath, and the export builds only handlers marked static.
export const dynamic = "force-static";

export default async function Image() {
  return renderOG({
    eyebrow: "no. 01 · the masthead",
    title: `${CAREER_YEARS} years of shipping. Still writing code.`,
    accent: "dustblue",
  });
}
