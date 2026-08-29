import { ViewTransition } from "react";
import { Sheet } from "@/components/schematic/Sheet";

/**
 * Everything the reader sees is drawn on the sheet. A route group rather than a
 * segment, so it can own the drawing without owning a URL.
 */
export default function SheetLayout({ children }: { children: React.ReactNode }) {
  return (
    <Sheet>
      <main id="main-content">
        <ViewTransition name="route">{children}</ViewTransition>
      </main>
    </Sheet>
  );
}
