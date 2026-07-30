"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { debugAdapter, gaAdapter, registerAdapter, track } from "@/lib/analytics";
import { GA_ID, GA_ENABLED } from "@/lib/analytics/ga-id";

/**
 * GA4 via gtag.js, plus the delegated click capture.
 *
 * Two things are deliberate here:
 *
 * 1. **The gtag stub is in the document head, not in this component.** See
 *    app/layout.tsx. `gtag()` therefore exists before the first paint and
 *    queues onto dataLayer, so an event fired by a click that happens before
 *    the 155 kB library has loaded is kept rather than dropped. That is what
 *    lets the library itself load late without costing us events.
 * 2. **Auto page_view is off** (`send_page_view:false` in the stub). The App
 *    Router's client navigations are the single source of pageviews, fired
 *    below — no double counting between the config call and a client nav.
 */
export function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  // One adapter, chosen once. In development that is the console, so every
  // track() call is verifiable without a deploy.
  useEffect(() => {
    registerAdapter(GA_ENABLED ? gaAdapter : debugAdapter);
  }, []);

  useEffect(() => {
    if (!GA_ENABLED || !pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    try {
      // location.search rather than useSearchParams: reading the hook here
      // would force a Suspense boundary and opt every page out of static
      // prerendering, and this site has no query-param routes to track.
      window.gtag?.("event", "page_view", {
        page_path: pathname + window.location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    } catch {
      /* no-op — analytics must never throw into user-land */
    }
  }, [pathname]);

  return (
    <>
      <ClickCapture />
      {GA_ENABLED && (
        <Script
          id="ga-src"
          // lazyOnload, not afterInteractive. `afterInteractive` makes Next
          // emit a high-priority <link rel="preload" as="script"> for a 155 kB
          // library, which then races the masthead's own font for bandwidth
          // and pushes LCP out. Nothing is lost by waiting: the head stub has
          // already defined gtag(), so the pageview and any click before this
          // lands are sitting on dataLayer and flush the moment it does.
          strategy="lazyOnload"
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        />
      )}
    </>
  );
}

/** Schemes that never leave the page in a way worth reporting as an outbound. */
function isSkippableHref(href: string): boolean {
  return href.startsWith("#") || href.startsWith("javascript:");
}

function labelOf(el: Element): string | undefined {
  return (
    el.getAttribute("aria-label")?.trim() ||
    el.textContent?.replace(/\s+/g, " ").trim().slice(0, 80) ||
    undefined
  );
}

/**
 * One listener on the document, rather than an onClick on every control.
 *
 * A control opts in by carrying `data-analytics="<kind>:<id>"`, where kind is
 * one of nav | cta | feed | mail. Anything that leaves the origin is reported
 * as an outbound whether or not it opted in, and a bare `mailto:` is reported
 * as a contact. Nothing else fires — this does not log every click on the page.
 */
function ClickCapture() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;

      const declared = target.closest("[data-analytics]");
      const anchor = target.closest("a[href]");

      let handledAsMail = false;
      const spec = declared?.getAttribute("data-analytics");
      if (spec) {
        const sep = spec.indexOf(":");
        const kind = sep === -1 ? spec : spec.slice(0, sep);
        const id = sep === -1 ? "" : spec.slice(sep + 1);
        const href = declared?.getAttribute("href") ?? undefined;
        switch (kind) {
          case "nav":
            track({ name: "nav", id, href: href ?? "" });
            break;
          case "cta":
            track({ name: "cta", id, href });
            break;
          case "feed":
            if (id === "rss" || id === "llms" || id === "markdown")
              track({ name: "feed", kind: id });
            break;
          case "mail":
            track({ name: "mail", id });
            handledAsMail = true;
            break;
        }
      }

      if (!anchor) return;
      const raw = anchor.getAttribute("href");
      if (!raw || isSkippableHref(raw)) return;

      if (raw.startsWith("mailto:")) {
        if (!handledAsMail) track({ name: "mail", id: raw.slice(7).split("?")[0] });
        return;
      }
      if (raw.startsWith("tel:")) return;

      let url: URL;
      try {
        url = new URL(raw, window.location.href);
      } catch {
        return;
      }
      // Same-origin navigation is already a page_view; only report the leaves.
      if (url.origin === window.location.origin) return;
      track({ name: "outbound", url: url.href, label: labelOf(anchor) });
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
