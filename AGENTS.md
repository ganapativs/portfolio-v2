<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

Next.js **16.2** + React **19.2** + Tailwind **v4** in this repo. APIs, conventions, and file structure may differ from your training data. Before writing Next.js or React code, **read the relevant guide in `node_modules/next/dist/docs/`** and heed deprecation notices. Do not invent options or import paths from memory.

<!-- END:nextjs-agent-rules -->

---

## What the site is

**The Schematic.** One sheet of an engineering drawing, alive: registration
ticks at the corners, a measuring edge down the left, a Bayer-dither light under
the cursor, drafting amber as the default ink, and a title block for a footer.
Six inks, two grounds, and nothing else adjustable.

The home page is six figures, a parts list and a revisions list. Every figure is
the real thing rather than a picture of it — fig. 2 is the shipped
`@microcharts/react` components, fig. 4 is the actual `react-spectrum` package
running.

The previous design ("the press": oyster paper, a dock, press runs, Anek +
Piazzolla) was **deleted, not archived**. It is in git history. Do not
resurrect any of it.

---

## ⚠️ Sync mandate (read first)

**When you change a watched surface, update this file in the same change.**
Stale agent rules lie. The pairs that actually break:

- **`styles/press/tokens.css` colours ⇆ the flat hex mirrors in `lib/ink.ts`**
  (`INK_HEX`, `INK_HEX_DARK`, `SURFACE_HEX`) ⇆ this file's ink and surface
  tables. satori resolves neither custom properties nor `oklch()`, so the OG
  cards, the PNG icon family and the SVG favicon all read the mirror. Nothing
  fails when they drift; the share card just prints last month's ink.
- **Ink ids** in `lib/ink.ts` ⇆ `[data-ink=…]` in `tokens.css` ⇆ the validation
  regex in the no-flash script in `app/layout.tsx` ⇆ the literal ids in
  `app/icon.tsx`, `lib/icon-png.tsx`, `app/opengraph-image.tsx`,
  `app/(press)/blog/opengraph-image.tsx`, `app/(press)/resume/opengraph-image.tsx`
  and the per-post `accent` in `lib/posts.ts`. Renaming an ink touches all of
  them, and **the regex fails silently** — a miss falls back to `amber` rather
  than throwing, so it reads as a forgetful browser, not as a bug.
- **The `--sw-<id>` names in `tokens.css` ⇆ `InkSwatch` in
  `components/schematic/Header.tsx`**, which paints each swatch with
  `style={{ color: "var(--sw-" + id + ")" }}`. This is the only place a
  component reaches for a token by constructed name. Rename the tokens and the
  six swatches go transparent.
- **The surface tokens ⇆ the two ground hexes inlined in the no-flash script and
  in `themeColor`** (`app/layout.tsx`) — they paint the canvas before any
  stylesheet is parsed — **⇆ the print palette in `styles/press/resume.css`**.
- `app/**/page.tsx` route changes ⇆ this file's route map ⇆ `app/sitemap.ts` ⇆
  `app/llms.txt/route.ts`.
- `next.config.ts` (headers, redirects, rewrites, experimental flags, image
  config) ⇆ this file.
- `lib/posts.ts` ⇆ the loader map in `app/(press)/blog/[slug]/page.tsx` (the
  build fails loudly if they drift).
- `lib/resume.ts` `skills` ⇆ the `MATERIALS` list in `app/(press)/content.ts`
  (throws at module load if a name is renamed).
- **Every number about the public work comes from `PUBLIC_WORK` in
  `lib/resume.ts`**, and the star total and repo count are read live through
  `lib/github.ts` where a page can await it. Four surfaces used to print
  hand-typed copies and they were wrong: 55 repos (it is 38 original, 194
  including forks) and 15 npm packages (16). The comment in `resume.ts` carries
  the two API calls that verify them.
- **The one-line bio is `BIO` in `lib/resume.ts`**, printed by
  `app/layout.tsx`'s description, `app/manifest.ts`, `personSchema` in
  `lib/jsonld.tsx` and `app/llms.txt/route.ts`. As four hand-typed copies, three
  of them claimed he joined Tracxn as an intern. He did not: the internship was
  at Thinkappz in 2013, and Tracxn was 2015 as a software engineer.
- **`CAREER_YEARS` in `lib/resume.ts`** is the only place the career length is
  written. The home page, the portrait's height dimension, the pipeline card,
  both OG titles and llms.txt all read it. It is a checked constant rather than
  an age computed from a date, because the value is rendered on the server and
  again on the client and one that turned over between build and visit would be
  a hydration mismatch. Bump it each July.
- `app/manifest.ts` `screenshots` sizes ⇆ the dimensions
  `scripts/gen-pwa-screenshots.sh` captures (a mismatch silently drops the rich
  install dialog).
- The mark's paths in `lib/mark.ts` ⇆ the committed `public/favicon.ico`
  (regenerate with `pnpm build && pnpm gen:favicon`).
- `data-analytics` attributes ⇆ the kinds `ClickCapture` parses in
  `components/Analytics.tsx` — an unknown kind is silently dropped, not an error.
- `data-sec="<label>"` **plus an `id`** on a section ⇆ `components/schematic/Ruler.tsx`,
  which reads them off the DOM. A `data-sec` with no `id` is filtered out and
  the section gets no tick.

### Pairs that used to exist and deliberately do not any more

Do not reintroduce these, and do not "restore" doc text describing them.

- **There is no second copy of the palette.** The six inks live once, as
  `--sw-*`, and `--accent` is aliased to the active one. That indirection exists
  precisely so the header's picker — which must paint all six at once and cannot
  read `--accent` — needs no hand-maintained duplicate.
- **The palette is not duplicated between CSS and TypeScript.** `lib/ink.ts`
  carries ids, labels, pitches and the flat hex mirrors for the renderers that
  cannot read CSS. It carries no live colour.
- **There is no press run / `data-mode` / `mg_mode` axis.** Six inks, two
  grounds, no third dimension.

---

## Stack snapshot

| Slot            | Version                        | Notes                                                                                                                                                                                               |
| --------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js         | 16.2.12                        | App Router, **`--webpack` build** (not Turbopack), MDX via `@next/mdx`                                                                                                                              |
| React           | 19.2.8                         | `<ViewTransition>` from `react`, `experimental.viewTransition` enabled                                                                                                                              |
| TypeScript      | ^6                             | strict, `target: ES2017`, `moduleResolution: bundler`, `@/*` → repo root                                                                                                                            |
| Tailwind CSS    | ^4                             | CSS-only config (no `tailwind.config.*`)                                                                                                                                                            |
| Linter          | oxlint ^1.76                   | Rust-based; do NOT add ESLint                                                                                                                                                                       |
| Formatter       | oxfmt ^0.61                    | Rust-based; do NOT add Prettier                                                                                                                                                                     |
| Package manager | pnpm                           | `pnpm-lock.yaml` committed; never `npm`/`yarn`/`bun`                                                                                                                                                |
| MDX             | @next/mdx ^16.2                | `remark-gfm`, `remark-smartypants`, `rehype-slug`, `rehype-autolink-headings`, `rehype-highlight`                                                                                                   |
| Charts          | @microcharts/react ^0.11       | **No longer blog-only** — fig. 2 on the home sheet is a tray of them. Tokens bridged at `:root` in `styles/press/tokens.css` (`--mc-*`), not at `.prose`                                            |
| Sweep           | glimm ^0.3                     | The WebGL band that carries every palette change. `GlimmProvider` is the outermost provider; see "Sweep contract"                                                                                   |
| Live specimen   | react-spectrum ^1.3            | His own 2019 package, running in fig. 4. **Imported by ESM file path** with a type shim at the repo root — see the trap below                                                                       |
| Dialog          | @base-ui/react ^1.6            | One use: the `?` shortcut help sheet (`components/shortcuts/ShortcutHelp.tsx`)                                                                                                                      |
| Fonts           | next/font                      | Hanken Grotesk + IBM Plex Mono from Google. Anek Kannada is **self-hosted and subsetted**. `@fontsource/hanken-grotesk` and `@fontsource/ibm-plex-mono` exist so the OG renderer can read raw files |
| Browsers        | `browserslist` in package.json | Chrome/Edge 111, Firefox 128, Safari/iOS 16.4. Not arbitrary: the design is built on `oklch()`, `color-mix()` and `@property`, none of which exist below it                                         |

### Two dependency traps

- **`react-spectrum` is imported as `react-spectrum/dist/react-spectrum.es.js`,
  not by its bare name.** The package declares `"type": "module"` but points
  `main` at a CommonJS file that does `module.exports = Component` with no
  `__esModule` marker; the bundler wraps `require("react")` in a synthetic
  namespace and `React.memo` throws `n.memo is not a function` at runtime. There
  is no `exports` map, so the file path is legal. `react-spectrum.d.ts` at the
  repo root declares that module path, because the package's own `types` entry
  does not cover it. **Do not "clean up" the import.**
- **glimm's midpoint is rAF-driven, so `lib/sweep.ts` guards it.** A browser
  freezes `requestAnimationFrame` in a hidden tab: a reader who flipped the
  paper and immediately switched tabs came back to the old theme, because the
  band suspended before its midpoint and the swap never ran. `sweepApply()`
  fires the change on whichever comes first, the midpoint or a 1.2 s timer, and
  makes `apply` idempotent. **Never call `sweep()` directly for a state change.**

---

## Repo layout

```
app/
  layout.tsx         Root: <html>, fonts, no-flash script, gtag stub, providers, analytics.
                     Imports styles/press.css — the only global stylesheet the live site loads.
  (press)/           THE SITE. Route group, so it can own the sheet without owning a URL segment.
    layout.tsx       <Sheet> + <main> + <ViewTransition name="route">. Nothing else.
    page.tsx         Home — six figures. content.ts beside it holds the copy and the data.
    blog/, resume/   See route map.
  error.tsx          Renders <Sheet> itself: it lives outside the (press) group.
  not-found.tsx      Same.
components/
  schematic/         The design. Sheet, Header, Ruler, DitherField, TitleBlock, PageFX, Mark,
                     Portrait, Exploded, Loupe, Specimens, SpectrumDemo, SgbFigure, Career,
                     PartsList, Pipeline, CopyEmail, Socials, EssayShell, PrintCV, and three
                     hooks: useDrawOnFirstView, useCoarsePointer, useReducedMotion
                     (which also exports `approach`, the frame-rate-independent lerp every
                     eased follow on the site uses — see "Motion" below)
  providers/         SweepProvider, ThemeProvider, FXProvider, InkProvider
  shortcuts/         ShortcutProvider, HintLayer, KeyGlyph, useShortcut, shortcuts.css, and
                     ShortcutHelp — a gate whose only job is to next/dynamic the real sheet
                     in ShortcutHelpSheet.tsx. @base-ui/react/dialog is 25 kB gzipped, which
                     was 14% of every page's JS for a panel most readers never open.
  mdx/               CanIUse, CodeBlock, Iframe, ZoomImage (+ mdx/microcharts/ demos)
  Analytics, WebVitals
mdx-components.tsx   Required by @next/mdx — maps pre→CodeBlock, img→ZoomImage, external links
react-spectrum.d.ts  Type shim for the ESM-file-path import. See the trap above.
content/blog/<slug>/ MDX posts. Body in page.mdx. Metadata is in lib/posts.ts (NOT frontmatter).
public/posts/<slug>/ Cover + inline imagery for each post.
lib/
  ink.ts             The ink system: ids, labels, pitches, hex mirrors, storage keys
  sweep.ts           sweepApply() — the guarded glimm sweep every palette change goes through
  posts.ts           Post metadata — outside the route tree so the pages and the feeds share it
  fonts.ts           The three faces
  mark.ts            The G, as raw path data — the one copy every renderer shares
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
  press/             tokens · base · chrome · home · pipeline · essay ·
                     microcharts-demos · resume · motion
.claude/             Editor/agent config — committed. settings.json wires the PostToolUse
                     oxfmt/oxlint hook; launch.json defines dev-server entries. No secrets.
```

The `styles/press*` paths are historical names kept because renaming them buys
nothing and touches every import. They hold the Schematic.

## Route map

Unchanged from the previous design except that **every page now renders inside
`components/schematic/Sheet.tsx`**.

| Path                                           | File                                                         | What it renders                                                                                                                      |
| ---------------------------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `/`                                            | `app/(press)/page.tsx`                                       | Home — the subject, six figures, parts list, revisions. **Absorbed /about and /work.**                                               |
| `/blog`                                        | `app/(press)/blog/page.tsx`                                  | Index of `published` posts                                                                                                           |
| `/blog/<slug>`                                 | `app/(press)/blog/[slug]/page.tsx`                           | `generateStaticParams` from `published`; loaders are a hardcoded slug→import map                                                     |
| `/blog/<slug>.md`                              | `app/api/blog-md/[slug]/route.ts` + a rewrite in next.config | The post as plain markdown. Static; imports and ESM exports stripped, prose left alone                                               |
| `/resume`                                      | `app/(press)/resume/page.tsx`                                | CV from `lib/resume.ts`, two columns, print stylesheet                                                                               |
| `/about`, `/work`                              | `next.config.ts` redirects                                   | **308 → `/#about`, `/#work`.** Do not re-add these as pages                                                                          |
| `/sitemap.xml`                                 | `app/sitemap.ts`                                             | `/`, `/resume`, `/blog` + every published post. No `/about`, `/work`                                                                 |
| `/robots.txt`                                  | `app/robots.ts`                                              | Allow all except `/api/`; sitemap pointer. The AI crawlers are also allowed **by name** — see the comment there for why              |
| `/manifest.webmanifest`                        | `app/manifest.ts`                                            | PWA shell: five icons, two screenshots, two shortcuts (Writing, Résumé)                                                              |
| `/icon`                                        | `app/icon.tsx`                                               | The tab favicon. SVG, transparent, live ink (**aubergine in dev**, so a dev tab is tellable)                                         |
| `/icon-192`, `/icon-512`, `/icon-512-maskable` | `app/icon-*/route.tsx`                                       | PNG mark on paper via `lib/icon-png.tsx`. 192+512 are Chrome's install requirement; the maskable cut is inset for Android            |
| `/apple-icon`                                  | `app/apple-icon.tsx`                                         | 180×180 home-screen tile, same renderer                                                                                              |
| `/favicon.ico`                                 | `public/favicon.ico`                                         | Committed 16/32/48 raster for legacy probes + Google's SERP favicon. **In `public/`, not `app/`** — see the note in `app/layout.tsx` |
| `/rss.xml`                                     | `app/rss.xml/route.ts`                                       | RSS 2.0 feed of `published` posts                                                                                                    |
| `/llms.txt`                                    | `app/llms.txt/route.ts`                                      | Curated plain-text site map for AI systems; links each post's `.md` mirror                                                           |
| `/api/vitals`                                  | `app/api/vitals/route.ts`                                    | Edge runtime — receives next/web-vitals beacons                                                                                      |
| `/opengraph-image*`                            | `app/**/opengraph-image.tsx`                                 | Per-route OG cards, all through `lib/og.tsx`. Home `amber`, blog and résumé `dustblue`                                               |
| `error`                                        | `app/error.tsx`                                              | Root error boundary. Outside the (press) group, so it mounts `<Sheet>` itself                                                        |
| `not-found`                                    | `app/not-found.tsx`, `app/(press)/blog/[slug]/not-found.tsx` | 404 (`robots: { index: false }`). The global one also mounts `<Sheet>` itself                                                        |

### The sheet

`components/schematic/Sheet.tsx` is the chrome every page shares: the dither
field, the ruler, the skip link, the four corner registration ticks, the four
frame masks that wipe off one edge at a time in the first 400 ms, the header,
the children, the title block, and `<PageFX />`.

`PageFX` is two page-wide delegated listeners with no element of their own: the
panels' hex-mesh cursor mask, and the sound layer (hover tick, button
press/release). **Delegated on purpose** — a new control is audible the moment
it exists rather than when someone remembers to wire it.

## Provider stack

Root (`app/layout.tsx`) owns everything:

```
<SweepProvider>             // glimm. Outermost, because both providers below hand it their swap.
  <ThemeProvider>           // theme + toggle(origin?). mg_theme.
    <FXProvider>            // WebAudio cue set + haptic. mg_sound.
      <ShortcutProvider>    // keyboard registry. ? = help, Esc = close. Scope stack: global|modal|page.
        <InkProvider>       // ink. mg_ink. Stamps data-ink and nothing else.
          {children}
          <HintLayer /> <ShortcutHelp />
```

`InkProvider` is inside `FXProvider` because a pick plays that ink's pitch.
`SweepProvider` builds no WebGL context until the first sweep, so a reader who
never touches the palette pays nothing for it.

`app/(press)/layout.tsx` adds only `<Sheet>`, `<main id="main-content">` and
`<ViewTransition name="route">`.

Plus `<WebVitals />` outside the providers; reports CLS/FCP/LCP/TTFB/INP to
`/api/vitals` **and** to GA4 as one event per metric (CLS scaled ×1000 — GA4
rounds `value` to an integer and would otherwise record 0 every time).

Plus `<Analytics />` outside the providers. See below.

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
   paint, so an event fired by a click that lands before the 155 kB library does
   queues on `dataLayer` instead of vanishing into `window.gtag?.()`.
2. **`gtag.js` loads `lazyOnload`.** `afterInteractive` makes Next emit a
   high-priority `<link rel="preload" as="script">` for it, which races the
   page's own fonts and pushes LCP out. The stub above is what makes the late
   load free.
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

| Kind    | Use for                             | Example                                          |
| ------- | ----------------------------------- | ------------------------------------------------ |
| `nav:`  | in-site navigation the reader chose | `nav:header.writing`, `nav:home.revision.<slug>` |
| `cta:`  | a named content link                | `cta:project.microcharts`, `cta:part.<name>`     |
| `feed:` | a machine-readable surface          | `feed:rss`, `feed:llms`, `feed:markdown`         |
| `mail:` | a mailto worth naming               | `mail:title-block`, `mail:resume`                |

On top of that, and without any attribute: **any link leaving the origin** is
reported as `outbound`, and any bare `mailto:` as a contact. Nothing else fires
— this does not log every click on the page.

Interactions that are not links report through `track()` directly, each from the
one place that knows the truth: theme from `ThemeProvider`'s sync effect (which
alone knows the value that won, and whether an origin means pointer or
keyboard), ink from `InkProvider`, keyboard shortcuts from `ShortcutProvider`'s
keydown (so a key press is distinguishable from a click on the control it shares
a handler with), plus `sound`, `help`, `print_cv`, `copy` and `zoom_image`.

**Adding a control does not mean adding an event name.** A new header link is a
new `nav` id. GA4 caps custom event names at 500 and per-control names burn that
budget for no analytical gain.

## Keyboard map

Registered by the components themselves, so the Shift-hold hints float over the
real control.

| Key     | Does                   | Registered in                         |
| ------- | ---------------------- | ------------------------------------- |
| `h`     | home                   | `schematic/Header.tsx`                |
| `b`     | writing                | `schematic/Header.tsx`                |
| `r`     | résumé                 | `schematic/Header.tsx`                |
| `t`     | switch the paper       | `schematic/Header.tsx`                |
| `m`     | mute / unmute          | `schematic/Header.tsx`                |
| `1`–`6` | pick an ink            | `InkSwatch` in `Header.tsx`           |
| `e`     | copy the email address | `schematic/CopyEmail.tsx` (home only) |
| `?`     | the help sheet         | `shortcuts/ShortcutHelp.tsx`          |
| `Esc`   | close the help sheet   | `shortcuts/ShortcutHelp.tsx`          |

There is no `0` and no `w`/`a`. The résumé now has a real header link, so `r`
floats a hint like every other key.

The registry refuses duplicate keys within a scope and warns in development.
`silent: true` on a shortcut means it plays its own cue instead of the
registry's generic tick — the six inks use it, because each plays its own pitch.

## Static files in `public/`

`favicon.ico` (committed; `pnpm gen:favicon`), `humans.txt` (linked from `<link
rel="author">` in `app/layout.tsx`), `BingSiteAuth.xml`, IndexNow key
`mgindexnow7k2p9xq4m8n1w5e3r6t.txt`, `brand/` (wordmark, logo, monogram +
`screenshot-wide.png` / `screenshot-narrow.png` for the manifest), `portrait/`,
`posts/`.

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

Three faces, and which of them is _preloaded_ is a decision, not a default —
preloads are high priority and they compete with each other for the same pipe.

| Face           | Source                    | Preload | Notes                                               |
| -------------- | ------------------------- | ------- | --------------------------------------------------- |
| Hanken Grotesk | next/font/google          | yes     | 400 / 500 / 600 / 700. Everything set as language   |
| IBM Plex Mono  | next/font/google          | **no**  | 400 / 500. Everything set as a measurement          |
| Anek Kannada   | **self-hosted, `fonts/`** | yes     | 9.7 kB, cut to eleven characters. `weight: 100 800` |

- **Plex Mono's preload is off on purpose.** It sets the drawing's annotations —
  ruler ticks, dimensions, the title block — none of which is the LCP element on
  any viewport, and a preload there competes with Hanken for the same pipe. The
  annotations arriving a beat after the prose is the correct order.
- **Anek Kannada is subsetted to the eleven characters of ಗಣಪತಿ ವಿ ಎಸ್** by
  `scripts/subset-kannada.py` (`pnpm gen:kannada-subset`). Google's Kannada block
  is 111 kB and the header carries the name on every page, so it was 111 kB at
  font priority, forever, to set one string. The cut keeps the weight axis and
  the full Kannada shaping feature set — subsetting on codepoints alone would
  drop the conjunct forms and render the name wrong.
- **The acceptance test is a measured width, not a look.** The cut must set the
  name at exactly the same width as the un-subsetted face — load both as
  `FontFace`s and compare at 400/500/600. A broken cut reads as "slightly loose"
  and passes a visual check every time; one already shipped ~13% wide before the
  GDEF problem below was found.
- **The subset carries a synthesised GDEF `GlyphClassDef`, and it has to.** Anek
  draws ತ + ಿ as one glyph through a `psts` ligature lookup flagged
  `IgnoreMarks`. That works in the full face only because its GDEF classifies
  twenty unrelated glyphs and leaves ಿ unclassified — class 0, not a mark. None
  of those twenty survive the cut, so fontTools drops the ClassDef, HarfBuzz
  falls back to Unicode category (U+0CBF is `Mn`), the flag skips the matra and
  the vowel signs render loose beside their bases. `keep_gdef_alive()` in the
  script puts the table back. Re-check with `hb-shape` after any change: the
  name must shape to **nine** glyphs, not eleven.
- **`--f-kannada` lists Anek Kannada _first_, then the Latin face. Leave it.**
  Reversing it looks free — it stops Anek Kannada being fetched for the spaces
  in the name. It is not free: the two faces do not share a word-space advance,
  and Latin-first sets the name measurably narrow. Correct setting wins; the cut
  is 9.7 kB either way.
- **`@fontsource/hanken-grotesk` and `@fontsource/ibm-plex-mono` are not the
  site's fonts.** They are devDependencies that exist only so `lib/og.tsx` can
  `readFile` the raw `.woff` at render time — next/font keeps its copies inside
  the build output where a render-time read cannot reach them.

## Persistence keys (localStorage)

| Key        | Values                             | Owner                            |
| ---------- | ---------------------------------- | -------------------------------- |
| `mg_theme` | `"light" \| "dark"`                | `ThemeProvider`, no-flash script |
| `mg_ink`   | ink id from `lib/ink.ts`           | `InkProvider`, no-flash script   |
| `mg_sound` | `"0"` muted, anything else unmuted | `FXProvider`                     |

Three keys. `mg_mode` is gone with the press runs. All reads and writes are
wrapped in `try/catch` — storage may be unavailable.

---

## The ink system

**Nothing writes a colour from JavaScript.** The whole palette lives in
`styles/press/tokens.css`, keyed on two attributes stamped on `<html>`:
`data-theme` (`light`/`dark`) and `data-ink` (six ids). The no-flash script
writes exactly those two plus the inline ground colour, and nothing else.

`--accent` is registered with `@property { syntax: "<color>" }`. That is what
makes an ink change a real 340 ms interpolation rather than a hard swap —
unregistered custom properties are token streams and cannot be transitioned.

The six live as `--sw-<id>` and `--accent` is aliased to the active one. The
derived weights are plain `color-mix()` properties rather than registered ones,
on purpose: `color-mix()` re-evaluates every frame as `--accent` tweens, so they
travel with it for free and there is one value to maintain per ink instead of
four.

```
--accent        the ink itself
--accent-soft   color-mix(… 10%, transparent) — washes, hover rows, ::selection
--accent-line   color-mix(… 45%, transparent) — a rule that carries the ink
```

`lib/ink.ts` carries flat hex mirrors (`INK_HEX`, `INK_HEX_DARK`,
`SURFACE_HEX`) for the edge renderers and the portrait canvas, which resolve
neither custom properties nor `oklch()`. **Change a colour in the CSS, change
its mirror.**

### The six inks (`styles/press/tokens.css` ⇆ `lib/ink.ts`)

| ID                | Label          | Light (`--sw-*`)      | Dark (`--sw-*`)       | Mirror light / dark   | Hz  |
| ----------------- | -------------- | --------------------- | --------------------- | --------------------- | --- |
| `amber` (default) | drafting amber | `#8f5c0c`             | `#d9962b`             | `#8f5c0c` / `#d9962b` | 440 |
| `bottle`          | bottle green   | `oklch(.45 .095 158)` | `oklch(.75 .092 154)` | `#176540` / `#7fbf93` | 492 |
| `oxblood`         | oxblood        | `oklch(.46 .115 25)`  | `oklch(.73 .11 29)`   | `#8d3936` / `#e58c7f` | 544 |
| `dustblue`        | dust blue      | `oklch(.47 .08 240)`  | `oklch(.75 .075 245)` | `#2b6083` / `#86b3db` | 596 |
| `aubergine`       | aubergine      | `oklch(.44 .112 316)` | `oklch(.72 .105 320)` | `#6a3c7c` / `#c28fce` | 648 |
| `slate`           | slate          | `oklch(.46 .05 250)`  | `oklch(.75 .045 250)` | `#435a73` / `#99b1ca` | 700 |

`brass` and `umber` are **gone**. Do not reintroduce them.

The Hz column is the pitch the picker plucks on a pick. The six rise linearly by
52 Hz, so playing the tray left to right is a rising run — that is the point of
having six.

Two rules govern the pairs, and neither is arithmetic:

1. **The dark value is not the light value lightened.** Amber goes from a burnt
   `#8F5C0C` on paper to a brighter, yellower `#D9962B` on graphite, because a
   dark ground swallows chroma and a lit amber has to shout a little to stay
   amber. Every pair moves in hue, not only in lightness.
2. **Every pair clears AA against its own ground as text** (the weakest is amber
   on paper at 5.11:1) and 3:1 as a line. The palette is checked as type, not as
   swatches, because `--accent` sets live values and actions.

**Amber is the default and it is a material, not a hue.** It is the colour of a
hard pencil on tracing paper, which is the one thing on the list that makes the
drawing read as a drawing. The other five are pigments a drawing office would
actually have had.

**These are pigments, not signals.** The six accents on `microcharts.dev` — the
sibling property — are near-equiluminant, because chart series must be or one
shouts over another. A drawing has the opposite job. Do not harmonise this
palette toward microcharts' accents. That is also why the `--mc-*` bridge in
`tokens.css` binds ink, surface and type to the drawing's tokens but leaves
valence and the categorical hues at their own values.

### Surfaces

Light is **warm drawing paper**: an off-white with the yellow of aged tracing
stock, ruled in a dusty ochre-grey. Dark is **graphite**: a cool near-black with
a blue cast, ruled in the grey the pencil leaves.

| Token      | Light     | Dark      |
| ---------- | --------- | --------- |
| `--paper`  | `#f5f3ec` | `#131417` |
| `--raise`  | `#faf8f1` | `#191b1f` |
| `--sunk`   | `#f0ede2` | `#15171b` |
| `--ink`    | `#1d1e1a` | `#e8e9e4` |
| `--ink-2`  | `#42433c` | `#b6b9bd` |
| `--ink-3`  | `#68695f` | `#8e9299` |
| `--rule-3` | `#e6e1d2` | `#23262b` |
| `--rule`   | `#cfc9b6` | `#2e3238` |
| `--rule-2` | `#98937f` | `#4c525c` |

**The two are not inversions of one another.** The light ramp warms as it
darkens (paper is warm and the line on it is warmer still); the dark ramp cools
as it lightens. That is why the dark run reads as a different material rather
than as the light run with the lamp off.

`--rule-3 / --rule / --rule-2` are the three line weights — 0.75px faint, 1px
standard, 1.5px emphasised. **Depth is line weight, never shadow.** There is not
one `box-shadow` in the design, and `--shadow-sm` / `--shadow-xl` in the bridge
block are literally `none`.

### The shared-component bridge

The bottom of `tokens.css` maps an older set of token names (`--bg-surface`,
`--fg-1`, `--r-block`, `--font-display`, `--khadi`, …) onto the drawing's
values, so `shortcuts.css`, `essay.css` and `microcharts-demos.css` inherit the
ink, the ground and the type unchanged. **Those aliases are live, not
leftovers** — every one is referenced by a real rule. Deleting one breaks
something.

---

## Type, space, motion

**Faces** (`lib/fonts.ts`), and the split is the whole type system:

- `--f-sans` **Hanken Grotesk** — everything set as _language_: prose, headings,
  navigation.
- `--f-mono` **IBM Plex Mono** — everything set as a _measurement_: dimensions,
  years, counts, part numbers, the labels on the drawing. Tabular everywhere.
- `--f-kannada` **Anek Kannada** — ಗಣಪತಿ ವಿ ಎಸ್, and only that.

A drawing distinguishes what is written on it from what is measured on it, and
the reader can tell which is which before reading either. `--f-serif` exists
only as a bridge alias pointing at `--f-sans`; there is no serif on this site.

**Scale**, ratio 1.25: `12 · 15 · 19 · 24 · 30 · 37 · 46 · 58` (`--t-1` … `--t-8`).
**Spacing**: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 144` (`--s-1` … `--s-10`).
**Measures**: `--w-sheet 1040px` the drawing, `--w-essay 760px` the reading
measure, `--sheet-margin 24px`, `--gutter 32px`.

**Radius — three values, each with a job.** `--r-rule 0` is drawing geometry:
every rule, panel, slab and axis. `--r-chip 2px` is a touched thing: chips,
buttons, swatches, kbd. `--r-point 50%` is a point: the loupe, station dots, the
portrait ripple. **There is no third box radius. A drawing has no rounded
corners.**

**Motion**: `--dur-fast 140ms` hover and focus · `--dur-base 260ms` everything
the reader caused · `--dur-ink 340ms` the coordinated ink tween · the palette
sweep at 640ms + 300ms, which lives in `SweepProvider.tsx` rather than in a
token because it belongs to the library that draws it. Easings:
`--ease-out cubic-bezier(.22,1,.36,1)`, `--ease-in-out
cubic-bezier(.65,0,.35,1)`. Direct manipulation has no duration at all, because
the hand sets it. (`--dur-iris` and `--vt-r-now` are still declared in
`tokens.css` but only the dead `.vt-recolor-radial` block in `base.css` reads
them; the sweep replaced that. Do not build on them.)

### The motion law (`styles/press/motion.css`)

Motion is reserved for things the reader caused — a hover, a drag, an ink pick,
a route swap — with **three sanctioned one-shot exceptions**, all of them about
the drawing drawing itself:

1. the sheet frame ruling itself in, once, in the first 400 ms of the page;
2. a figure drawing its own lines the first time it comes into view
   (`useDrawOnFirstView` — it drives a `stroke-dashoffset`, not an opacity, and
   the figure is fully readable before and after);
3. the pipeline playing one pass through its stages the first time it is seen.

Each happens once per load and never again, and each is interruptible by
touching the thing it is happening to. **There is no scroll-reveal. Do not
introduce one.**

### `<html>` data attributes

| Attribute                  | Set by                     | Triggers           |
| -------------------------- | -------------------------- | ------------------ |
| `data-theme="light\|dark"` | no-flash → `ThemeProvider` | Every dark surface |
| `data-ink="<id>"`          | no-flash → `InkProvider`   | The active ink     |

Those two and nothing else, plus the inline ground colour and `colorScheme`.
`data-mode` is gone.

---

## Sweep contract

Replaces the old view-transition contract. **The clip-path iris is gone.**

1. **Route nav** uses `<ViewTransition name="route">` in
   `app/(press)/layout.tsx`, with its own quiet crossfade. **The `root` group is
   explicitly not animated** (`base.css`): everything outside the routed content
   — header, measuring edge, title block — lands in `root`, and the API's
   default crossfade dipped two identical headers through a pair of half-opaque
   copies. It read as the ink bar under the G blinking out and back on every
   navigation.
2. **Both palette changes — theme and ink — go through `sweepApply()` in
   `lib/sweep.ts`**, which hands the state swap to glimm. glimm draws one WebGL
   band across the viewport and applies the change underneath it at the
   midpoint. A circle opening from a control said "this control did it"; a band
   passing over the sheet says what actually happened, which is a roller laying
   down new ink.
3. **The band is painted with the ink in play.** A theme flip sweeps the active
   ink between its two grounds; an ink pick sweeps from the ink being replaced
   to the one replacing it, so the sweep _is_ the interpolation rather than
   something laid over one.
4. **Direction says how it was done.** `ltr` when a pointer landed on a control,
   `ttb` from the keyboard. A number key has no position on the page, and a
   different axis is a more honest way to say so than a wipe pretending to start
   somewhere.
5. **The swap is fired by whichever comes first, the midpoint or a 1.2 s
   guard**, and `apply` is idempotent so it cannot run twice. See the glimm trap
   in "Stack snapshot" for why the guard is not optional.
6. **Reduced motion**: glimm's own `reducedMotion: "instant"` default is left
   alone, and `motion.css` kills the `--accent` transition. The ink arrives
   rather than travelling.

`SweepProvider`'s settings are all decisions, documented in the file:
`sweepMs 640` / `outroMs 300` / `midpoint 0.42` is the one place the motion law
is deliberately exceeded, because this is the whole sheet being re-inked rather
than a control answering, and at 380ms the band was over before the eye found
it; `waveAmount 0` and a tight band because this site is drawn with a
straightedge; `brightness` and `peakAlpha` pulled down because at the library's
defaults the band blew out to near-white on graphite, which is the one colour
the palette does not contain.

---

## When you write code

- Server Components by default. Add `"use client"` only when you need state,
  effects, refs, or browser APIs.
- Imports use `@/*` for anything outside the current folder. Don't reach into
  `.claude/`.
- Prefer `next/image` with the configured formats (`avif`, `webp`) and qualities
  (`70 | 80 | 90`).
- New entry-style files (sitemap, manifest, OG, route handlers, error/not-found)
  are caught by the existing `knip.json` `entry` glob.
- Don't add new top-level dependencies casually. Check `package.json` and
  `knip.json` first.
- For a new MDX post: drop `content/blog/<slug>/page.mdx`, add a row to
  `lib/posts.ts` (including its `accent`), add a loader to
  `app/(press)/blog/[slug]/page.tsx`. `generateStaticParams` throws at build
  time if you forget the loader, and the `.md` mirror + RSS + sitemap + llms.txt
  all pick it up on their own.
- Every real page belongs under `app/(press)/`. There is one design and one
  stylesheet entry point (`styles/press.css`). A page that must live outside the
  group — `error.tsx`, `not-found.tsx` — mounts `<Sheet>` itself.
- A new section wants `data-sec="<label>"` **and** an `id`, or the ruler will
  not tick it.
- **A caption slot that swaps text keys its content and lets the slot animate
  its height.** `interpolate-size: allow-keywords` is set on `:root` in
  `tokens.css`; `.xp-cap` / `.tl-cap` transition `height`, and the inner
  `.cap-in` element carries a React `key` so it remounts and replays its fade.
  Without both halves the swap reads as a flicker: the height snaps and the
  text cuts.
- **Never combine `pathLength` with `vector-effect: non-scaling-stroke` on a
  dash-drawn path.** `pathLength` normalises the dash pattern to the path's own
  length, but `non-scaling-stroke` moves dash computation into screen space, so
  `stroke-dasharray: 1` becomes one CSS pixel and the figure prints as a field
  of 1px dashes. It is silent: the drawing simply looks like a scribble. Fig.
  1's glyphs fade in instead (`.willdraw .glyph`, `home.css`).
- **A glyph drawn on an isometric face is built from that face's two axes.**
  The projection in `Exploded.tsx` turns a horizontal into a line sloping
  down-right and a vertical into one sloping down-left. Rectangles and axis-
  parallel runs read as figures lying on the surface; free angles and curves
  close up into mush. Two sets of symbols were lost to this before the rule was
  written down.
- **The portrait renders a real `next/image` on the server and hides it only
  once the halftone canvas has actually drawn.** Keep it that way — a bare
  canvas has no `alt` and nothing for a crawler.
- Numbers on the page are checked and, where the résumé also states them, pulled
  from `lib/resume.ts` rather than retyped. Do not add a number you cannot
  verify.

## Structured data

`lib/jsonld.tsx` is the only place JSON-LD is written. Every schema hangs off two
stable nodes — `#person` and `#website` — declared once in the root layout and
referenced by `@id` everywhere else, so sibling blobs on one page describe one
entity rather than several near-duplicates a crawler has to reconcile.

| Page      | Emits                                                             |
| --------- | ----------------------------------------------------------------- |
| every     | `Person` + `WebSite` (root layout)                                |
| `/`       | `ProfilePage`, `ItemList` of the open-source work, `EmployeeRole` |
| `/blog`   | `Blog` (with every post inlined), `BreadcrumbList`                |
| `/blog/*` | `BlogPosting`, `BreadcrumbList`                                   |
| `/resume` | `ProfilePage`, `BreadcrumbList`                                   |

`Person` derives from `identity`, `education` and `skills` in `lib/resume.ts` —
never restate a fact here that the résumé also renders, or the two will drift and
disagree in public. Dates go through `isoMonth()`: the résumé's are `"Sep 2015"`,
schema.org wants ISO 8601.

The home page carries the project and employment schemas because it absorbed
`/about` and `/work`. `ItemList` earns its place: "55 public repos" is a number
in a sentence, whereas the list names four repositories in a form an answer
engine can cite.

## Bundle shape, and one framework leak

Three of the home page's figures are behind `next/dynamic` in
`app/(press)/page.tsx`: the specimen tray (25 static chart builds so a shuffle
can pick eight), the pipeline, and the loupe. `ssr` stays ON for all three.
Specimens renders a fixed first eight on the server before it reshuffles, the
pipeline's server markup IS its no-flash guarantee (the sketch state in the
markup equals the state the JS initialises to), and the loupe's sentence is
content.

The reason they are split is a Next 16 behaviour worth knowing about. The
`next/link` client module is recorded in each route's
`page_client-reference-manifest.js` against the HOME page's chunk group, so
every route that renders a `<Link>` — which is every route, via the header —
emits the home page's script tags. Measured before the split: `/resume`
downloaded and executed 60 kB gzipped of home-page chunks and rendered none of
them, and a blog post containing zero charts shipped the whole chart library.
Splitting the figures does not fix the leak; it makes the leak cheap. If you add
a heavy client component to the home page, put it behind `next/dynamic` too, or
every other route pays for it.

Measured first-load JS, gzip, excluding the `noModule` polyfill nothing at the
browserslist floor fetches: `/` 216 kB, `/blog` 159 kB, `/resume` 218 kB, a
blog post 223 kB.

## What NOT to do

- ❌ Add ESLint, Prettier, Stylelint, Husky, or their configs.
- ❌ Run `npm` / `yarn` / `bun`. pnpm only.
- ❌ Introduce a `tailwind.config.js` — Tailwind v4 config is in CSS.
- ❌ Hardcode hex / px / cubic-bezier in components. Use tokens.
- ❌ Break the no-flash script in `app/layout.tsx`. It stamps `data-theme` and `data-ink` before first paint; everything downstream assumes they are there.
- ❌ Set a colour token from JavaScript. If you reach for `style.setProperty("--accent", …)`, add a CSS rule instead. The one legal construction is `var(--sw-<id>)` in the header's swatches.
- ❌ Add a second copy of the palette. `--sw-*` exists so the picker does not need one.
- ❌ Change a colour in `styles/press/tokens.css` without updating its hex mirror in `lib/ink.ts` — the OG cards and the icons read the mirror.
- ❌ Reintroduce press runs, `data-mode`, `mg_mode`, or a third palette axis.
- ❌ Reintroduce the clip-path iris, `lib/vt.ts`, or `withViewTransition`. Palette changes go through `sweepApply()`.
- ❌ Call glimm's `sweep()` directly for a state change. Use `sweepApply()`, or a hidden tab eats the swap.
- ❌ Import `react-spectrum` by its bare name, or delete `react-spectrum.d.ts`.
- ❌ Add a rounded corner that is not `--r-chip` or `--r-point`, or a `box-shadow`. Depth is line weight.
- ❌ Ship anything at `opacity: 0` waiting for a scroll. The three one-shot draw-ins in `motion.css` are the whole allowance.
- ❌ Bypass pre-commit hooks (`--no-verify`).
- ❌ Trust your training-era memory of Next.js APIs. Open `node_modules/next/dist/docs/` first.
- ❌ Replace `Array.prototype.toSorted()` with `.sort()` — it's intentional.
- ❌ Use `prefers-color-scheme: dark` to gate styles. Theme is user-controlled via `data-theme="dark"`.
- ❌ Add markdown frontmatter to MDX posts. Metadata lives in `lib/posts.ts`.
- ❌ Re-add `/about` or `/work` as pages. The home page absorbed both and `next.config.ts` redirects them.
- ❌ Re-add `/old`, `app/globals.css`, `lib/accents.ts`, or anything from the retired press design. It was deleted, not archived — it is in git history if you need it.
- ❌ Turn `experimental.inlineCss` back on without measuring. The flag ships the stylesheet twice on first load, and over HTTP/2 that costs more than the request it saves. The numbers are in the comment in `next.config.ts`.
- ❌ Move `gtag.js` back to `afterInteractive`, or delete the head stub. They are one decision — see "Analytics".
- ❌ Add a per-control GA event name. Add a `data-analytics` id under an existing kind.
- ❌ Re-add a `Cache-Control` header for `/_next/static`. Next already sets exactly that, and overriding it earns a build warning.
- ❌ Put `favicon.ico` in `app/`. See "Icons".
- ❌ Fetch Anek Kannada from Google again. It is self-hosted and subsetted on purpose — see "Fonts on the wire".
- ❌ Preload IBM Plex Mono. See "Fonts on the wire".
- ❌ Write an em dash or an en dash into visible copy. See [.impeccable.md](.impeccable.md).

---

## Related

| Topic                                        | File                             |
| -------------------------------------------- | -------------------------------- |
| Brand voice, tone, audience, "what to avoid" | [.impeccable.md](.impeccable.md) |
| Site overview (human-readable)               | [README.md](README.md)           |
