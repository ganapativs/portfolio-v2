import { ViewTransition } from "react";
import { Dock } from "@/components/press/Dock";

/**
 * The press shell. Everything the reader sees lives in here. It is a route
 * group rather than a segment so it can own the chrome without owning a URL.
 */
export default function PressLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to the work
      </a>
      <span className="reg-mark" data-side="left" aria-hidden="true" />
      <span className="reg-mark" data-side="right" aria-hidden="true" />
      <main id="main-content">
        <ViewTransition name="route">{children}</ViewTransition>
      </main>
      <Dock />
    </>
  );
}
