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
- `app/manifest.ts` `screenshots` sizes ⇆ the dimensions `scripts/gen-pwa-screenshots.sh` captures (a mismatch silently drops the rich install dialog)
- the mark's paths in `lib/mark.ts` ⇆ the committed `public/favicon.ico` (regenerate with `pnpm build && pnpm gen:favicon`)
- `data-analytics` attributes ⇆ the kinds `ClickCapture` parses in `components/Analytics.tsx` — an unknown kind is silently dropped, not an error

Two pairs that used to need watching no longer exist. The palette is not
duplicated between TypeScript and CSS — see "The ink system". And the retired
design is gone: as of the archive removal there is one design, one stylesheet
entry point, and no `/old`.

---

## Stack snapshot

| Slot            | Version                        | Notes                                                                                                                                                                                                       |
| --------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js         | 16.2.12                        | App Router, **`--webpack` build** (not Turbopack), MDX via `@next/mdx`                                                                                                                                      |
| React           | 19.2.8                         | `<ViewTransition>` from `react`, `experimental.viewTransition` enabled                                                                                                                                      |
| TypeScript      | ^6                             | strict, `target: ES2017`, `moduleResolution: bundler`, `@/*` → repo root                                                                                                                                    |
| Tailwind CSS    | ^4                             | CSS-only config (no `tailwind.config.*`)                                                                                                                                                                    |
| Linter          | oxlint ^1.76                   | Rust-based; do NOT add ESLint                                                                                                                                                                               |
| Formatter       | oxfmt ^0.61                    | Rust-based; do NOT add Prettier                                                                                                                                                                             |
| Package manager | pnpm                           | `pnpm-lock.yaml` committed; never `npm`/`yarn`/`bun`                                                                                                                                                        |
| MDX             | @next/mdx ^16.2                | `remark-gfm`, `remark-smartypants`, `rehype-slug`, `rehype-autolink-headings`, `rehype-highlight`                                                                                                           |
| Charts          | @microcharts/react ^0.11       | Blog-only. Imported per-post, styles too. Tokens bridged in `styles/press/essay.css`                                                                                                                        |
| Fonts           | next/font                      | Anek Latin, Piazzolla, Fragment Mono from Google. Anek Kannada is **self-hosted and subsetted** — see "Fonts on the wire". `@fontsource/*` copies exist only so the edge OG renderer can read the raw files |
| Browsers        | `browserslist` in package.json | Chrome/Edge 111, Firefox 128, Safari/iOS 16.4. That floor is not arbitrary: the design is built on `oklch()`, `color-mix()` and `@property`, none of which exist below it                                   |

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
  mark.ts            The G, as raw path data — the one copy the five renderers share
  icon-png.tsx       markPng(size, {maskable}) — every PNG icon the site serves
  github.ts          Live star counts for the résumé (ISR)
  analytics/         track() + the GA4 adapter. See "Analytics".
  jsonld.tsx (.tsx, not .ts), metadata.ts, og.tsx, resume.ts
fonts/               Self-hosted faces + their licence. Currently one: the Anek
                     Kannada name cut (scripts/subset-kannada.py).
scripts/             gen-favicon.py · gen-pwa-screenshots.sh · subset-kannada.py ·
                     submit-index.mjs. All manual; all outputs committed.
styles/
  press.css          Entry point — the only global stylesheet. Import order IS cascade order.
  press/             tokens · base · chrome · home · essay · microcharts-demos · resume · motion
.claude/             Editor/agent config — committed. settings.json wires the PostToolUse
                     oxfmt/oxlint hook; launch.json defines dev-server entries. No secrets.
```

## Route map

| Path                                           | File                                                         | What it renders                                                                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                            | `app/(press)/page.tsx`                                       | Home — masthead, press run, roles, stack, catalogue, off-screen, writing + talk, contact, ink library. **Absorbed /about and /work.** |
| `/blog`                                        | `app/(press)/blog/page.tsx`                                  | Index of `published` posts                                                                                                            |
| `/blog/<slug>`                                 | `app/(press)/blog/[slug]/page.tsx`                           | `generateStaticParams` from `published`; loaders are a hardcoded slug→import map                                                      |
| `/blog/<slug>.md`                              | `app/api/blog-md/[slug]/route.ts` + a rewrite in next.config | The post as plain markdown. Static; imports and ESM exports stripped, prose left alone                                                |
| `/resume`                                      | `app/(press)/resume/page.tsx`                                | CV from `lib/resume.ts`, two columns, print stylesheet                                                                                |
| `/about`, `/work`                              | `next.config.ts` redirects                                   | **308 → `/#about`, `/#work`.** Do not re-add these as pages                                                                           |
| `/sitemap.xml`                                 | `app/sitemap.ts`                                             | `/`, `/resume`, `/blog` + every published post. No `/about`, `/work`                                                                  |
| `/robots.txt`                                  | `app/robots.ts`                                              | Allow all except `/api/`; sitemap pointer. The AI crawlers are also allowed **by name** — see the comment there for why               |
| `/manifest.webmanifest`                        | `app/manifest.ts`                                            | PWA shell: five icons, two screenshots, two shortcuts (Writing, Résumé)                                                               |
| `/icon`                                        | `app/icon.tsx`                                               | The tab favicon. SVG, transparent, live ink (sage in dev)                                                                             |
| `/icon-192`, `/icon-512`, `/icon-512-maskable` | `app/icon-*/route.tsx`                                       | PNG mark on paper via `lib/icon-png.tsx`. 192+512 are Chrome's install requirement; the maskable cut is inset for Android             |
| `/apple-icon`                                  | `app/apple-icon.tsx`                                         | 180×180 home-screen tile, same renderer                                                                                               |
| `/favicon.ico`                                 | `public/favicon.ico`                                         | Committed 16/32/48 raster for legacy probes + Google's SERP favicon. **In `public/`, not `app/`** — see the note in `app/layout.tsx`  |
| `/rss.xml`                                     | `app/rss.xml/route.ts`                                       | RSS 2.0 feed of `published` posts                                                                                                     |
| `/llms.txt`                                    | `app/llms.txt/route.ts`                                      | Curated plain-text site map for AI systems; links each post's `.md` mirror                                                            |
| `/api/vitals`                                  | `app/api/vitals/route.ts`                                    | Edge runtime — receives next/web-vitals beacons                                                                                       |
| `/opengraph-image*`                            | `app/**/opengraph-image.tsx`                                 | Per-route OG cards, all through `lib/og.tsx`                                                                                          |
| `error`                                        | `app/error.tsx`                                              | Root error boundary. Outside the press shell, so it carries its own header + footer                                                   |
| `not-found`                                    | `app/not-found.tsx`, `app/(press)/blog/[slug]/not-found.tsx` | 404 (`robots: { index: false }`)                                                                                                      |

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

Plus `<WebVitals />` outside ThemeProvider; reports CLS/FCP/LCP/TTFB/INP to
`/api/vitals` **and** to GA4 as one event per metric (CLS scaled ×1000 — GA4
rounds `value` to an integer and would otherwise record 0 every time).

Plus `<Analytics />` outside ThemeProvider. See below.

---

## Analytics

Ported from the microcharts docs app (`apps/docs/src/lib/analytics` in the
parallel repo) so both properties speak the same shape.

```
lib/analytics/
  types.ts          AnalyticsEvent — a closed union, one member per KIND of
                    interaction, never one per control
  track.ts          the adapter registry. track() is a no-op with none
                    registered, and swallows anything an adapter throws
  adapters/ga.ts    the union → GA4 mapping
  adapters/debug.ts console.debug, used in development
  ga-id.ts          GA_ID, GA_ENABLED, and the head stub
```

Three things are load-bearing:

1. **The gtag stub is inlined in `<head>` (`app/layout.tsx`), not in the
   component.** ~140 bytes, no request. `gtag()` therefore exists before first
   paint, so an event fired by a click that lands before the 155 kB library
   does queues on `dataLayer` instead of vanishing into `window.gtag?.()`.
2. **`gtag.js` loads `lazyOnload`.** `afterInteractive` makes Next emit a
   high-priority `<link rel="preload" as="script">` for it, which races the
   masthead's own font and pushes LCP out. The stub above is what makes the
   late load free.
3. **Auto page_view is off** (`send_page_view:false`). Pageviews fire manually
   on `usePathname()` change, so an App Router client nav is counted exactly
   once. `location.search` is read in the effect rather than through
   `useSearchParams` — the hook would force a Suspense boundary and opt every
   page out of static prerendering.

Measurement ID `G-Y6DEM2T3N5` is a hardcoded constant (public by design, no env
var). Nothing reaches GA unless `NODE_ENV === "production"`; in `pnpm dev`
`track()` goes to the console instead, so every call site is verifiable without
a deploy.

### How a control opts in

Add `data-analytics="<kind>:<id>"`. One delegated listener on `document`
(`ClickCapture`) reads it — there is no per-control `onClick`.

| Kind    | Use for                             | Example                                        |
| ------- | ----------------------------------- | ---------------------------------------------- |
| `nav:`  | in-site navigation the reader chose | `nav:dock.writing`, `nav:home.teaser.<slug>`   |
| `cta:`  | a named content link                | `cta:project.microcharts`, `cta:social.GitHub` |
| `feed:` | a machine-readable surface          | `feed:rss`, `feed:llms`, `feed:markdown`       |
| `mail:` | a mailto worth naming               | `mail:say-hello`                               |

On top of that, and without any attribute: **any link leaving the origin** is
reported as `outbound`, and any bare `mailto:` as a contact. Nothing else
fires — this does not log every click on the page.

Interactions that are not links report through `track()` directly, each from
the one place that knows the truth: theme from `ThemeProvider`'s sync effect
(which alone knows the value that won, and whether an origin means pointer or
keyboard), ink and press run from `InkProvider`, keyboard shortcuts from
`ShortcutProvider`'s keydown (so a key press is distinguishable from a click on
the control it shares a handler with), plus `print_cv`, `copy` and
`zoom_image`.

**Adding a control does not mean adding an event name.** A new dock item is a
new `nav` id. GA4 caps custom event names at 500 and per-control names burn
that budget for no analytical gain. `contact_click` and `print_cv` are the two
worth marking as key events in the GA4 UI.

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

`favicon.ico` (committed; `pnpm gen:favicon`), `humans.txt` (linked from `<link
rel="author">` in `app/layout.tsx`), `BingSiteAuth.xml`, IndexNow key
`mgindexnow7k2p9xq4m8n1w5e3r6t.txt`, `brand/` (wordmark, logo, monogram +
`screenshot-wide.png` / `screenshot-narrow.png` for the manifest),
`portrait/`, `posts/`.

## Icons

One mark (`lib/mark.ts`), five renderings. Everything raster goes through
`markPng()` in `lib/icon-png.tsx`, so they cannot drift apart.

| Surface              | What it is                        | Why it exists                                                      |
| -------------------- | --------------------------------- | ------------------------------------------------------------------ |
| `/icon`              | SVG, transparent, live ink        | Tab strip — the browser chrome is the paper, so no tile            |
| `/icon-192`          | PNG, ink on paper                 | Chrome's install prompt; Google's SERP favicon wants a 48-multiple |
| `/icon-512`          | PNG, ink on paper                 | Splash screen, high-DPI                                            |
| `/icon-512-maskable` | same, glyph inset to 42% (vs 62%) | Android crops adaptive icons; the un-inset art loses its bar       |
| `/apple-icon`        | 180×180 PNG                       | iOS composites onto its own rounded rect and does not crop         |
| `public/favicon.ico` | 16/32/48 raster, committed        | Legacy probes and readers that never ask for anything else         |

Two traps:

- **`favicon.ico` lives in `public/`, not `app/`.** As an app-router file
  convention Next emits its own `<link rel="icon" sizes="16x16">` for it — a
  third, wrongly-labelled tag beside the ones `icons` already declares.
- **The `icons` object in `app/layout.tsx` suppresses the file conventions.**
  The moment it exists, Next stops auto-linking `app/icon.tsx` and
  `app/apple-icon.tsx`, so every icon has to be listed there by hand.

Regenerate the `.ico` after changing the mark: `pnpm build && pnpm gen:favicon`
(it reads the built `/icon-512`, so it can never disagree with the family).

## Fonts on the wire

Four faces, and which of them is _preloaded_ is a decision, not a default —
preloads are high priority and they compete with each other for the same pipe.
The LCP element is the masthead on desktop and `.lede` on a phone.

| Face          | Source                    | Preload | Bytes                    |
| ------------- | ------------------------- | ------- | ------------------------ |
| Anek Latin    | next/font/google          | yes     | ~45 kB                   |
| Piazzolla     | next/font/google          | yes     | ~107 kB (roman + italic) |
| Fragment Mono | next/font/google          | yes     | ~16 kB                   |
| Anek Kannada  | **self-hosted, `fonts/`** | yes     | ~10 kB                   |

- **Anek Kannada is subsetted to the eleven characters of ಗಣಪತಿ ವಿ ಎಸ್** by
  `scripts/subset-kannada.py` (`pnpm gen:kannada-subset`). Google's Kannada
  block is 111 kB and the colophon carries the name on every page, so it was
  111 kB at font priority, forever, to set one string. The cut keeps the weight
  axis and the full Kannada shaping feature set — subsetting on codepoints
  alone would drop the conjunct forms and render the name wrong.
- **The acceptance test is a measured width, not a look.** The cut must set the
  name at exactly the same width as the un-subsetted face — load both as
  `FontFace`s and compare at 400/500/600. A broken cut reads as "slightly
  loose" and passes a visual check every time; one already shipped ~13% wide
  before the GDEF problem below was found.
- **The subset carries a synthesised GDEF `GlyphClassDef`, and it has to.** Anek
  draws ತ + ಿ as one glyph through a `psts` ligature lookup flagged
  `IgnoreMarks`. That works in the full face only because its GDEF classifies
  twenty unrelated glyphs and leaves ಿ unclassified — class 0, not a mark. None
  of those twenty survive the cut, so fontTools drops the ClassDef, HarfBuzz
  falls back to Unicode category (U+0CBF is `Mn`), the flag skips the matra and
  the vowel signs render loose beside their bases. `keep_gdef_alive()` in the
  script puts the table back. Re-check with `hb-shape` after any change: the
  name must shape to **nine** glyphs, not eleven.
- **`--f-kannada` lists Anek Kannada _first_, then Anek Latin. Leave it.**
  Reversing it looks free — the two faces are the same design, and Latin-first
  stops Anek Kannada being fetched for the spaces in the name. It is not free:
  they do not share a word-space advance. Measured at 200px, Latin-first sets
  the name 1.1% narrow (1154.91px against the reference's 1167.70px) at every
  weight. The saving it was reaching for no longer exists anyway — the local
  cut has no separate latin file to avoid.
- **Piazzolla's italic (55 kB) is preloaded and nothing above the fold uses
  it.** `preload` is per-loader-call, not per-style, and splitting it into a
  second family would not help: CSS font matching synthesizes an oblique rather
  than falling through for a style mismatch. Do not "fix" this by dropping the
  preload — on mobile `.lede` is the LCP element and it is this face.

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

## Structured data

`lib/jsonld.tsx` is the only place JSON-LD is written. Every schema hangs off
two stable nodes — `#person` and `#website` — declared once in the root layout
and referenced by `@id` everywhere else, so sibling blobs on one page describe
one entity rather than several near-duplicates a crawler has to reconcile.

| Page      | Emits                                                             |
| --------- | ----------------------------------------------------------------- |
| every     | `Person` + `WebSite` (root layout)                                |
| `/`       | `ProfilePage`, `ItemList` of the open-source work, `EmployeeRole` |
| `/blog`   | `Blog` (with every post inlined), `BreadcrumbList`                |
| `/blog/*` | `BlogPosting`, `BreadcrumbList`                                   |
| `/resume` | `ProfilePage`, `BreadcrumbList`                                   |

`Person` derives from `identity`, `education` and `skills` in `lib/resume.ts` —
never restate a fact here that the résumé also renders, or the two will drift
and disagree in public. Dates go through `isoMonth()`: the résumé's are
`"Sep 2015"`, schema.org wants ISO 8601.

The home page carries the project and employment schemas because it absorbed
`/about` and `/work`. `ItemList` earns its place: "55 public repos" is a number
in a sentence, whereas the list names four repositories in a form an answer
engine can cite.

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
- ❌ Turn `experimental.inlineCss` back on without measuring. It was on, then off: the flag ships the stylesheet twice on first load, and over HTTP/2 that costs more than the request it saves. The numbers are in the comment in `next.config.ts`.
- ❌ Move `gtag.js` back to `afterInteractive`, or delete the head stub. They are one decision — see "Analytics".
- ❌ Add a per-control GA event name. Add a `data-analytics` id under an existing kind.
- ❌ Re-add a `Cache-Control` header for `/_next/static`. Next already sets exactly that, and overriding it earns a build warning.
- ❌ Put `favicon.ico` in `app/`. See "Icons".
- ❌ Fetch Anek Kannada from Google again. It is self-hosted and subsetted on purpose — see "Fonts on the wire".

---

## Related

| Topic                                        | File                             |
| -------------------------------------------- | -------------------------------- |
| Brand voice, tone, audience, "what to avoid" | [.impeccable.md](.impeccable.md) |
| Site overview (human-readable)               | [README.md](README.md)           |
