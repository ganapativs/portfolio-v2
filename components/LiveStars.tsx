"use client";

import { useEffect, useState } from "react";
import { fetchStarCounts, STAR_FLOOR, type StarCounts } from "@/lib/stars";

/**
 * The runtime half of the star counts. The build bakes real numbers into the
 * prerendered HTML (`getStars()` in `lib/github.ts`), so crawlers and the first
 * paint always carry a value; these components then refetch on mount and swap
 * in the current one, so a page served from a month-old deploy still shows
 * today's count. Fail-open by design: no fetch, a failed fetch, or a missing
 * repo all leave the build-time number exactly as rendered.
 *
 * One fetch per page load at most, shared through a module promise, and cached
 * in localStorage for 6 h so a browsing session costs a single API call.
 */

const CACHE_KEY = "mg_stars";
const TTL_MS = 6 * 60 * 60 * 1000;

let pending: Promise<StarCounts | null> | null = null;

function liveCounts(): Promise<StarCounts | null> {
  pending ??= (async () => {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (raw) {
        const cached = JSON.parse(raw) as { t: number; c: StarCounts };
        if (Date.now() - cached.t < TTL_MS && cached.c?.byRepo) return cached.c;
      }
    } catch {
      /* storage unavailable — fall through to fetch */
    }
    const c = await fetchStarCounts();
    if (c) {
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ t: Date.now(), c }));
      } catch {
        /* fine uncached */
      }
    }
    return c;
  })();
  return pending;
}

function useLiveCounts(): StarCounts | null {
  const [counts, setCounts] = useState<StarCounts | null>(null);
  useEffect(() => {
    let on = true;
    void liveCounts().then((c) => {
      if (on && c) setCounts(c);
    });
    return () => {
      on = false;
    };
  }, []);
  return counts;
}

/** The account-wide numbers: star total (formatted) or original-repo count. */
export function StatNumber({ initial, stat }: { initial: number; stat: "total" | "repos" }) {
  const live = useLiveCounts();
  const n = live?.[stat] ?? initial;
  return <>{stat === "total" ? n.toLocaleString("en-US") : n}</>;
}

/** The résumé's ` · N★` per-repo suffix, hidden below the floor. */
export function StarSuffix({ initial, repo }: { initial: number; repo: string }) {
  const live = useLiveCounts();
  const n = live?.byRepo[repo] ?? initial;
  return n >= STAR_FLOOR ? <> · {n.toLocaleString("en-US")}★</> : null;
}
