import { readFile } from "node:fs/promises";
import path from "node:path";
import { posts, published } from "@/lib/posts";
import { SITE_URL } from "@/lib/jsonld";

/**
 * The plain-markdown mirror of a post, served at /blog/<slug>.md.
 *
 * next.config.ts rewrites that public URL onto this handler — App Router
 * segments can't carry a file extension, and a catch-all here would collide
 * with the post page itself.
 *
 * Static on purpose: the source is read from disk at build time, so the
 * filesystem is never touched at request time and the output ships as a plain
 * file on the CDN.
 */
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return published.map((p) => ({ slug: p.slug }));
}

// MDX carries imports, ESM exports and JSX that mean nothing outside the
// bundler. Strip those; leave the prose, headings, lists and fenced code exactly
// as written, since that is the part anything reading this actually wants. An
// export statement can span several lines (a template literal, an object), so it
// is swallowed up to the line that closes it.
function toMarkdown(source: string) {
  const out: string[] = [];
  let inExport = false;
  for (const line of source.split("\n")) {
    if (inExport) {
      if (/;\s*$/.test(line)) inExport = false;
      continue;
    }
    if (/^\s*import\s.+from\s.+$/.test(line) || /^\s*import\s+["'].+["'];?\s*$/.test(line))
      continue;
    if (/^export\s+(const|let|var|function|async|class|default)\b/.test(line)) {
      if (!/;\s*$/.test(line)) inExport = true;
      continue;
    }
    out.push(line);
  }
  return out.join("\n").replace(/^\n+/, "");
}

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug && !p.draft);
  if (!post) return new Response("Not found", { status: 404 });

  const file = path.join(process.cwd(), "content", "blog", slug, "page.mdx");
  let body: string;
  try {
    body = toMarkdown(await readFile(file, "utf8"));
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const head = [
    `# ${post.title}`,
    "",
    `> ${post.spoiler}`,
    "",
    `Ganapati V S · ${post.date}${post.updated ? ` (updated ${post.updated})` : ""} · ${post.read}`,
    `${SITE_URL}/blog/${slug}`,
    "",
    "---",
    "",
  ].join("\n");

  return new Response(head + body, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Robots-Tag": "noindex",
    },
  });
}
