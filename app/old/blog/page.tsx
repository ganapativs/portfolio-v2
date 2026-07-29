import { Pill } from "@/components/primitives/Pill";
import { AmbientBlob } from "@/components/primitives/AmbientBlob";
import { PostCard, ordinalLabel } from "@/components/sections";
import { published } from "@/lib/posts";
import { blogIndexSchema, JsonLd, routeBreadcrumb } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Writing",
  path: "/blog",
  description:
    "Notes on the bones of better software — engineering, libraries, the occasional deep dive. New posts arrive when there's something worth saying.",
  alternates: {
    types: { "application/rss+xml": [{ url: "/rss.xml", title: "meetguns blog" }] },
  },
});

export default function WritingPage() {
  return (
    <div className="surface">
      <AmbientBlob />
      <JsonLd data={[blogIndexSchema(published), routeBreadcrumb("Writing", "/blog")]} />
      <div className="container-narrow">
        <div className="surface-pill">
          <Pill>writing · /blog</Pill>
        </div>
        <h1 className="surface-h1">
          Notes on the <span className="flourish">bones</span> of
          <br />
          better software.
        </h1>
        <p className="lede surface-lede">
          Mostly engineering. The occasional library announcement. New posts arrive when
          there&apos;s something worth saying — not on a schedule.
        </p>

        <div className="post-grid post-grid-3">
          {published.map((p, i) => (
            <PostCard
              key={p.slug}
              accent={p.accent}
              n={ordinalLabel(i)}
              tag={p.tag}
              read={p.read}
              title={p.title}
              sub={p.spoiler}
              href={`/old/blog/${p.slug}`}
            />
          ))}
        </div>

        <p className="flourish-aside">
          — feed: {/* RSS feed is a static asset, not a Next.js page route. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a className="ulink" href="/rss.xml">
            /rss.xml
          </a>
        </p>
      </div>
    </div>
  );
}
