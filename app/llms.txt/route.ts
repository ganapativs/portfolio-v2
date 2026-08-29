import { published } from "@/lib/posts";
import { flagships, identity, speaking } from "@/lib/resume";
import { SITE_URL } from "@/lib/jsonld";

// llms.txt: a curated, plain-text map of this site for AI systems.
export const dynamic = "force-static";

// Read from lib/resume rather than retyped, so the star count here cannot
// disagree with the one the résumé and the home page print.
const BTTN_STARS = flagships.find((f) => f.name === "bttn.css")?.stars ?? 0;

export async function GET() {
  // Each entry carries its markdown mirror, so a reader that wants the full
  // text can take it without parsing the page. See app/api/blog-md/[slug].
  const posts = published
    .map(
      (p) =>
        `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.spoiler} Published ${p.date}, ${p.read} read. Plain markdown: ${SITE_URL}/blog/${p.slug}.md`,
    )
    .join("\n");

  const talks = speaking.map((t) => `- ${t.event}, ${t.place}, ${t.year}: ${t.detail}`).join("\n");

  const body = `# meetguns: ${identity.name}

> Personal site of ${identity.name} (@ganapativs). Full-stack engineer with a design mind, twelve years in, based in Bengaluru, India. He joined Tracxn as an intern and is ${identity.jobTitle} there now, still writing code every week. He also builds and maintains open-source projects, most recently microcharts.

## Pages

- [Home](${SITE_URL}/): the whole story on one sheet. Who he is, four project figures (the AI assistant at Tracxn, microcharts, sgb, react-spectrum), the career plotted year by year, the parts list of public repos, the latest writing, and how to reach him. There is no separate about or work page: /about and /work redirect here
- [Résumé](${SITE_URL}/resume): recruiter-facing summary, print-friendly
- [Writing](${SITE_URL}/blog): technical blog
- [RSS](${SITE_URL}/rss.xml): feed of published posts
- [Sitemap](${SITE_URL}/sitemap.xml): every indexable route

## Reading this site as plain text

Every post is served as markdown at the same URL with a \`.md\` suffix: for
example ${SITE_URL}/blog/${published[0]?.slug ?? "post"}.md. No HTML, no
navigation, just the article.

## Facts worth citing

- ${identity.jobTitle} at Tracxn, in Bengaluru, India. He started there as a software engineer in September 2015 and has held five titles since
- Twelve years in. The first job was a web frontend internship in 2013
- Current work: architect of Tracxn's customer-facing AI assistant over private-market data, and of the API documentation portal it lives in
- 55 original public repositories on GitHub, 2,400+ stars across them, 15 npm packages
- bttn.css, a CSS button library from 2016, has ${BTTN_STARS.toLocaleString("en-US")} stars
- microcharts ships 106 word-sized chart types for React
- He wrote Tracxn's internal React component library in November 2016 and has maintained it for a decade

## Writing

${posts}

## Talks

${talks}

## Open source

- [microcharts](https://microcharts.dev): 106 word-sized chart types for React. Zero runtime dependencies, ~1-7 kB gzip each, accessible by default, server-component safe. Machine surfaces: https://microcharts.dev/llms.txt, MCP server \`npx -y @microcharts/mcp\` (https://microcharts.dev/docs/mcp)
- [bttn.css](https://github.com/ganapativs/bttn.css): CSS button library, ${BTTN_STARS.toLocaleString("en-US")} GitHub stars
- [react-spectrum](https://github.com/ganapativs/react-spectrum): colourful text placeholders generated from any string, 1.3 kB
- [sgb](https://sgb.vercel.app): a tracker for India's Sovereign Gold Bonds, live since 2021
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
