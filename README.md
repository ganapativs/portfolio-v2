# meetguns

Personal site of [Ganapati V S](https://meetguns.com), engineer and engineering
leader in Bengaluru.

[meetguns.com](https://meetguns.com) · [Writing](https://meetguns.com/blog) · [microcharts](https://microcharts.dev)

The design is **The Schematic**: one sheet of a living engineering drawing.
Registration ticks, a measuring edge down the left, a halftone portrait, six
figures, and a title block for a footer. Every figure is the real thing rather
than a picture of one, so the chart tray is the shipped `@microcharts/react`
components and the react-spectrum panel is the actual package, running.

## Stack

|           |                                                        |
| --------- | ------------------------------------------------------ |
| Framework | Next.js 16 (App Router, webpack)                       |
| UI        | React 19 · Tailwind CSS v4                             |
| Content   | MDX (`@next/mdx`)                                      |
| Tooling   | pnpm · TypeScript · oxlint · oxfmt                     |
| Charts    | [`@microcharts/react`](https://microcharts.dev)        |
| Sweep     | `glimm` — the WebGL band that carries a palette change |

Six inks on warm paper or graphite, a no-flash theme script, a keyboard map, and
a WebAudio cue set. Orientation for contributors and agents:
[AGENTS.md](AGENTS.md). Voice and intent: [.impeccable.md](.impeccable.md).

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000 — requires the --webpack flag (wired in scripts)
```

Optional LAN hostname (separate terminal):

```bash
portless run --lan   # https://portfolio-v2.local — whitelisted in next.config.ts
```

`localhost` and `portfolio-v2.local` are different origins, so theme and ink in
localStorage do not carry between them.

## Scripts

| Command                     |                                                              |
| --------------------------- | ------------------------------------------------------------ |
| `pnpm dev`                  | Dev server                                                   |
| `pnpm build` / `pnpm start` | Production build + serve                                     |
| `pnpm check`                | Format check + lint (CI gate)                                |
| `pnpm fix`                  | Auto-fix format + lint                                       |
| `pnpm knip`                 | Unused file / export report                                  |
| `pnpm gen:favicon`          | Rebuild `public/favicon.ico` from the built `/icon-512`      |
| `pnpm gen:kannada-subset`   | Re-cut the self-hosted Anek Kannada name subset              |
| `pnpm gen:pwa-screenshots`  | Recapture the two manifest screenshots                       |
| `pnpm index:submit`         | After deploy — ping IndexNow (Bing et al.) from live sitemap |

Pre-commit runs `oxfmt` + `oxlint --fix` via `simple-git-hooks` + `lint-staged`.
Don't bypass with `--no-verify`.

## Layout

```
app/                 Routes, OG/Twitter images, sitemap, robots, RSS, llms.txt, icons
  (press)/           The site. Every page renders inside components/schematic/Sheet
components/
  schematic/         The design: Sheet, Header, Ruler, the six figures, title block
  providers/         Sweep, Theme, FX, Ink
  shortcuts/         Keyboard registry, hints, help sheet
  mdx/               Post components
content/blog/        MDX posts (one folder per slug)
public/posts/        Per-post imagery
lib/                 ink, sweep, fonts, mark, posts, resume, jsonld, og, metadata
styles/press.css     Stylesheet entry point; styles/press/ holds the parts
```

## Writing a post

1. `content/blog/<slug>/page.mdx` — body
2. `public/posts/<slug>/` — cover + assets
3. A row in `lib/posts.ts` and a loader in `app/(press)/blog/[slug]/page.tsx`

No frontmatter — metadata lives in `lib/posts.ts`. The `.md` mirror, RSS,
sitemap and llms.txt pick the post up on their own; the build fails if the
loader is missing.

## License

Code is [MIT](LICENSE). Writing, photography, portrait, and brand assets remain
© Ganapati V S — ask before reusing.
