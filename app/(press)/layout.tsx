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
        {/* `default` is the view-transition-class base.css targets. React
            names each routed child `route_N`, so a selector on the name
            `route` matched nothing and the browser's own crossfade ran. */}
        <ViewTransition name="route" default="vt-route">
          {children}
        </ViewTransition>
      </main>
    </Sheet>
  );
}
