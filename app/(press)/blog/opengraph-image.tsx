import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Writing: notes on the bones of better software.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Required by `output: "export"` — a metadata image route is a route handler
// underneath, and the export builds only handlers marked static.
export const dynamic = "force-static";

export default async function Image() {
  return renderOG({
    eyebrow: "no. 04 · writing",
    title: "Notes on the bones of better software.",
    accent: "bottle",
  });
}
