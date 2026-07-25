"use client";
import Link from "next/link";
import { useEffect } from "react";
import { Pill } from "@/components/primitives/Pill";

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
    <div className="surface">
      <div className="container-narrow">
        <div className="surface-pill">
          <Pill>error</Pill>
        </div>
        <h1 className="surface-h1 tall">
          Something{" "}
          <span className="flourish" style={{ fontSize: "0.95em" }}>
            broke.
          </span>
        </h1>
        <div className="surface-body">
          <p className="first">
            Not your fault — a piece of this site tripped on its own shoelaces.
          </p>
          {error?.digest ? (
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--t-caption)",
                color: "var(--fg-3)",
              }}
            >
              digest: {error.digest}
            </p>
          ) : null}
        </div>
        <div
          style={{ marginTop: "var(--s-6)", display: "flex", gap: "var(--s-3)", flexWrap: "wrap" }}
        >
          <button type="button" className="btn primary" onClick={() => unstable_retry()}>
            Try again
          </button>
          <Link href="/" className="btn ghost">
            Or head home
          </Link>
        </div>
      </div>
    </div>
  );
}
