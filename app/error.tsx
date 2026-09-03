"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Sheet } from "@/components/schematic/Sheet";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Sheet>
      <main id="main-content" className="doc-head" data-sec="error">
        <span className="sec-label">Error</span>
        <h1>Something broke.</h1>
        <p className="doc-lede">
          Part of this page failed to render. Trying again usually fixes it.
        </p>
        {error?.digest ? <p className="meta">digest: {error.digest}</p> : null}
        <div className="doc-links">
          <button type="button" onClick={() => unstable_retry()}>
            try again
          </button>
          <Link href="/" data-analytics="nav:error.home">
            home
          </Link>
          <Link href="/blog" data-analytics="nav:error.writing">
            writing
          </Link>
        </div>
      </main>
    </Sheet>
  );
}
