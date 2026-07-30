import Link from "next/link";
import { SiteHeader } from "@/components/press/SiteHeader";
import { PressFooter } from "@/components/press/PressFooter";
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

// Explicit UTC: the dates are date-only strings, which parse as UTC midnight.
// Formatting them in a negative-offset zone would render the previous day and
// disagree with the server render.
const DATE = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

export default function WritingPage() {
  return (
    <div className="doc">
      <JsonLd data={[blogIndexSchema(published), routeBreadcrumb("Writing", "/blog")]} />
      <SiteHeader />

      <div className="wrap wrap-doc doc-main">
        <h1 className="page-h1">Writing</h1>
        <p className="page-lede">
          Mostly engineering. The occasional library announcement. New posts arrive when there is
          something worth saying — not on a schedule.
        </p>

        <div className="entries">
          {published.map((p) => (
            <Link
              key={p.slug}
              className="entry"
              href={`/blog/${p.slug}`}
              data-analytics={`nav:blog.entry.${p.slug}`}
            >
              <div className="entry-head">
                <h2 className="entry-title">{p.title}</h2>
                <span className="entry-meta">
                  <time dateTime={p.date}>{DATE.format(new Date(p.date))}</time>
                  <span aria-hidden="true">·</span>
                  <span>{p.read}</span>
                </span>
              </div>
              <p className="entry-sub">{p.spoiler}</p>
            </Link>
          ))}

          <div className="entries-foot">
            {/* RSS is a static asset, not a Next.js page route. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/rss.xml" data-analytics="feed:rss">
              RSS
            </a>
            {/* Route handlers, not pages — next/link would 404 on prefetch. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a href="/llms.txt" data-analytics="feed:llms">
              llms.txt
            </a>
          </div>
        </div>
      </div>

      <PressFooter width="wrap-doc" />
    </div>
  );
}
