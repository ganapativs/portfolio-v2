import type { MetadataRoute } from "next";

// Required by `output: "export"`.
export const dynamic = "force-static";
import { published } from "@/lib/posts";
import { SITE_URL } from "@/lib/jsonld";

// Hand-maintained content dates — bump a surface's entry when its copy
// meaningfully changes. Deliberately NOT the build date: a lastmod that
// moves on every deploy teaches crawlers to ignore it.
// /about and /work are gone — the home page absorbed both, and
// public/_redirects sends them here. They must not reappear.
const SURFACE_UPDATED: Record<string, string> = {
  // The schematic redesign: the home sheet and the CV were both rewritten,
  // then swept for copy and metadata drift in the pre-ship review.
  "": "2026-08-31",
  "/resume": "2026-08-31",
};

// Relative priority *within this site* — not a claim about the wider web.
// Google says it ignores both this and changeFrequency; Bing and several
// smaller crawlers do not, and stating them correctly costs nothing. The home
// page is the entity page for the whole site, so it leads.
const PRIORITY: Record<string, number> = {
  "": 1,
  "/blog": 0.8,
  "/resume": 0.7,
};

export default function sitemap(): MetadataRoute.Sitemap {
  // The index changed when its newest post landed *or* when the page itself was
  // rewritten, whichever is later. Taking only the post date would have claimed
  // the redesigned index was untouched since July.
  const newestPost = published[0]?.updated ?? published[0]?.date ?? SURFACE_UPDATED[""];
  const surfaceDates: Record<string, string> = {
    ...SURFACE_UPDATED,
    "/blog": newestPost > SURFACE_UPDATED[""] ? newestPost : SURFACE_UPDATED[""],
  };
  const surfaces = Object.entries(surfaceDates).map(([path, date]) => ({
    // No trailing slash on root. Every other surface that names the home page
    // names it without one: the canonical, og:url, Person.url, WebSite.url and
    // ProfilePage's @id are all `https://meetguns.com`. The sitemap was the
    // only place emitting `https://meetguns.com/`, which is a second URL for
    // the same page as far as a crawler is concerned.
    url: `${SITE_URL}${path}`,
    lastModified: new Date(date),
    changeFrequency: (path === "/blog" ? "weekly" : "monthly") as "weekly" | "monthly",
    priority: PRIORITY[path] ?? 0.5,
  }));
  const posts = published.map((p) => {
    const entry: MetadataRoute.Sitemap[number] = {
      url: `${SITE_URL}/blog/${p.slug}`,
      lastModified: new Date(p.updated ?? p.date),
      changeFrequency: "yearly",
      priority: 0.6,
    };
    // The cover is the only stable public image URL a post has — the per-route
    // OG card lives behind a hashed metadata segment with no fixed path.
    // Declaring it here is what puts the artwork into Google Images next to
    // the post rather than leaving it to be discovered by crawl.
    if (p.cover) entry.images = [`${SITE_URL}/posts/${p.slug}/${p.cover}`];
    return entry;
  });
  return [...surfaces, ...posts];
}
