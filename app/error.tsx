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
        <span className="sec-label">Fault · this sheet did not draw</span>
        <h1>Something broke.</h1>
        <p className="doc-lede">
          Not your fault: a part of this drawing tripped on its own construction lines.
        </p>
        {error?.digest ? <p className="meta">digest: {error.digest}</p> : null}
        <div className="doc-links">
          <button type="button" onClick={() => unstable_retry()}>
            draw it again
          </button>
          <Link href="/">home</Link>
          <Link href="/blog">writing</Link>
        </div>
      </main>
    </Sheet>
  );
}
