import { flagships, PUBLIC_WORK } from "@/lib/resume";
import { fetchStarCounts } from "@/lib/stars";

/**
 * Live star counts, so the résumé doesn't quietly go stale.
 *
 * The fetch itself lives in `lib/stars.ts`, shared with the client-side
 * refresher in `components/LiveStars.tsx`. This wrapper is the build-time half:
 * it bakes the counts into the prerender and, if the call fails — rate limit,
 * outage, offline build — falls back to the hand-checked numbers in
 * `lib/resume.ts` rather than failing the build or rendering a zero.
 */

export type Stars = {
  /** repo name (not full_name) → stargazers */
  byRepo: Record<string, number>;
  /** stars summed across original repos (forks are somebody else's stars) */
  total: number;
  /** how many original public repos the account carries */
  repos: number;
  live: boolean;
};

function fallback(): Stars {
  const byRepo: Record<string, number> = {};
  for (const f of flagships) {
    const name = f.repo.split("/").pop();
    if (name) byRepo[name] = f.stars;
  }
  return {
    byRepo,
    total: PUBLIC_WORK.stars,
    repos: PUBLIC_WORK.repos,
    live: false,
  };
}

export async function getStars(): Promise<Stars> {
  // Baked into the prerender at build time rather than revalidated on a timer.
  // A daily revalidation was the only thing on the site that needed a writable
  // incremental cache, and paying for an R2 bucket plus a flaky deploy-time
  // populate step to keep one number fresh was the wrong trade. The counts move
  // when the site is deployed — and live, in the browser, through LiveStars.
  const counts = await fetchStarCounts("force-cache");
  if (!counts) return fallback();
  // Anything the API didn't return (renamed, transferred) keeps its known value.
  return { ...counts, byRepo: { ...fallback().byRepo, ...counts.byRepo }, live: true };
}
