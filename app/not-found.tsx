import type { Metadata } from "next";
import Link from "next/link";
import { Sheet } from "@/components/schematic/Sheet";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

// The global 404 is rendered by the root layout, outside the (press) group, so
// it brings its own sheet.
export default function NotFound() {
  return (
    <Sheet>
      <main id="main-content" className="doc-head" data-sec="404">
        <span className="sec-label">Error 404 · sheet not in the set</span>
        <h1>Nothing is set on this sheet.</h1>
        <p className="doc-lede">
          The page moved, never existed, or has not been drawn yet. Everything that does exist is
          one of these.
        </p>
        <div className="doc-links">
          <Link href="/">home</Link>
          <Link href="/blog">writing</Link>
          <Link href="/resume">résumé</Link>
        </div>
      </main>
    </Sheet>
  );
}
