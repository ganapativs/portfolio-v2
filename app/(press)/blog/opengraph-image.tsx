import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { published } from "@/lib/posts";

export const alt =
  "Writing by Ganapati V S. Mostly engineering, the occasional library announcement.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Required by `output: "export"` — a metadata image route is a route handler
// underneath, and the export builds only handlers marked static.
export const dynamic = "force-static";

export default async function Image() {
  return renderOG({
    // The sheet's own drawing title — see drawingTitle() in Header.tsx — and
    // the same description the page, the RSS feed and the Blog schema carry.
    // The old card's "notes on the bones of better software" was the one
    // epigram left from the retired press design.
    eyebrow: "revision index",
    title: "Mostly engineering. The occasional library announcement.",
    accent: "bottle",
    dims: [
      { v: `${published.length}`, l: "essays" },
      { v: published[0]?.date ?? "", l: "latest" },
    ],
  });
}
