import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/jsonld";

export const dynamic = "force-static";

/**
 * The AI crawlers, allowed by name.
 *
 * `User-agent: *` already permits every one of them, so this changes no
 * behaviour — it states an intent a wildcard cannot. The site publishes an
 * llms.txt and a .md mirror of every post specifically so these readers can
 * take the text without parsing the page; naming them makes that deliberate
 * rather than incidental, and puts a future disallow in the place someone
 * would actually look for it.
 *
 * Google-Extended and Applebot-Extended matter most: they are training and
 * grounding opt-ins *separate* from Googlebot and Applebot, and without an
 * explicit allow they read as undecided.
 */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "Amazonbot",
  "Meta-ExternalAgent",
  "cohere-ai",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // /api/ is machinery — the vitals beacon and the markdown mirror's
      // internal route. The mirror's *public* URL (/blog/<slug>.md) is a
      // rewrite and stays crawlable.
      { userAgent: "*", allow: "/", disallow: ["/api/"] },
      { userAgent: AI_AGENTS, allow: "/", disallow: ["/api/"] },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
