import type { AnalyticsAdapter, AnalyticsEvent } from "./types";

const adapters: AnalyticsAdapter[] = [];

export function registerAdapter(adapter: AnalyticsAdapter): void {
  if (adapters.includes(adapter)) return;
  adapters.push(adapter);
}

/**
 * Fire an event at every registered adapter.
 *
 * With no adapter registered this is a no-op, which is the whole point: the
 * call sites are unconditional, and whether anything is reported is decided
 * once, in <Analytics/>. An adapter that throws must never reach the caller —
 * a broken beacon is not worth a broken click handler.
 */
export function track(event: AnalyticsEvent): void {
  for (const adapter of adapters) {
    try {
      adapter.track(event);
    } catch {
      /* no-op — analytics must never throw into user-land */
    }
  }
}
