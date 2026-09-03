// oxlint-disable next/no-html-link-for-pages -- deliberate: see the note
// on NotFound below. A <Link> here drags the whole home page onto a 404.
import type { Metadata } from "next";
import { Sheet } from "@/components/schematic/Sheet";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

// The global 404 is rendered by the root layout, outside the (press) group, so
// it brings its own sheet.
//
// The three ways out are plain anchors, not <Link>s, and that is worth 57 kB
// gzip. `next/link`'s module resolves to the home page's chunk group in this
// route's client-reference manifest, so referencing it here made a 404 download
// and execute the entire home page -- the figures, the chart library, the
// syntax highlighter -- to render three words of navigation. A 404 is a dead
// end a reader is leaving; prefetching three routes from it buys nothing, and
// a full page load out of a broken URL is the honest cost.
export default function NotFound() {
  return (
    <Sheet>
      <main id="main-content" className="doc-head" data-sec="404">
        <span className="sec-label">Error 404</span>
        <h1>Page not found.</h1>
        <p className="doc-lede">It moved or never existed. Try one of these.</p>
        <div className="doc-links">
          <a href="/" data-analytics="nav:404.home">
            home
          </a>
          <a href="/blog" data-analytics="nav:404.writing">
            writing
          </a>
          <a href="/resume" data-analytics="nav:404.resume">
            résumé
          </a>
        </div>
      </main>
    </Sheet>
  );
}
