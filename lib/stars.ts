/**
 * The raw GitHub star-count fetch, shared by both ends of the page's life:
 * `lib/github.ts` runs it at build time so the prerendered HTML carries real
 * numbers, and `components/LiveStars.tsx` runs it again in the browser to swap
 * in the current ones. It lives alone, with no import of `lib/resume`, so the
 * client bundle gets the ~30 lines of paging logic and not the whole CV.
 *
 * Unauthenticated. GitHub allows 60/hour per IP, which is plenty for one build
 * or one visitor (LiveStars caches in localStorage for 6 h on top). Returns
 * null on any failure — the callers own their fallbacks.
 */

const USER = "ganapativs";

export type StarCounts = {
  /** repo name (not full_name) → stargazers */
  byRepo: Record<string, number>;
  /** stars summed across original repos (forks are somebody else's stars) */
  total: number;
  /** how many original public repos the account carries */
  repos: number;
};

// The account carries ~200 public repos once forks are counted, and the API
// pages at 100. One page silently under-counts the total, so walk until a short
// page comes back. Three pages is plenty of headroom.
const MAX_PAGES = 3;

export async function fetchStarCounts(cache?: RequestCache): Promise<StarCounts | null> {
  try {
    const byRepo: Record<string, number> = {};
    let total = 0;
    let repos = 0;

    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(
        `https://api.github.com/users/${USER}/repos?per_page=100&type=owner&page=${page}`,
        {
          // GitHub's API rejects requests with no User-Agent. Browsers always
          // send their own (and forbid overriding it), so set one only where
          // there would otherwise be none.
          headers:
            typeof window === "undefined"
              ? { Accept: "application/vnd.github+json", "User-Agent": "meetguns.com" }
              : { Accept: "application/vnd.github+json" },
          cache,
        },
      );
      // A failed page mid-walk means the numbers so far are an undercount, and
      // an undercount returned as truth gets baked into the prerender and the
      // 6 h browser cache. Partial is worse than nothing: the callers have a
      // hand-checked fallback for nothing.
      if (!res.ok) return null;
      const batch: { name: string; stargazers_count: number; fork: boolean }[] = await res.json();
      if (!Array.isArray(batch)) return null;
      if (batch.length === 0) break;

      for (const r of batch) {
        // Original work only. Forks would inflate the count with other
        // people's stars, and the repo count on the page means originals.
        if (r.fork) continue;
        byRepo[r.name] = r.stargazers_count;
        total += r.stargazers_count;
        repos += 1;
      }
      if (batch.length < 100) break; // short page, that was the last one
    }

    return repos > 0 ? { byRepo, total, repos } : null;
  } catch {
    return null;
  }
}

/**
 * Counts below this are noise on a résumé — a "3★" badge reads as an apology.
 * Set at 50 so microcharts (74 at the time of writing) carries its number while
 * the single-digit utilities don't.
 */
export const STAR_FLOOR = 50;
