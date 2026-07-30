"use client";
import Link from "next/link";
import { useEffect } from "react";
import { SiteHeader } from "@/components/press/SiteHeader";
import { PressFooter } from "@/components/press/PressFooter";

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
    <div className="doc">
      <SiteHeader />
      <main className="wrap wrap-doc doc-main">
        <div className="cv-stamp">Press jam</div>
        <h1 className="page-h1" style={{ marginTop: "12px" }}>
          Something broke.
        </h1>
        <p className="page-lede">
          Not your fault — a piece of this site tripped on its own shoelaces.
        </p>
        {error?.digest ? <p className="cv-stamp">digest: {error.digest}</p> : null}
        <div className="cv-topline" style={{ marginTop: "clamp(28px, 4vh, 40px)" }}>
          <button type="button" className="cv-print" onClick={() => unstable_retry()}>
            Try again
          </button>
        </div>
        <div className="entries-foot">
          <Link href="/">Home</Link>
          <Link href="/blog">Writing</Link>
        </div>
      </main>
      <PressFooter width="wrap-doc" />
    </div>
  );
}
