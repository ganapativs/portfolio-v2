"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// GA4 measurement ID for the meetguns.com web stream. Public by design —
// it ships in the page source of every GA-instrumented site.
const GA_ID = "G-Y6DEM2T3N5";

// Production-only, same as WebVitals — keeps `pnpm dev` traffic out of the
// real property. To smoke-test locally: `pnpm build && pnpm start`.
const ENABLED = process.env.NODE_ENV === "production";

/**
 * GA4 via gtag.js. Auto page_view is disabled so the App Router client
 * navigations are the single source of pageviews — no double counting
 * between the initial config call and enhanced measurement.
 */
export function Analytics() {
  const pathname = usePathname();
  const enabled = ENABLED;
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled || !pathname || lastPath.current === pathname) return;
    lastPath.current = pathname;
    try {
      window.gtag?.("event", "page_view", {
        page_path: pathname + window.location.search,
        page_location: window.location.href,
        page_title: document.title,
      });
    } catch {
      /* no-op — analytics must never throw into user-land */
    }
  }, [enabled, pathname]);

  if (!enabled) return null;

  return (
    <>
      <Script
        id="ga-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});`}
      </Script>
    </>
  );
}
