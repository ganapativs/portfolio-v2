import type { MetadataRoute } from "next";
import { published } from "@/lib/posts";
import { SITE_URL } from "@/lib/jsonld";

// Hand-maintained content dates — bump a surface's entry when its copy
// meaningfully changes. Deliberately NOT the build date: a lastmod that
// moves on every deploy teaches crawlers to ignore it.
// /about and /work are gone — the press homepage absorbed both, and
// next.config.ts redirects them. They must not reappear here.
const SURFACE_UPDATED: Record<string, string> = {
  "": "2026-07-29",
  "/resume": "2026-07-29",
};

export default function sitemap(): MetadataRoute.Sitemap {
  const surfaceDates: Record<string, string> = {
    ...SURFACE_UPDATED,
    "/blog": published[0]?.date ?? SURFACE_UPDATED[""],
  };
  const surfaces = Object.entries(surfaceDates).map(([path, date]) => ({
    // Root serves at "/", so emit the trailing slash there to match.
    url: path === "" ? `${SITE_URL}/` : `${SITE_URL}${path}`,
    lastModified: new Date(date),
  }));
  const posts = published.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.updated ?? p.date),
  }));
  return [...surfaces, ...posts];
}
