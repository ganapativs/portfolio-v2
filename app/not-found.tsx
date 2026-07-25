import Link from "next/link";
import { Pill } from "@/components/primitives/Pill";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="surface">
      <div className="container-narrow">
        <div className="surface-pill">
          <Pill>404</Pill>
        </div>
        <h1 className="surface-h1 tall">
          You&apos;ve wandered{" "}
          <span className="flourish" style={{ fontSize: "0.95em" }}>
            off-trail.
          </span>
        </h1>
        <div className="surface-body">
          <p className="first">Page moved, never existed, or hasn&apos;t been written yet.</p>
        </div>
        <div
          style={{ marginTop: "var(--s-6)", display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}
        >
          <Link href="/" className="btn primary">
            Back home
          </Link>
          <Link href="/blog" className="btn ghost">
            Read something
          </Link>
        </div>
      </div>
    </div>
  );
}
