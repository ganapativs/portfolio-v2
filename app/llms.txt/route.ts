import { published } from "@/lib/posts";
import { identity } from "@/lib/resume";
import { SITE_URL } from "@/lib/jsonld";

// llms.txt — a curated, plain-text map of this site for AI systems.
export const dynamic = "force-static";

export async function GET() {
  // Each entry carries its markdown mirror, so a reader that wants the full
  // text can take it without parsing the page. See app/api/blog-md/[slug].
  const posts = published
    .map(
      (p) =>
        `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.spoiler} — plain markdown: ${SITE_URL}/blog/${p.slug}.md`,
    )
    .join("\n");

  const body = `# meetguns — Ganapati V S

> Personal site of ${identity.name} (@ganapativs) — engineer and engineering leader in Bengaluru, India. ${identity.jobTitle} at Tracxn (eleven years, four promotions). Builds and maintains open-source projects, most recently microcharts.

## Pages

- [Home](${SITE_URL}/): who he is, the eleven years at Tracxn, what he has made, off-screen, latest writing, contact. The career arc and the personal section live here — there is no separate about or work page
- [Résumé](${SITE_URL}/resume): recruiter-facing summary, print-friendly
- [Writing](${SITE_URL}/blog): technical blog
- [RSS](${SITE_URL}/rss.xml): feed of published posts
- [Sitemap](${SITE_URL}/sitemap.xml): every indexable route

## Reading this site as plain text

Every post is served as markdown at the same URL with a \`.md\` suffix — for
example ${SITE_URL}/blog/${published[0]?.slug ?? "post"}.md. No HTML, no
navigation, just the article.

## Writing

${posts}

## Open source

- [microcharts](https://microcharts.dev): 106 word-sized chart types for React — zero runtime dependencies, ~2–7 kB interactive, accessible by default, server-component safe. Machine surfaces: https://microcharts.dev/llms.txt, MCP server \`npx -y @microcharts/mcp\` (https://microcharts.dev/docs/mcp)
- [bttn.css](https://github.com/ganapativs/bttn.css): CSS button library, 2,050+ GitHub stars
- [Full catalogue](https://github.com/ganapativs): 55 original public repositories, 15 npm packages

## Contact

- Email: ${identity.email}
- GitHub: https://github.com/ganapativs
- X / Twitter: https://x.com/ganapativs
- LinkedIn: https://linkedin.com/in/ganapativs
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
