"use client";

import { useReportWebVitals } from "next/web-vitals";
import { GA_ENABLED } from "@/lib/analytics/ga-id";

type Metric = Parameters<Parameters<typeof useReportWebVitals>[0]>[0];

/**
 * Field vitals into GA4, in the shape Google's own web-vitals recipe uses: one
 * event per metric carrying an integer `value`, plus the id and rating so a
 * report can slice p75 by page and by good / needs-improvement / poor.
 *
 * CLS is unitless and tiny, so it is scaled by 1000 — GA4 rounds `value` to an
 * integer and an unscaled CLS would arrive as 0 on every single hit.
 */
function toGA(metric: Metric) {
  window.gtag?.("event", metric.name, {
    value: Math.round(metric.name === "CLS" ? metric.value * 1000 : metric.value),
    metric_id: metric.id,
    metric_value: metric.value,
    metric_rating: metric.rating,
    metric_delta: metric.delta,
    metric_navigation_type: metric.navigationType,
    page_path: window.location.pathname,
    non_interaction: true,
  });
}

// GA4 is the only sink. There used to be a second POST to /api/vitals carrying
// the identical payload; the static export has no server to receive it, and it
// never held anything GA4 wasn't already given.
function report(metric: Metric) {
  if (!GA_ENABLED) {
    console.debug("[web-vitals]", metric.name, Math.round(metric.value), metric.rating);
    return;
  }
  try {
    toGA(metric);
  } catch {
    /* no-op — never let a vitals beacon throw into user-land */
  }
}

export function WebVitals() {
  useReportWebVitals(report);
  return null;
}
