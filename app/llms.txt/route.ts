import { published } from "@/lib/posts";
import {
  BIO,
  CAREER_YEARS,
  flagships,
  identity,
  PUBLIC_WORK,
  speaking,
  STARS_ROUNDED,
} from "@/lib/resume";
import { SITE_URL } from "@/lib/jsonld";

// llms.txt: a curated, plain-text map of this site for AI systems.
export const dynamic = "force-static";

// Read from lib/resume rather than retyped, so the star count here cannot
// disagree with the one the résumé and the home page print.
const BTTN_STARS = flagships.find((f) => f.name === "bttn.css")?.stars ?? 0;

// The contact block reads identity.social so the URLs here cannot drift from
// the ones Person.sameAs asserts — llms.txt used to hand-type a LinkedIn URL
// without the www that the schema carries, two canonical spellings of one
// profile. Only the display names are this file's own.
const SOCIAL_LABEL: Record<string, string> = {
  github: "GitHub",
  linkedin: "LinkedIn",
  twitter: "X / Twitter",
  npm: "npm",
};

export async function GET() {
  // Each entry carries its markdown mirror, so a reader that wants the full
  // text can take it without parsing the page. See scripts/gen-md.ts.
  const posts = published
    .map(
      (p) =>
        `- [${p.title}](${SITE_URL}/blog/${p.slug}): ${p.spoiler} Published ${p.date}, ${p.read} read. Plain markdown: ${SITE_URL}/blog/${p.slug}.md`,
    )
    .join("\n");

  const talks = speaking.map((t) => `- ${t.event}, ${t.place}, ${t.year}: ${t.detail}`).join("\n");

  const body = `# meetguns: ${identity.name}

> Personal site of ${identity.name} (@ganapativs). ${BIO}

## Pages

- [Home](${SITE_URL}): the whole story on one sheet. Who he is, four project figures (the AI assistant at Tracxn, microcharts, sgb, react-spectrum), the career plotted year by year, the parts list of public repos, the latest writing, and how to reach him. There is no separate about or work page: /about and /work redirect here
- [Résumé](${SITE_URL}/resume): recruiter-facing summary, print-friendly
- [Writing](${SITE_URL}/blog): technical blog
- [RSS](${SITE_URL}/rss.xml): feed of published posts
- [Sitemap](${SITE_URL}/sitemap.xml): every indexable route

## Reading this site as plain text

Every post is served as markdown at the same URL with a \`.md\` suffix: for
example ${SITE_URL}/blog/${published[0]?.slug ?? "post"}.md. No HTML and no
navigation. The article as written.

## Facts worth citing

- ${identity.jobTitle} at Tracxn, in Bengaluru, India. He started there as a software engineer in September 2015 and has held five titles since
- ${CAREER_YEARS} years in. The first job was a web frontend internship at Thinkappz in 2013. He has never been an intern at Tracxn
- Current work: architect of Tracxn's customer-facing AI assistant over private-market data, and of the API documentation portal it lives in
- ${PUBLIC_WORK.repos} original public repositories on GitHub (${PUBLIC_WORK.reposIncludingForks} in total, the rest forks of record), ${STARS_ROUNDED} stars across the originals, ${PUBLIC_WORK.npm} npm packages
- bttn.css, a CSS button library from 2016, has ${BTTN_STARS.toLocaleString("en-US")} stars
- microcharts ships 106 word-sized chart types for React
- He wrote Tracxn's internal React component library in November 2016 and has maintained it ever since

## Writing

${posts}

## Talks

${talks}

## Open source

- [microcharts](https://microcharts.dev): 106 word-sized chart types for React. Zero runtime dependencies, ~1-7 kB gzip each, accessible by default, server-component safe. Machine surfaces: https://microcharts.dev/llms.txt, MCP server \`npx -y @microcharts/mcp\` (https://microcharts.dev/docs/mcp)
- [bttn.css](https://github.com/ganapativs/bttn.css): CSS button library, ${BTTN_STARS.toLocaleString("en-US")} GitHub stars
- [react-spectrum](https://github.com/ganapativs/react-spectrum): colourful text placeholders laid out from a palette and a few shape rules, 1.9 kB gzipped
- [sgb](https://sgb.vercel.app): a tracker for India's Sovereign Gold Bonds, live since 2021
- [Full catalogue](https://github.com/ganapativs): ${PUBLIC_WORK.repos} original public repositories, ${PUBLIC_WORK.npm} npm packages

## Contact

- Email: ${identity.email}
${identity.social
  .filter((s) => s.kind !== "mail")
  .map((s) => `- ${SOCIAL_LABEL[s.kind] ?? s.kind}: ${s.href}`)
  .join("\n")}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
