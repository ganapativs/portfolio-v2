import Link from "next/link";
import { SiteHeader } from "@/components/press/SiteHeader";
import { PressFooter } from "@/components/press/PressFooter";

// No `metadata` export here — Next.js does not resolve metadata from a nested
// not-found.tsx. The noindex for unknown/draft slugs comes from
// generateMetadata in ./page.tsx.

export default function PostNotFound() {
  return (
    <div className="doc">
      <SiteHeader />
      <div className="wrap wrap-essay doc-main">
        <div className="cv-stamp">Error 404 · post</div>
        <h1 className="page-h1" style={{ marginTop: "12px" }}>
          That essay isn&apos;t here.
        </h1>
        <p className="page-lede">
          The link points to a post that has been renamed, retired, or never made it past the draft.
          The writing index has everything that is actually published.
        </p>
        <div className="entries-foot" style={{ marginTop: "clamp(32px, 5vh, 48px)" }}>
          <Link href="/blog">All writing</Link>
          <Link href="/">Home</Link>
        </div>
      </div>
      <PressFooter width="wrap-essay" />
    </div>
  );
}
