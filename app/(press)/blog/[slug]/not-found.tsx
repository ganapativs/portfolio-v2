import Link from "next/link";

// No `metadata` export here — Next.js does not resolve metadata from a nested
// not-found.tsx. The noindex for unknown/draft slugs comes from
// generateMetadata in ./page.tsx.

export default function PostNotFound() {
  return (
    <section className="doc-head" data-sec="404">
      <span className="sec-label">Error 404 · revision not on file</span>
      <h1>That essay is not here.</h1>
      <p className="doc-lede">
        The link points to a post that has been renamed, retired, or never made it past the draft.
        The index has everything that is actually published.
      </p>
      <div className="doc-links">
        <Link href="/blog">all writing</Link>
        <Link href="/">home</Link>
      </div>
    </section>
  );
}
