import Link from "next/link";
import { published } from "@/lib/posts";
import { blogIndexSchema, JsonLd, routeBreadcrumb } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Writing",
  path: "/blog",
  description: "Engineering notes, mostly frontend, with the occasional library announcement.",
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
          Engineering notes, mostly frontend, with the occasional library announcement. No schedule.
        </p>
      </section>

      {/* Same ruled table as the parts list on the home sheet, because it is the
          same kind of object: a numbered index of things that exist. */}
      <section className="panel" id="index" data-sec="index">
        {/* No section label. The drawing title above already says "revision
            index" and the h1 already says "Writing"; a third heading for four
            rows is furniture. */}
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
                <h2 className="entry-title">{p.title}</h2>
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
