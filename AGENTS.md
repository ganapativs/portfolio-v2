<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

Next.js **16.2** + React **19.2** + Tailwind **v4** in this repo. APIs, conventions, and file structure may differ from your training data. Before writing Next.js or React code, **read the relevant guide in `node_modules/next/dist/docs/`** and heed deprecation notices. Do not invent options or import paths from memory.

<!-- END:nextjs-agent-rules -->

---

## ⚠️ Sync mandate (read first)

**When you change a watched surface, update this file in the same change.** Stale agent rules lie. Fragile pairs:

- `lib/accents.ts` ⇆ inline palette in `app/layout.tsx` (no-flash) ⇆ this file's accent table
- `styles/tokens.css` / `app/globals.css` ⇆ this file's token snapshot
- `app/**/page.tsx` route changes ⇆ this file's route map ⇆ `app/sitemap.ts`
- `next.config.ts` (headers, experimental flags, image config) ⇆ this file if security-relevant

---

## Stack snapshot

| Slot            | Version                 | Notes                                                                                             |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------------------- |
| Next.js         | 16.2.4                  | App Router, **`--webpack` build** (not Turbopack), MDX via `@next/mdx`                            |
| React           | 19.2.4                  | `<ViewTransition>` from `react`, `experimental.viewTransition` enabled                            |
| TypeScript      | ^5                      | strict, `target: ES2017`, `moduleResolution: bundler`, `@/*` → repo root                          |
| Tailwind CSS    | ^4                      | CSS-only config (no `tailwind.config.*`)                                                          |
| Linter          | oxlint ^1.62            | Rust-based; do NOT add ESLint                                                                     |
| Formatter       | oxfmt ^0.47             | Rust-based; do NOT add Prettier                                                                   |
| Package manager | pnpm                    | `pnpm-lock.yaml` committed; never `npm`/`yarn`/`bun`                                              |
| MDX             | @next/mdx ^16.2         | `remark-gfm`, `remark-smartypants`, `rehype-slug`, `rehype-autolink-headings`, `rehype-highlight` |
| Charts          | @microcharts/react ^0.8 | Blog-only. Imported per-post, styles too. Tokens bridged in `globals.css`                         |

---

## Repo layout

```
app/                 Routes (App Router) + globals.css + prototype.css. See route map below.
components/          UI: Dock, SiteFooter, ShaderHero, HeroSignal, ParticlePortrait, ContactSection, Reveal*, WebVitals, Analytics, PrintButton
  primitives/        Btn, Icon, Pill, GLogo, KarnatakaMap, IndiaFlag, AmbientBlob
  providers/         ThemeProvider, FXProvider, AccentProvider
  shortcuts/         ShortcutProvider, HintLayer, ShortcutHelp, KeyGlyph, useShortcut, shortcuts.css
  accent/            AccentPanel, AccentPopover
  sections/          AccentCards (Ticket, PostCard), Pillar, SectionHead, StatBlock, ordinalLabel
  mdx/               CanIUse, CodeBlock, Iframe, ZoomImage (+ microcharts demos)
mdx-components.tsx   Required by @next/mdx — maps pre→CodeBlock, img→ZoomImage, external links
content/blog/<slug>/ MDX posts. Body in page.mdx. Metadata is in app/blog/posts.ts (NOT frontmatter).
public/posts/<slug>/ Cover + inline imagery for each post.
lib/                 accents.ts, fonts.ts, jsonld.tsx (.tsx, not .ts), metadata.ts, og.tsx, resume.ts
styles/tokens.css    Single source of truth for design tokens (color, type, motion, radii, spacing)
.claude/             Editor/agent config — committed. settings.json wires the PostToolUse
                     oxfmt/oxlint hook; launch.json defines dev-server entries. No secrets.
```

## Route map

| Path                    | File                                                 | What it renders                                                                           |
| ----------------------- | ---------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `/`                     | `app/page.tsx`                                       | Home (hero + ShaderHero, stats, pillars, work tickets, blog teasers, contact)             |
| `/about`                | `app/about/page.tsx`                                 | Career timeline, education                                                                |
| `/work`                 | `app/work/page.tsx`                                  | Full case-study list                                                                      |
| `/blog`                 | `app/blog/page.tsx`                                  | Index of `published` posts                                                                |
| `/blog/<slug>`          | `app/blog/[slug]/page.tsx`                           | Dynamic; `generateStaticParams` from `published`; loaders are a hardcoded slug→import map |
| `/resume`               | `app/resume/page.tsx`                                | CV (with PrintButton)                                                                     |
| `/sitemap.xml`          | `app/sitemap.ts`                                     | Home + 4 routes + every published post                                                    |
| `/robots.txt`           | `app/robots.ts`                                      | Allow all + sitemap pointer                                                               |
| `/manifest.webmanifest` | `app/manifest.ts`                                    | PWA shell                                                                                 |
| `/rss.xml`              | `app/rss.xml/route.ts`                               | RSS 2.0 feed of `published` posts                                                         |
| `/llms.txt`             | `app/llms.txt/route.ts`                              | Curated plain-text site map for AI systems (pages, writing, OSS, contact)                 |
| `/api/vitals`           | `app/api/vitals/route.ts`                            | Edge runtime — receives next/web-vitals beacons                                           |
| `/opengraph-image*`     | `app/**/opengraph-image.tsx`                         | Per-route OG cards (site default in `app/opengraph-image.tsx`)                            |
| `error`                 | `app/error.tsx`                                      | Root error boundary                                                                       |
| `not-found`             | `app/not-found.tsx`, `app/blog/[slug]/not-found.tsx` | 404 (`robots: { index: false }`)                                                          |

## Provider stack (`app/layout.tsx`)

```
<ThemeProvider>             // theme + toggle(origin?). mg_theme.
  <FXProvider>              // WebAudio beeps + haptic. mg_sound.
    <ShortcutProvider>      // keyboard registry. ? = help, Esc = close. Scope stack: global|modal|page.
      <AccentProvider>      // accent + mono + mode. mg_accent, mg_mono. Reads useTheme() for plain-mode polarity.
        <RevealController>  // IntersectionObserver, threshold 0.15, rootMargin -60px.
          <main><ViewTransition name="route">{children}</ViewTransition></main>
          <SiteFooter />    // outside transition; view-transition-name: site-footer
          <Dock />          // outside transition; view-transition-name: dock
          <HintLayer /> <ShortcutHelp />
```

Plus `<WebVitals />` outside ThemeProvider; reports CLS/FCP/LCP/TTFB/INP to `/api/vitals`.

Plus `<Analytics />` outside ThemeProvider; GA4 via `gtag.js`. Measurement ID `G-Y6DEM2T3N5` is a **hardcoded constant** in `components/Analytics.tsx` (no env var — the ID is public by design). Renders **nothing** unless `NODE_ENV === "production"`, so `pnpm dev` never pollutes the property. `send_page_view:false` at config time — `page_view` fires manually on `usePathname()` change so App Router client navs are counted exactly once.

## Static files in `public/`

`humans.txt` (linked from `<link rel="author">` in `app/layout.tsx`), IndexNow key `mgindexnow7k2p9xq4m8n1w5e3r6t.txt`, `brand/`, `portrait/`, `posts/`.

## Persistence keys (localStorage)

| Key         | Values                             | Owner                             |
| ----------- | ---------------------------------- | --------------------------------- |
| `mg_theme`  | `"light" \| "dark"`                | `ThemeProvider`, no-flash script  |
| `mg_accent` | accent id from `lib/accents.ts`    | `AccentProvider`, no-flash script |
| `mg_mono`   | `"true" \| "false"`                | `AccentProvider`, no-flash script |
| `mg_sound`  | `"0"` muted, anything else unmuted | `FXProvider`                      |

All reads/writes wrapped in `try/catch`. Storage may be unavailable.

---

## Token quick-reference

Single source of truth: [styles/tokens.css](styles/tokens.css) and [app/globals.css](app/globals.css).

### Brand palette (raw)

| Token        | Hex       | Token        | Hex       |
| ------------ | --------- | ------------ | --------- |
| `--khadi`    | `#fbf6ea` | `--coffee`   | `#7c4628` |
| `--turmeric` | `#ecddbc` | `--tamarind` | `#5e3a24` |
| `--brass`    | `#d8bc8c` | `--peat`     | `#3f2a20` |
| `--clay`     | `#c18a5c` | `--kohl`     | `#231811` |
| `--jaggery`  | `#9a6a40` | `--moonless` | `#0f0b09` |

Legacy aliases preserved: `--bone` (=khadi), `--espresso` (=tamarind), `--cocoa` (=peat), `--ink` (=kohl).

### 8-accent picker (`lib/accents.ts`)

| ID                     | Hex                          | Kind | Pitch |
| ---------------------- | ---------------------------- | ---- | ----- |
| `terracotta` (default) | `#D88762`                    | hue  | E5    |
| `saffron`              | `#E8B86B`                    | hue  | G5    |
| `sage`                 | `#8FA37A`                    | hue  | A5    |
| `rose`                 | `#C97B7B`                    | hue  | B5    |
| `plum`                 | `#6E5167`                    | hue  | D5    |
| `coffee`               | `#7C4628`                    | hue  | C5    |
| `paper`                | `#000000` (polarity `light`) | pure | E6    |
| `ink`                  | `#FFFFFF` (polarity `dark`)  | pure | C3    |

`accentAt(i) = HUE_ACCENT_IDS[i % 6]` rotates the 6 hues for cards/tickets/posts. `paper` and `ink` are polarity overrides — entering them collapses the page to two-tone.

### Semantic tokens (light → dark)

| Slot           | Light                     | Dark                |
| -------------- | ------------------------- | ------------------- |
| `--bg-page`    | `var(--bone)` (`#fbf6ea`) | `#1a1411`           |
| `--bg-surface` | `#fffcf4`                 | `#221915`           |
| `--bg-sunken`  | `#f4ecd8`                 | `#14100d`           |
| `--fg-1`       | `var(--ink)`              | `#f4e9d5`           |
| `--fg-2`       | `var(--espresso)`         | `#e0d2ba`           |
| `--fg-3`       | `#7a5a42`                 | `#b6a084`           |
| `--accent`     | `var(--coffee)`           | `var(--terracotta)` |
| `--highlight`  | `var(--terracotta)`       | `var(--saffron)`    |
| `--link`       | `var(--coffee)`           | `var(--saffron)`    |
| `--ring`       | terracotta @ 0.35         | saffron @ 0.4       |

### Motion

| Token           | Value                               | Use                              |
| --------------- | ----------------------------------- | -------------------------------- |
| `--ease-out`    | `cubic-bezier(0.22, 1, 0.36, 1)`    | Default utility                  |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Character only (.flourish, hero) |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)`    | Symmetric                        |
| `--dur-fast`    | 140ms                               | Hover/focus                      |
| `--dur-base`    | 260ms                               | Default                          |
| `--dur-slow`    | 520ms                               | Deliberate emphasis              |
| `--dur-page`    | 720ms                               | Page-scope                       |

### Type

Families (`lib/fonts.ts`): `--font-sans` Geist, `--font-display` Fraunces (axes `opsz/SOFT/WONK`), `--font-mono` JetBrains Mono.

Fluid scale: `--t-micro` (10–11px) → `--t-display` (56–120px). 12 steps via `clamp()`.

Weights: `--fw-light 300`, `--fw-display 350`, `--fw-regular 400`, `--fw-readable 450`, `--fw-medium 500`, `--fw-semibold 600`, `--fw-bold 700`.

### Radii / Spacing / Shadows

Radii: `--r-xs 6` → `--r-2xl 36` + `--r-pill 999`. Spacing: `--s-1 4` → `--s-10 128`, plus `--space-hero-top: clamp(80px, 9vh, 128px)`. Shadows: warm-tinted `xs/sm/md/lg/xl/inset` + `--ring`.

### `<html>` data attributes

| Attribute                         | Set by                                    | Triggers                                              |
| --------------------------------- | ----------------------------------------- | ----------------------------------------------------- |
| `data-js="true"`                  | no-flash script                           | Scroll-reveal CSS (`.reveal` hides only when JS runs) |
| `data-theme="light\|dark"`        | no-flash → `ThemeProvider`                | All dark tokens                                       |
| `data-mono="true"`                | no-flash → `AccentProvider` (`applyMono`) | Monochrome rules                                      |
| `data-pure="paper\|ink"`          | `applyAccent`                             | Two-tone collapse                                     |
| `data-purePolarity="light\|dark"` | `applyAccent`                             | Body bg, meta-color                                   |

CSS classes added during recolor: `vt-recolor`, `vt-recolor-radial` (when iris reveal active).

---

## View-transition contract

1. Route nav: `<ViewTransition name="route">{children}</ViewTransition>` in layout. `Dock`/`SiteFooter` sit outside, with their own names.
2. Theme/accent/mono changes ALWAYS go through `withViewTransition(cb, origin?)` from `lib/accents.ts`. Never write `--accent` directly. Never call `document.startViewTransition` directly from a component.
3. Iris reveal: when `origin` provided, sets `--vt-x/--vt-y/--vt-r` and animates `@property`-typed `--vt-r-now` (CSS path) or WAAPI (fallback). 600ms `cubic-bezier(0.33, 1, 0.68, 1)`.
4. Reduced motion: `withViewTransition` short-circuits to `cb()`.

---

## Scripts (pnpm only)

```bash
pnpm dev          # next dev --webpack  (the --webpack flag is required)
pnpm build        # next build --webpack
pnpm check        # oxfmt --check && oxlint     ← run before pushing
pnpm fix          # oxfmt && oxlint --fix
pnpm lint         # oxlint
pnpm format       # oxfmt
pnpm knip         # unused files / exports
pnpm index:submit # after deploy — IndexNow; see scripts/submit-index.mjs
```

**Search indexing:** `app/sitemap.ts` + `app/robots.ts`. Google ownership via `verification.google` in `app/layout.tsx`. IndexNow key `public/mgindexnow7k2p9xq4m8n1w5e3r6t.txt` must match `INDEXNOW_KEY` in `scripts/submit-index.mjs`. Run `pnpm index:submit` after production deploy; submit sitemap manually in Google Search Console.

Pre-commit hook (simple-git-hooks → lint-staged): TS/JS/JSON → `oxfmt` + `oxlint --fix`; MD/MDX/CSS → `oxfmt`. **Don't bypass with `--no-verify`.**

## Dev server

- Local URL: `https://portfolio-v2.local/` via `portless run --lan` (run separately from `pnpm dev`).
- `allowedDevOrigins: ["portfolio-v2.local"]` is set in `next.config.ts`. Don't change the hostname without updating that list.
- `localhost:3000` and `portfolio-v2.local` are different origins → different localStorage. State you set on one won't appear on the other.

---

## When you write code

- Server Components by default. Add `"use client"` only when you need state, effects, refs, or browser APIs.
- Imports use `@/*` for anything outside the current folder. Don't reach into `.claude/`.
- Prefer `next/image` with the configured formats (`avif`, `webp`) and qualities (`70 | 80 | 90`).
- New entry-style files (sitemap, manifest, OG, route handlers, error/not-found) are caught by the existing `knip.json` `entry` glob.
- Don't add new top-level dependencies casually. Check `package.json` and `knip.json` first.
- For a new MDX post: drop `content/blog/<slug>/page.mdx`, add to `app/blog/posts.ts`, add a loader to `app/blog/[slug]/page.tsx`.

## What NOT to do

- ❌ Add ESLint, Prettier, Stylelint, Husky, or their configs.
- ❌ Run `npm` / `yarn` / `bun`. pnpm only.
- ❌ Introduce a `tailwind.config.js` — Tailwind v4 config is in CSS.
- ❌ Hardcode hex / px / cubic-bezier in components. Use tokens.
- ❌ Break the no-flash script in `app/layout.tsx`.
- ❌ Edit `lib/accents.ts:ACCENTS` without also editing the duplicated palette inside the no-flash inline script in `app/layout.tsx`.
- ❌ Write to `--accent` (or siblings) directly. Always go through `applyAccent` + `withViewTransition`.
- ❌ Bypass pre-commit hooks (`--no-verify`).
- ❌ Trust your training-era memory of Next.js APIs. Open `node_modules/next/dist/docs/` first.
- ❌ Replace `Array.prototype.toSorted()` with `.sort()` — it's intentional.
- ❌ Use `prefers-color-scheme: dark` to gate styles. Theme is user-controlled via `data-theme="dark"`.
- ❌ Add markdown frontmatter to MDX posts. Metadata lives in `app/blog/posts.ts`.

---

## Related

| Topic                                        | File                             |
| -------------------------------------------- | -------------------------------- |
| Brand voice, tone, audience, "what to avoid" | [.impeccable.md](.impeccable.md) |
| Site overview (human-readable)               | [README.md](README.md)           |
