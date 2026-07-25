import Link from "next/link";
import { Pill } from "@/components/primitives/Pill";

// No `metadata` export here — Next.js does not resolve metadata from a nested
// not-found.tsx. The noindex for unknown/draft slugs comes from
// generateMetadata in ./page.tsx.

export default function PostNotFound() {
  return (
    <div className="surface">
      <div className="container-narrow">
        <div className="surface-pill">
          <Pill>404 · post</Pill>
        </div>
        <h1 className="surface-h1 tall">
          That essay isn&apos;t{" "}
          <span className="flourish" style={{ fontSize: "0.95em" }}>
            here.
          </span>
        </h1>
        <div className="surface-body">
          <p className="first">
            The link you followed points to a post that&apos;s either been renamed, retired, or
            never made it past the draft.
          </p>
          <p>
            The{" "}
            <Link href="/blog" className="ulink">
              writing index
            </Link>{" "}
            has everything that&apos;s actually published.
          </p>
        </div>
        <div
          style={{ marginTop: "var(--s-6)", display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}
        >
          <Link href="/blog" className="btn primary">
            All writing
          </Link>
          <Link href="/" className="btn ghost">
            Or head home
          </Link>
        </div>
      </div>
    </div>
  );
}
