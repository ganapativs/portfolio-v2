<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

Next.js **16.2** + React **19.2** + Tailwind **v4** in this repo. APIs, conventions, and file structure may differ from your training data. Before writing Next.js or React code, **read the relevant guide in `node_modules/next/dist/docs/`** and heed deprecation notices. Do not invent options or import paths from memory.

<!-- END:nextjs-agent-rules -->

---

## ⚠️ Sync mandate (read first)

**When you change a watched surface, update this file in the same change.** Stale agent rules lie. Fragile pairs:

- `styles/press/tokens.css` ⇆ this file's token snapshot and ink table ⇆ the hex mirrors in `lib/ink.ts` (satori can't read CSS)
- `app/**/page.tsx` route changes ⇆ this file's route map ⇆ `app/sitemap.ts` ⇆ `app/llms.txt/route.ts`
- `next.config.ts` (headers, redirects, rewrites, experimental flags, image config) ⇆ this file
- `lib/posts.ts` ⇆ the loader map in `app/(press)/blog/[slug]/page.tsx` (the build fails loudly if they drift)
- `lib/resume.ts` `skills` ⇆ the `STACK` list in `app/(press)/content.ts` (throws at module load if a name is renamed)

Two pairs that used to need watching no longer exist. The palette is not
duplicated between TypeScript and CSS — see "The ink system". And the retired
design is gone: as of the archive removal there is one design, one stylesheet
entry point, and no `/old`.

---

## Stack snapshot

| Slot            | Version                 | Notes                                                                                                                                |
| --------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Next.js         | 16.2.4                  | App Router, **`--webpack` build** (not Turbopack), MDX via `@next/mdx`                                                               |
| React           | 19.2.4                  | `<ViewTransition>` from `react`, `experimental.viewTransition` enabled                                                               |
| TypeScript      | ^5                      | strict, `target: ES2017`, `moduleResolution: bundler`, `@/*` → repo root                                                             |
| Tailwind CSS    | ^4                      | CSS-only config (no `tailwind.config.*`)                                                                                             |
| Linter          | oxlint ^1.62            | Rust-based; do NOT add ESLint                                                                                                        |
| Formatter       | oxfmt ^0.47             | Rust-based; do NOT add Prettier                                                                                                      |
| Package manager | pnpm                    | `pnpm-lock.yaml` committed; never `npm`/`yarn`/`bun`                                                                                 |
| MDX             | @next/mdx ^16.2         | `remark-gfm`, `remark-smartypants`, `rehype-slug`, `rehype-autolink-headings`, `rehype-highlight`                                    |
| Charts          | @microcharts/react ^0.8 | Blog-only. Imported per-post, styles too. Tokens bridged in `styles/press/essay.css`                                                 |
| Fonts           | next/font/google        | Anek Latin, Anek Kannada, Piazzolla, Fragment Mono. `@fontsource/*` copies exist only so the edge OG renderer can read the raw files |

---

## Repo layout

```
app/
  layout.tsx         Root: <html>, press fonts, no-flash script, providers, analytics.
                     Imports styles/press.css — the only global stylesheet the live site loads.
  (press)/           THE SITE. Route group, so it can own a shell without owning a URL segment.
    layout.tsx       Skip link, registration marks, <main> + <ViewTransition name="route">, <Dock/>
    page.tsx         Home. content.ts beside it holds the copy.
    blog/, resume/   See route map.
components/
  press/             The design: Dock, InkPopover, SiteHeader, PressFooter, Folio, Mark,
                     Masthead, PressRun, PortraitCoin, InkLibrary, EssayShell, PrintCV, useMounted
  providers/         ThemeProvider, FXProvider, InkProvider
  shortcuts/         ShortcutProvider, HintLayer, ShortcutHelp, KeyGlyph, useShortcut, shortcuts.css
  mdx/               CanIUse, CodeBlock, Iframe, ZoomImage (+ microcharts demos)
  ParticlePortrait   Halftone portrait canvas behind the press coin
  Analytics, WebVitals
mdx-components.tsx   Required by @next/mdx — maps pre→CodeBlock, img→ZoomImage, external links
content/blog/<slug>/ MDX posts. Body in page.mdx. Metadata is in lib/posts.ts (NOT frontmatter).
public/posts/<slug>/ Cover + inline imagery for each post.
lib/
  ink.ts             The ink system: ids, labels, hex mirrors, modes, storage keys
  posts.ts           Post metadata — outside the route tree so the pages and the feeds share it
  vt.ts              withViewTransition + the iris reveal
  fonts.ts           The press faces
  github.ts          Live star counts for the résumé (ISR)
  jsonld.tsx (.tsx, not .ts), metadata.ts, og.tsx, resume.ts
styles/
  press.css          Entry point — the only global stylesheet. Import order IS cascade order.
  press/             tokens · base · chrome · home · essay · microcharts-demos · resume · motion
.claude/             Editor/agent config — committed. settings.json wires the PostToolUse
                     oxfmt/oxlint hook; launch.json defines dev-server entries. No secrets.
```

## Route map

| Path                    | File                                                         | What it renders                                                                                                                       |
| ----------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                     | `app/(press)/page.tsx`                                       | Home — masthead, press run, roles, stack, catalogue, off-screen, writing + talk, contact, ink library. **Absorbed /about and /work.** |
| `/blog`                 | `app/(press)/blog/page.tsx`                                  | Index of `published` posts                                                                                                            |
| `/blog/<slug>`          | `app/(press)/blog/[slug]/page.tsx`                           | `generateStaticParams` from `published`; loaders are a hardcoded slug→import map                                                      |
| `/blog/<slug>.md`       | `app/api/blog-md/[slug]/route.ts` + a rewrite in next.config | The post as plain markdown. Static; imports and ESM exports stripped, prose left alone                                                |
| `/resume`               | `app/(press)/resume/page.tsx`                                | CV from `lib/resume.ts`, two columns, print stylesheet                                                                                |
| `/about`, `/work`       | `next.config.ts` redirects                                   | **308 → `/#about`, `/#work`.** Do not re-add these as pages                                                                           |
| `/sitemap.xml`          | `app/sitemap.ts`                                             | `/`, `/resume`, `/blog` + every published post. No `/about`, `/work`                                                                  |
| `/robots.txt`           | `app/robots.ts`                                              | Allow all except `/api/`; sitemap pointer                                                                                             |
| `/manifest.webmanifest` | `app/manifest.ts`                                            | PWA shell                                                                                                                             |
| `/rss.xml`              | `app/rss.xml/route.ts`                                       | RSS 2.0 feed of `published` posts                                                                                                     |
| `/llms.txt`             | `app/llms.txt/route.ts`                                      | Curated plain-text site map for AI systems; links each post's `.md` mirror                                                            |
| `/api/vitals`           | `app/api/vitals/route.ts`                                    | Edge runtime — receives next/web-vitals beacons                                                                                       |
| `/opengraph-image*`     | `app/**/opengraph-image.tsx`                                 | Per-route OG cards, all through `lib/og.tsx`                                                                                          |
| `error`                 | `app/error.tsx`                                              | Root error boundary. Outside the press shell, so it carries its own header + footer                                                   |
| `not-found`             | `app/not-found.tsx`, `app/(press)/blog/[slug]/not-found.tsx` | 404 (`robots: { index: false }`)                                                                                                      |

## Provider stack

Root (`app/layout.tsx`) owns everything:

```
<ThemeProvider>           // theme + toggle(origin?). mg_theme. Iris view transition.
  <FXProvider>            // WebAudio beeps + haptic. mg_sound.
    <ShortcutProvider>    // keyboard registry. ? = help, Esc = close. Scope stack: global|modal|page.
      <InkProvider>       // ink + press run. mg_ink, mg_mode. Stamps data attributes only.
        {children}
        <HintLayer /> <ShortcutHelp />
```

`app/(press)/layout.tsx` then adds the shell: skip link, registration marks,
`<main><ViewTransition name="route">`, `<Dock />` (named `dock` so it doesn't
crossfade on navigation).

Plus `<WebVitals />` outside ThemeProvider; reports CLS/FCP/LCP/TTFB/INP to `/api/vitals`.

Plus `<Analytics />` outside ThemeProvider; GA4 via `gtag.js`. Measurement ID `G-Y6DEM2T3N5` is a **hardcoded constant** in `components/Analytics.tsx` (no env var — the ID is public by design). Renders **nothing** unless `NODE_ENV === "production"`, so `pnpm dev` never pollutes the property. `send_page_view:false` at config time — `page_view` fires manually on `usePathname()` change so App Router client navs are counted exactly once.

## Keyboard map

Registered by the components themselves, so the Shift-hold hints float over the
real control. `h` home · `b` writing · `w` / `a` jump to work / off-screen (home
only) · `c` open the ink panel · `t` toggle paper · `1`–`6` pick an ink · `0`
cycle the press run · `m` mute · `?` help.

`r` goes to the résumé too, but it has no dock item to float a hint over — the
résumé is deliberately not a primary nav destination, so the key is registered
by `HiddenRouteShortcut` in `components/press/Dock.tsx` and is discoverable
through the `?` help sheet rather than through Shift-hold.

## Static files in `public/`

`humans.txt` (linked from `<link rel="author">` in `app/layout.tsx`), IndexNow key `mgindexnow7k2p9xq4m8n1w5e3r6t.txt`, `brand/`, `portrait/`, `posts/`.

## Persistence keys (localStorage)

| Key        | Values                             | Owner                            |
| ---------- | ---------------------------------- | -------------------------------- |
| `mg_theme` | `"light" \| "dark"`                | `ThemeProvider`, no-flash script |
| `mg_ink`   | ink id from `lib/ink.ts`           | `InkProvider`, no-flash script   |
| `mg_mode`  | `"colorful" \| "mono" \| "plain"`  | `InkProvider`, no-flash script   |
| `mg_sound` | `"0"` muted, anything else unmuted | `FXProvider`                     |

All reads/writes wrapped in `try/catch`. Storage may be unavailable.

---

## The ink system

**Nothing writes a colour from JavaScript.** The whole palette lives in
`styles/press/tokens.css`, keyed on three attributes stamped on `<html>`:
`data-theme` (`light`/`dark`), `data-ink` (six ids), `data-mode`
(`colorful`/`mono`/`plain`). The no-flash script sets those three and nothing
else, which is why there is no palette duplicated between CSS and TypeScript.

`--accent`, `--accent-ink`, `--accent-lit`, `--accent-soft`, `--accent-flip`,
`--plate` and `--wash` are registered with `@property { syntax: "<color>" }`.
That is what makes an ink change a real 340ms oklch interpolation rather than a
hard swap — unregistered custom properties are token streams and cannot be
transitioned.

`lib/ink.ts` carries flat hex mirrors (`INK_HEX`, `SURFACE_HEX`) for the edge OG
renderer only: satori resolves neither custom properties nor `oklch()`. **If you
change a colour in the CSS, change its mirror too.**

### The six inks (`lib/ink.ts` ⇆ `styles/press/tokens.css`)

| ID                     | Label         | On light paper       | On dark paper        | Pitch |
| ---------------------- | ------------- | -------------------- | -------------------- | ----- |
| `terracotta` (default) | monsoon clay  | `oklch(.55 .13 42)`  | `oklch(.74 .13 44)`  | E5    |
| `saffron`              | turmeric milk | `oklch(.60 .115 80)` | `oklch(.83 .12 84)`  | G5    |
| `sage`                 | neem leaf     | `oklch(.52 .11 148)` | `oklch(.76 .12 150)` | A5    |
| `rose`                 | gulkand rose  | `oklch(.57 .14 8)`   | `oklch(.76 .13 10)`  | B5    |
| `plum`                 | jamun         | `oklch(.50 .15 313)` | `oklch(.72 .14 310)` | D5    |
| `coffee`               | filter coffee | `oklch(.47 .075 52)` | `oklch(.72 .075 55)` | C5    |

The pitch is what the picker chimes when you pick that ink.

### Press runs

| Mode       | Dock label | What changes                                                                                                          |
| ---------- | ---------- | --------------------------------------------------------------------------------------------------------------------- |
| `colorful` | 2 ink      | Ink and its wash. The full run.                                                                                       |
| `mono`     | spot       | `--wash` goes transparent and `--plate` drops to `--ink`, so colour survives only as spots: rules, ticks, live values |
| `plain`    | 1 ink      | Every ink token collapses onto `--ink`. No colour anywhere.                                                           |

### Semantics — which token where

`--accent` the ink itself: rails, plates, fills, rules that carry meaning ·
`--accent-ink` text that is a live value or an action, never headings and never
chrome · `--accent-soft` / `--wash` washes, hover rows, `::selection` ·
`--accent-flip` the ink tuned for the _opposite_ surface, for inverted blocks
like "Say hello." · `--plate` large filled areas, which is the token the mode
ladder moves · `--blend` `multiply` on light paper, `screen` on dark.

### Surfaces

| Token      | Light                 | Dark                 |
| ---------- | --------------------- | -------------------- |
| `--paper`  | `oklch(.945 .026 84)` | `oklch(.19 .018 56)` |
| `--raise`  | `oklch(.985 .014 86)` | `oklch(.24 .02 56)`  |
| `--sunk`   | `oklch(.9 .032 80)`   | `oklch(.15 .014 54)` |
| `--ink`    | `oklch(.21 .022 52)`  | `oklch(.94 .016 82)` |
| `--ink-2`  | `oklch(.4 .022 52)`   | `oklch(.78 .018 76)` |
| `--ink-3`  | `oklch(.5 .02 55)`    | `oklch(.66 .018 70)` |
| `--rule`   | `oklch(.86 .022 72)`  | `oklch(.32 .02 58)`  |
| `--rule-2` | `oklch(.78 .022 66)`  | `oklch(.4 .022 58)`  |

---

## Type, space, motion

**Faces** (`lib/fonts.ts`): `--f-sans` Anek Latin (roles, headings, navigation,
structure) · `--f-kannada` Anek Kannada (ಗಣಪತಿ ವಿ ಎಸ್ at display size) ·
`--f-serif` Piazzolla (all prose, with the `opsz` axis) · `--f-mono` Fragment
Mono (years, counts, repo names, labels — tabular everywhere).

Repo and package names are always Fragment Mono; roles are always Anek. The
reader can tell what class a thing is before reading it. Prose is 19/1.62 at a
68ch measure.

**Scale**, ratio 1.25: `12 · 15 · 19 · 24 · 30 · 37 · 46 · 58 · 73`.
**Spacing**: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 144`.
**Radius**, four values each with a job: `0` rules · `2px` chips and focus ·
`6px` blocks and images · `50%` points.
**Motion**: `--dur-fast 140ms` hover/focus · `--dur-base 260ms` default ·
`--dur-ink 340ms` the coordinated ink tween · `--dur-slow 520ms`.
Easings: `--ease-out cubic-bezier(.22,1,.36,1)`, `--ease-quart
cubic-bezier(.25,1,.5,1)` (ink), `--ease-in-out cubic-bezier(.65,0,.35,1)`.

**No entrance animation. Nothing ships at `opacity: 0`.** Motion is reserved for
things the reader caused — a hover, a drag, an ink change, a route swap. There is
no scroll-reveal; don't reintroduce one.

### `<html>` data attributes

| Attribute                           | Set by                     | Triggers           |
| ----------------------------------- | -------------------------- | ------------------ |
| `data-theme="light\|dark"`          | no-flash → `ThemeProvider` | Every dark surface |
| `data-ink="<id>"`                   | no-flash → `InkProvider`   | The active ink     |
| `data-mode="colorful\|mono\|plain"` | no-flash → `InkProvider`   | The press run      |

Those three and nothing else. The no-flash script writes exactly them plus the
inline paper colour, and `ParticlePortrait` observes exactly them.

Classes added during a theme change: `vt-recolor`, `vt-recolor-radial`.

---

## View-transition contract

1. Route nav: `<ViewTransition name="route">` in `app/(press)/layout.tsx`. The
   `Dock` sits outside it with its own name so it doesn't crossfade.
2. **Theme** changes go through `withViewTransition(cb, origin?)` from
   `lib/vt.ts`. With an origin the iris radiates from the control you pressed —
   600ms `cubic-bezier(0.33, 1, 0.68, 1)`, driven by the `@property`-typed
   `--vt-r-now` length (WAAPI fallback where `@property` is missing).
3. **Ink and press-run** changes deliberately do NOT. They are colour-token
   interpolations; a view transition would freeze a snapshot and crossfade over
   the top of the tween, which reads as a stutter. Never wrap them.
4. Reduced motion: `withViewTransition` short-circuits to `cb()`, and the token
   transition is disabled — the ink arrives instead of travelling.

---

## When you write code

- Server Components by default. Add `"use client"` only when you need state, effects, refs, or browser APIs.
- Imports use `@/*` for anything outside the current folder. Don't reach into `.claude/`.
- Prefer `next/image` with the configured formats (`avif`, `webp`) and qualities (`70 | 80 | 90`).
- New entry-style files (sitemap, manifest, OG, route handlers, error/not-found) are caught by the existing `knip.json` `entry` glob.
- Don't add new top-level dependencies casually. Check `package.json` and `knip.json` first.
- For a new MDX post: drop `content/blog/<slug>/page.mdx`, add a row to `lib/posts.ts`, add a loader to `app/(press)/blog/[slug]/page.tsx`. `generateStaticParams` throws at build time if you forget the loader, and the `.md` mirror + RSS + sitemap + llms.txt all pick it up on their own.
- Every page belongs under `app/(press)/`. There is one design and one stylesheet entry point (`styles/press.css`).
- The portrait coin renders a real `next/image` on the server and swaps to the canvas once it mounts. Keep it that way — a bare canvas has no `alt` and nothing for a crawler.

## What NOT to do

- ❌ Add ESLint, Prettier, Stylelint, Husky, or their configs.
- ❌ Run `npm` / `yarn` / `bun`. pnpm only.
- ❌ Introduce a `tailwind.config.js` — Tailwind v4 config is in CSS.
- ❌ Hardcode hex / px / cubic-bezier in components. Use tokens.
- ❌ Break the no-flash script in `app/layout.tsx`. It stamps `data-theme`, `data-ink` and `data-mode` before first paint; everything downstream assumes they are there.
- ❌ Set a colour token from JavaScript. The palette is CSS, keyed on those three attributes. If you find yourself reaching for `style.setProperty("--accent", …)`, add a CSS rule instead.
- ❌ Change a colour in `styles/press/tokens.css` without updating its hex mirror in `lib/ink.ts` — the OG cards read the mirror.
- ❌ Wrap an ink or press-run change in `withViewTransition`. Theme only. See the view-transition contract.
- ❌ Ship anything at `opacity: 0` waiting to animate in.
- ❌ Bypass pre-commit hooks (`--no-verify`).
- ❌ Trust your training-era memory of Next.js APIs. Open `node_modules/next/dist/docs/` first.
- ❌ Replace `Array.prototype.toSorted()` with `.sort()` — it's intentional.
- ❌ Use `prefers-color-scheme: dark` to gate styles. Theme is user-controlled via `data-theme="dark"`.
- ❌ Add markdown frontmatter to MDX posts. Metadata lives in `lib/posts.ts`.
- ❌ Re-add `/about` or `/work` as pages. The home page absorbed both and `next.config.ts` redirects them.
- ❌ Re-add `/old`, `app/globals.css`, `lib/accents.ts` or the accent providers. The retired design was deleted, not archived — it is in git history if you need it.
- ❌ Add `Résumé` back to the dock. It is reachable by `r`, from the footer, the sitemap and `llms.txt` — deliberately not a primary nav item.

---

## Related

| Topic                                        | File                             |
| -------------------------------------------- | -------------------------------- |
| Brand voice, tone, audience, "what to avoid" | [.impeccable.md](.impeccable.md) |
| Site overview (human-readable)               | [README.md](README.md)           |
