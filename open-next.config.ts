import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

/**
 * The OpenNext adapter's config. Read `wrangler.jsonc` beside it.
 *
 * An incremental cache and no tag cache, which is what this site actually
 * needs. Two routes revalidate on a timer, `/` and `/resume`, both because
 * `lib/github.ts` fetches the live star count with `next: { revalidate: 86_400 }`.
 * Nothing calls `revalidateTag` or `revalidatePath`, so there are no tags to
 * invalidate and a tag cache would be a D1 database or a Durable Object doing
 * nothing. Add one at the same time as the first on-demand revalidation, not
 * before.
 *
 * R2 rather than KV for the cache itself. KV is eventually consistent with a
 * cold read up to 60s stale, which is defensible for a page that only changes
 * daily, but R2 is strongly consistent and the write volume here is two objects
 * a day. There is no reason to take the weaker guarantee.
 */
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
});
