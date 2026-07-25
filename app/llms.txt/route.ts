import { published } from "@/app/blog/posts";
import { identity } from "@/lib/resume";
import { SITE_URL } from "@/lib/jsonld";

// llms.txt — a curated, plain-text map of this site for AI systems.
export const dynamic = "force-static";

export async function GET() {
  const posts = published
    .map((p) => `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.spoiler}`)
    .join("\n");

  const body = `# meetguns — Ganapati V S

> Personal site of ${identity.name} (@ganapativs) — engineer and engineering leader in Bengaluru, India. ${identity.jobTitle} at Tracxn (10+ years, four promotions). Builds and maintains open-source projects, most recently microcharts.

## Pages

- [Home](${SITE_URL}/): who he is, selected work, latest writing
- [About](${SITE_URL}/about): career arc 2013 → now, education
- [Work](${SITE_URL}/work): seven case studies — customer-facing AI assistant & API documentation portal, microcharts, a decade-long internal React component library, performance & platform work
- [Resume](${SITE_URL}/resume): recruiter-facing summary, print-friendly
- [Writing](${SITE_URL}/blog): technical blog
- [RSS](${SITE_URL}/rss.xml): feed of published posts
- [Sitemap](${SITE_URL}/sitemap.xml): every indexable route

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
