import type { AnalyticsAdapter, AnalyticsEvent } from "../types";

/**
 * Development sink. GA is production-only, which would otherwise leave every
 * `track()` call unverifiable until a deploy — so in `pnpm dev` the events go
 * to the console instead, in the same shape they would reach GA in.
 */
export const debugAdapter: AnalyticsAdapter = {
  track(event: AnalyticsEvent) {
    const { name, ...params } = event;
    console.debug("[analytics]", name, params);
  },
};
