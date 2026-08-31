/**
 * The plain-markdown mirror of every published post, written as a real file at
 * `public/blog/<slug>.md` before each build and dev run (see the `build`/`dev`
 * scripts in package.json). This used to be a route handler behind a rewrite;
 * with `output: "export"` there are no rewrites, and the microcharts docs site
 * proved the simpler shape: generate the file, let the host serve it. Public
 * files win over dynamic routes, so `/blog/<slug>.md` works identically in
 * `next dev`, in the export, and on any host.
 *
 * Run by node directly (Node 24 strips types natively), so imports here are
 * relative with explicit extensions — node does not read tsconfig paths.
 */
import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { published } from "../lib/posts.ts";

// lib/jsonld.tsx owns this constant, but it is a .tsx module node cannot run.
// One hostname, two copies, both grep-able.
const SITE_URL = "https://meetguns.com";

// MDX carries imports, ESM exports and JSX that mean nothing outside the
// bundler. Strip those; leave the prose, headings, lists and fenced code exactly
// as written, since that is the part anything reading this actually wants. An
// export statement can span several lines (a template literal, an object), so it
// is swallowed up to the line that closes it.
function toMarkdown(source: string): string {
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

const outDir = path.join(process.cwd(), "public", "blog");
await mkdir(outDir, { recursive: true });

// A post pulled from `published` (drafted, deleted) must not leave its mirror
// behind — the directory holds generated files only, so anything stale goes.
const want = new Set(published.map((p) => `${p.slug}.md`));
const stale = (await readdir(outDir)).filter((f) => f.endsWith(".md") && !want.has(f));
await Promise.all(stale.map((f) => unlink(path.join(outDir, f))));

await Promise.all(
  published.map(async (post) => {
    const file = path.join(process.cwd(), "content", "blog", post.slug, "page.mdx");
    const body = toMarkdown(await readFile(file, "utf8"));
    const head = [
      `# ${post.title}`,
      "",
      `> ${post.spoiler}`,
      "",
      `Ganapati V S · ${post.date}${post.updated ? ` (updated ${post.updated})` : ""} · ${post.read}`,
      `${SITE_URL}/blog/${post.slug}`,
      "",
      "---",
      "",
    ].join("\n");
    await writeFile(path.join(outDir, `${post.slug}.md`), head + body);
  }),
);

console.log(`gen-md: ${published.length} markdown mirrors → public/blog/`);
