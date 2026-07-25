# meetguns

Personal site of [Ganapati V S](https://meetguns.com) — engineer and engineering leader in Bengaluru.

[meetguns.com](https://meetguns.com) · [Writing](https://meetguns.com/blog) · [microcharts](https://microcharts.dev)

## Stack

|           |                                                             |
| --------- | ----------------------------------------------------------- |
| Framework | Next.js 16 (App Router, webpack)                            |
| UI        | React 19 · Tailwind CSS v4                                  |
| Content   | MDX (`@next/mdx`)                                           |
| Tooling   | pnpm · TypeScript · oxlint · oxfmt                          |
| Charts    | [`@microcharts/react`](https://microcharts.dev) on the blog |

Hand-named design tokens, an 8-accent picker with pentatonic chimes, view-transition iris reveals, and a no-flash theme script. Orientation for contributors and agents: [AGENTS.md](AGENTS.md). Brand voice: [.impeccable.md](.impeccable.md).

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000 — requires the --webpack flag (wired in scripts)
```

Optional LAN hostname (separate terminal):

```bash
portless run --lan   # https://portfolio-v2.local — whitelisted in next.config.ts
```

`localhost` and `portfolio-v2.local` are different origins — theme/accent localStorage does not share.

## Scripts

| Command                     |                                                              |
| --------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                  | Dev server                                                   |
| `pnpm build` / `pnpm start` | Production build + serve                                     |
| `pnpm check`                | Format check + lint (CI gate)                                |
| `pnpm fix`                  | Auto-fix format + lint                                       |
| `pnpm knip`                 | Unused file / export report                                  |
| `pnpm index:submit`         | After deploy — ping IndexNow (Bing et al.) from live sitemap |

Pre-commit runs `oxfmt` + `oxlint --fix` via `simple-git-hooks` + `lint-staged`. Don't bypass with `--no-verify`.

## Layout

```
app/                 Routes, globals, OG/Twitter images, sitemap, robots, RSS, llms.txt
components/          UI — providers, primitives, sections, MDX, shortcuts, accent
content/blog/        MDX posts (one folder per slug)
public/posts/        Per-post imagery
lib/                 accents, fonts, jsonld, og, metadata, resume
styles/tokens.css    Design tokens
```

## Writing a post

1. `content/blog/<slug>/page.mdx` — body
2. `public/posts/<slug>/` — cover + assets
3. Entry in `app/blog/posts.ts` + loader in `app/blog/[slug]/page.tsx`

No frontmatter — metadata lives in `posts.ts`.

## License

Code is [MIT](LICENSE). Writing, photography, portrait, and brand assets remain © Ganapati V S — ask before reusing.
