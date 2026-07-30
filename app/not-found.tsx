import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/press/SiteHeader";
import { PressFooter } from "@/components/press/PressFooter";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

// The global 404 is rendered by the root layout, outside the press shell, so it
// brings its own chrome.
export default function NotFound() {
  return (
    <div className="doc">
      <SiteHeader />
      <main className="wrap wrap-doc doc-main">
        <div className="cv-stamp">Error 404</div>
        <h1 className="page-h1" style={{ marginTop: "12px" }}>
          Nothing set on this sheet.
        </h1>
        <p className="page-lede">The page moved, never existed, or hasn&apos;t been written yet.</p>
        <div className="entries-foot" style={{ marginTop: "clamp(32px, 5vh, 48px)" }}>
          <Link href="/">Home</Link>
          <Link href="/blog">Writing</Link>
          <Link href="/resume">Résumé</Link>
        </div>
      </main>
      <PressFooter width="wrap-doc" />
    </div>
  );
}
