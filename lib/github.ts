import { flagships } from "@/lib/resume";

/**
 * Live star counts, so the résumé doesn't quietly go stale.
 *
 * One unauthenticated request at build time, revalidated daily. GitHub allows
 * 60/hour per IP unauthenticated, which is far more headroom than a daily
 * refresh needs. If the call fails — rate limit, outage, offline build — this
 * falls back to the hand-checked numbers in lib/resume.ts rather than failing
 * the build or rendering a zero.
 */

const USER = "ganapativs";

export type Stars = {
  /** repo name (not full_name) → stargazers */
  byRepo: Record<string, number>;
  /** every public repo, including forks-of-record we don't list */
  total: number;
  live: boolean;
};

function fallback(): Stars {
  const byRepo: Record<string, number> = {};
  for (const f of flagships) {
    const name = f.repo.split("/").pop();
    if (name) byRepo[name] = f.stars;
  }
  return { byRepo, total: Object.values(byRepo).reduce((a, b) => a + b, 0), live: false };
}

// The account carries ~200 public repos once forks are counted, and the API
// pages at 100. One page silently under-counts the total, so walk until a short
// page comes back. Three pages is plenty of headroom and still three requests a
// day against a 60/hour budget.
const MAX_PAGES = 3;

export async function getStars(): Promise<Stars> {
  try {
    const byRepo: Record<string, number> = {};
    let total = 0;
    let sawAny = false;

    for (let page = 1; page <= MAX_PAGES; page++) {
      const res = await fetch(
        `https://api.github.com/users/${USER}/repos?per_page=100&type=owner&page=${page}`,
        {
          headers: { Accept: "application/vnd.github+json", "User-Agent": "meetguns.com" },
          next: { revalidate: 86_400 },
        },
      );
      if (!res.ok) return sawAny ? finish(byRepo, total) : fallback();
      const repos: { name: string; stargazers_count: number; fork: boolean }[] = await res.json();
      if (!Array.isArray(repos) || repos.length === 0) break;
      sawAny = true;

      for (const r of repos) {
        // Original work only — forks would inflate the count with other
        // people's stars, and the "55 public repos" claim counts originals.
        if (r.fork) continue;
        byRepo[r.name] = r.stargazers_count;
        total += r.stargazers_count;
      }
      if (repos.length < 100) break; // short page, that was the last one
    }

    return sawAny ? finish(byRepo, total) : fallback();
  } catch {
    return fallback();
  }
}

// Anything the API didn't return (renamed, transferred) keeps its known value.
function finish(byRepo: Record<string, number>, total: number): Stars {
  return { byRepo: { ...fallback().byRepo, ...byRepo }, total, live: true };
}

/**
 * Counts below this are noise on a résumé — a "3★" badge reads as an apology.
 * Set at 50 so microcharts (74 at the time of writing) carries its number while
 * the single-digit utilities don't.
 */
export const STAR_FLOOR = 50;
