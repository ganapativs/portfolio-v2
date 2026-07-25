"use client";

import { useReportWebVitals } from "next/web-vitals";

const ENDPOINT = "/api/vitals";

function report(metric: Parameters<Parameters<typeof useReportWebVitals>[0]>[0]) {
  if (process.env.NODE_ENV !== "production") {
    console.debug("[web-vitals]", metric.name, Math.round(metric.value), metric.rating);
    return;
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
    /* no-op — never let a vitals beacon throw into user-land */
  }
}

export function WebVitals() {
  useReportWebVitals(report);
  return null;
}
