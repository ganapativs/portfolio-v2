"use client";

import { useReportWebVitals } from "next/web-vitals";
import { GA_ENABLED } from "@/lib/analytics/ga-id";

const ENDPOINT = "/api/vitals";

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
  try {
    const body = JSON.stringify({
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      path: window.location.pathname,
    });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "application/json" }));
    } else {
      fetch(ENDPOINT, {
        body,
        method: "POST",
        keepalive: true,
        headers: { "content-type": "application/json" },
      });
    }
  } catch {
    /* no-op */
  }
}

export function WebVitals() {
  useReportWebVitals(report);
  return null;
}
