import { statSync } from "node:fs";
import { join } from "node:path";
import { published } from "@/lib/posts";
import { identity } from "@/lib/resume";
import { SITE_URL } from "@/lib/jsonld";

export const dynamic = "force-static";

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const IMAGE_TYPES: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  avif: "image/avif",
};

// RSS 2.0 requires `length` on <enclosure>. This route is force-static, so
// the stat runs at build time against the real file in public/.
function enclosureFor(slug: string, cover: string): string {
  const ext = cover.split(".").pop()?.toLowerCase() ?? "";
  const type = IMAGE_TYPES[ext];
  if (!type) return "";
  try {
    const { size } = statSync(join(process.cwd(), "public", "posts", slug, cover));
    return `\n      <enclosure url="${SITE_URL}/posts/${slug}/${cover}" length="${size}" type="${type}" />`;
  } catch {
    return "";
  }
}

export async function GET() {
  // `published` is newest-first. lastBuildDate moves when a post is revised;
  // the channel pubDate is when the newest post was published, which is not the
  // same date and is what a reader sorts a subscription list by.
  const newest = published[0]?.date ?? new Date().toISOString();
  const latest = published[0]?.updated ?? newest;
  const items = published
    .map((p) => {
      const link = `${SITE_URL}/blog/${p.slug}`;
      const enclosure = p.cover ? enclosureFor(p.slug, p.cover) : "";
      return `
    <item>
      <title>${escape(p.title)}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${new Date(p.date).toUTCString()}</pubDate>
      <author>${escape(identity.email)} (${escape(identity.name)})</author>
      <dc:creator>${escape(identity.name)}</dc:creator>
      <category>${escape(p.tag)}</category>
      <description>${escape(p.spoiler)}</description>${enclosure}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escape(identity.name)} · meetguns</title>
    <link>${SITE_URL}</link>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>
    <description>Mostly engineering. The occasional library announcement. Writing by ${escape(identity.name)}.</description>
    <language>en</language>
    <copyright>Copyright ${new Date(latest).getUTCFullYear()} ${escape(identity.name)}</copyright>
    <lastBuildDate>${new Date(latest).toUTCString()}</lastBuildDate>
    <pubDate>${new Date(newest).toUTCString()}</pubDate>
    <managingEditor>${escape(identity.email)} (${escape(identity.name)})</managingEditor>
    <webMaster>${escape(identity.email)} (${escape(identity.name)})</webMaster>
    <docs>https://www.rssboard.org/rss-specification</docs>
    <generator>Next.js</generator>
    <ttl>1440</ttl>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
