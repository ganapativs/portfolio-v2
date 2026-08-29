import Link from "next/link";
import { published } from "@/lib/posts";
import { blogIndexSchema, JsonLd, routeBreadcrumb } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Writing",
  path: "/blog",
  description:
    "Notes on the bones of better software: engineering, libraries, the occasional deep dive. New posts arrive when there is something worth saying.",
  alternates: {
    types: { "application/rss+xml": [{ url: "/rss.xml", title: "meetguns blog" }] },
  },
});

// Explicit UTC: the dates are date-only strings, which parse as UTC midnight.
// Formatting them in a negative-offset zone would render the previous day and
// disagree with the server render.
const DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" });

export default function WritingPage() {
  return (
    <>
      <JsonLd data={[blogIndexSchema(published), routeBreadcrumb("Writing", "/blog")]} />

      <section className="doc-head" id="writing" data-sec="writing">
        <h1>Writing</h1>
        <p className="doc-lede">
          Mostly engineering. The occasional library announcement. New posts arrive when there is
          something worth saying, not on a schedule.
        </p>
      </section>

      {/* Same ruled table as the parts list on the home sheet, because it is the
          same kind of object: a numbered index of things that exist. */}
      <section className="panel" id="index" data-sec="index">
        <span className="sec-label">Revision index</span>
        <p className="meta">
          {published.length} entries · newest first ·{" "}
          {/* Route handlers, not pages — next/link would 404 on prefetch. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/rss.xml" data-analytics="feed:rss">
            RSS
          </a>{" "}
          · {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/llms.txt" data-analytics="feed:llms">
            llms.txt
          </a>
        </p>

        <div className="entries">
          {published.map((p, i) => (
            <Link
              key={p.slug}
              className="entry"
              href={`/blog/${p.slug}`}
              data-analytics={`nav:blog.entry.${p.slug}`}
            >
              <span className="entry-no">{String(i + 1).padStart(3, "0")}</span>
              <span className="entry-main">
                <span className="entry-title">{p.title}</span>
                <span className="entry-sub">{p.spoiler}</span>
              </span>
              <span className="entry-meta">
                <time dateTime={p.date}>{DATE.format(new Date(p.date))}</time>
                <span>{p.read}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
