<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## What the site is

**The Schematic.** One sheet of an engineering drawing, alive: registration
ticks at the corners, a measuring edge down the left, a Bayer-dither light under
the cursor, dust blue as the default ink, and a title block for a footer.
Six inks, two grounds, and nothing else adjustable.

The home page is six figures, an open-source list and a writing list (the
components keep the drawing's names, `PartsList` and `.rev`; the labels a reader
sees say "Open source" and "Writing"). Every figure is
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
  them, and **the regex fails silently** — a miss falls back to `dustblue` rather
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
- `next.config.ts` (experimental flags, image config, `output: "export"`) ⇆
  this file. Headers and redirects are **not** in it any more — `output:
"export"` ignores `headers()`/`redirects()`/`rewrites()` silently, so they
  live in `public/_headers` and `public/_redirects` (Cloudflare parses both at
  deploy) and the `.md` rewrite became real files from `scripts/gen-md.ts`.
  It still carries **`remarkImageSize`**, which stamps
  intrinsic `width`/`height` onto local MDX images at compile time by reading
  the PNG or WebP header. It is the CLS guard `ZoomImage` has always documented
  and never received. It reads the file from `public/`, so **an MDX image path
  that does not resolve silently loses its dimensions** rather than failing the
  build: a wrong box is worse than none.
- `lib/posts.ts` ⇆ the loader map in `app/(press)/blog/[slug]/page.tsx` (the
  build fails loudly if they drift).
- `lib/resume.ts` `skills` ⇆ the `MATERIALS` list in `app/(press)/content.ts`
  (throws at module load if a name is renamed).
- **Every number about the public work comes from `PUBLIC_WORK` in
  `lib/resume.ts`**, and the star total and repo count are read through
  `lib/github.ts` where a page can await it (baked in at build), then refreshed
  in the browser by `components/LiveStars.tsx` — both ends share the one fetch
  in `lib/stars.ts`. Four surfaces used to print
  hand-typed copies and they were wrong: 55 repos (it is 38 original, 194
  including forks) and 15 npm packages (16). The comment in `resume.ts` carries
  the two API calls that verify them.
- **The résumé's Leadership block is `leadership` in `lib/resume.ts`.** Four
  plain lines: hiring, planning, unblocking, mentoring. The owner wrote the
  substance himself on 2026-09-05 and said no to ticket counts and other
  throughput numbers there. Team size, hires and promotions under him have no
  source, so they are not on the page; do not add a people number without
  one. The résumé has to **print on two pages**, which is why the VP role is
  down to four bullets (the performance program and the two PDF rewrites share
  one). Check the page count after any copy change: headless Chromium
  `--print-to-pdf`, then `pdfinfo`.
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

| Slot            | Version                        | Notes                                                                                                                                                                                                                                             |
| --------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Next.js         | 16.3.3                         | App Router, **`--webpack` build** (not Turbopack), MDX via `@next/mdx`                                                                                                                                                                            |
| React           | 19.2.8                         | `<ViewTransition>` from `react`. 16.3 turns view transitions on with no config; the flag is gone                                                                                                                                                  |
| TypeScript      | ^7                             | strict, `target: ES2017`, `moduleResolution: bundler`, `@/*` → repo root                                                                                                                                                                          |
| Tailwind CSS    | ^4                             | CSS-only config (no `tailwind.config.*`)                                                                                                                                                                                                          |
| Linter          | oxlint ^1.80                   | Rust-based; do NOT add ESLint                                                                                                                                                                                                                     |
| Formatter       | oxfmt ^0.65                    | Rust-based; do NOT add Prettier                                                                                                                                                                                                                   |
| Package manager | pnpm                           | `pnpm-lock.yaml` committed; never `npm`/`yarn`/`bun`                                                                                                                                                                                              |
| MDX             | @next/mdx ^16.3                | `remark-gfm`, `remark-smartypants`, `rehype-slug`, `rehype-autolink-headings`, `rehype-highlight`                                                                                                                                                 |
| Charts          | @microcharts/react ^0.18       | **No longer blog-only** — fig. 2 on the home sheet is a tray of them. Tokens bridged at `:root` in `styles/press/tokens.css` (`--mc-*`), not at `.prose`                                                                                          |
| Sweep           | glimm ^0.3                     | The WebGL band that carries an **ink** pick. Paper is the iris in `lib/vt.ts`. `GlimmProvider` is the outermost provider; **its root module is imported dynamically** — see "Sweep contract"                                                      |
| Live specimen   | react-spectrum ^1.3            | His own 2019 package, running in fig. 4. **Imported by ESM file path** with a type shim at the repo root — see the trap below                                                                                                                     |
| Dialog          | @base-ui/react ^1.7            | One use: the `?` shortcut help sheet (`components/shortcuts/ShortcutHelp.tsx`)                                                                                                                                                                    |
| Image zoom      | medium-zoom ^1.1               | `components/mdx/ZoomImage.tsx`, essays only. It takes over the `<img>`, which is why the portrait and the MDX images are raw `<img>` and not `next/image`                                                                                         |
| Deploy          | Workers static assets          | **`output: "export"`** → `out/`, served by Cloudflare Workers static assets. No worker script, no OpenNext, no R2. `wrangler.jsonc` is assets-only; headers/redirects live in `public/_headers` + `public/_redirects`; ship with `pnpm cf:deploy` |
| Fonts           | next/font                      | Hanken Grotesk + IBM Plex Mono from Google. Anek Kannada is **self-hosted and subsetted**. `@fontsource/hanken-grotesk` and `@fontsource/ibm-plex-mono` exist so the OG renderer can read raw files                                               |
| Browsers        | `browserslist` in package.json | Chrome/Edge 111, Firefox 128, Safari/iOS 16.4. Not arbitrary: the design is built on `oklch()`, `color-mix()` and `@property`, none of which exist below it                                                                                       |

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
  freezes `requestAnimationFrame` in a hidden tab: a reader who picked an ink
  and immediately switched tabs came back to the old colour, because the
  band suspended before its midpoint and the swap never ran. `sweepApply()`
  fires the change on whichever comes first, the midpoint or a 1.6 s timer, and
  makes `apply` idempotent. **Never call `sweep()` directly for a state change.**
  Paper does not go through glimm.

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
                     Caption,
                     Portrait, Exploded, Loupe, Specimens, SpectrumDemo, SgbFigure, Career,
                     PartsList, Pipeline, CopyEmail, Socials, EssayShell, PrintCV, and two
                     hooks: useCoarsePointer, useReducedMotion
                     (which also exports `approach`, the frame-rate-independent lerp every
                     eased follow on the site uses, and `houseEase`, `--ease-out` solved in
                     JS for the loops that cannot read a CSS easing — see "Motion" below)
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
  sweep.ts           sweepApply() — the guarded glimm sweep an ink pick goes through,
                     and the dynamic import that keeps glimm's root module off every route
  sweep-shader.ts    The band itself: mesh harmonics on a flat quad, fetched with glimm
  vt.ts              withViewTransition() — the paper iris, from the control
  posts.ts           Post metadata — outside the route tree so the pages and the feeds share it
  fonts.ts           The three faces
  mark.ts            The G, as raw path data — the one copy every renderer shares
  icon-png.tsx       markPng(size, {maskable}) — every PNG icon the site serves
  stars.ts           The raw GitHub star fetch — shared by the build and the browser
  github.ts          Build-time star counts + the hand-checked fallback
  analytics/         track() + the GA4 adapter. See "Analytics".
  og-fonts.ts        The OG card's three faces as base64, generated + committed
                     by scripts/gen-og-fonts.mjs. Do not edit by hand.
  jsonld.tsx (.tsx, not .ts), metadata.ts, og.tsx, resume.ts
fonts/               Self-hosted faces + their licence. Currently one: the Anek
                     Kannada name cut (scripts/subset-kannada.py).
scripts/             gen-md.ts (markdown mirrors, run by dev/build, output
                     gitignored) · gen-favicon.py · gen-pwa-screenshots.sh ·
                     gen-og-fonts.mjs · subset-kannada.py · submit-index.mjs
                     (the rest manual, outputs committed).
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

| Path                                           | File                                                         | What it renders                                                                                                                         |
| ---------------------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                            | `app/(press)/page.tsx`                                       | Home — the subject, six figures, parts list, revisions. **Absorbed /about and /work.**                                                  |
| `/blog`                                        | `app/(press)/blog/page.tsx`                                  | Index of `published` posts                                                                                                              |
| `/blog/<slug>`                                 | `app/(press)/blog/[slug]/page.tsx`                           | `generateStaticParams` from `published`; loaders are a hardcoded slug→import map                                                        |
| `/blog/<slug>.md`                              | `scripts/gen-md.ts` → `public/blog/<slug>.md`                | The post as plain markdown, generated by the `dev`/`build` scripts (gitignored). Imports and ESM exports stripped, prose left alone     |
| `/resume`                                      | `app/(press)/resume/page.tsx`                                | CV from `lib/resume.ts`, two columns, print stylesheet                                                                                  |
| `/about`, `/work`                              | `public/_redirects`                                          | **308 → `/#subject`, `/#work`.** Do not re-add these as pages                                                                           |
| `/sitemap.xml`                                 | `app/sitemap.ts`                                             | `/`, `/resume`, `/blog` + every published post. No `/about`, `/work`                                                                    |
| `/robots.txt`                                  | `app/robots.ts`                                              | Allow all (there is no `/api/` any more); sitemap pointer. The AI crawlers are also allowed **by name** — see the comment there for why |
| `/manifest.webmanifest`                        | `app/manifest.ts`                                            | PWA shell: five icons, two screenshots, two shortcuts (Writing, Résumé)                                                                 |
| `/icon`                                        | `app/icon.tsx`                                               | The tab favicon. SVG, transparent, live ink (**aubergine in dev**, so a dev tab is tellable)                                            |
| `/icon-192`, `/icon-512`, `/icon-512-maskable` | `app/icon-*/route.tsx`                                       | PNG mark on paper via `lib/icon-png.tsx`. 192+512 are Chrome's install requirement; the maskable cut is inset for Android               |
| `/apple-icon`                                  | `app/apple-icon.tsx`                                         | 180×180 home-screen tile, same renderer                                                                                                 |
| `/favicon.ico`                                 | `public/favicon.ico`                                         | Committed 16/32/48 raster for legacy probes + Google's SERP favicon. **In `public/`, not `app/`** — see the note in `app/layout.tsx`    |
| `/rss.xml`                                     | `app/rss.xml/route.ts`                                       | RSS 2.0 feed of `published` posts                                                                                                       |
| `/llms.txt`                                    | `app/llms.txt/route.ts`                                      | Curated plain-text site map for AI systems; links each post's `.md` mirror                                                              |
| `/opengraph-image*`                            | `app/**/opengraph-image.tsx`                                 | Per-route OG cards, all through `lib/og.tsx`. Home `dustblue`, blog and résumé `bottle`                                                 |
| `error`                                        | `app/error.tsx`                                              | Root error boundary. Outside the (press) group, so it mounts `<Sheet>` itself                                                           |
| `not-found`                                    | `app/not-found.tsx`, `app/(press)/blog/[slug]/not-found.tsx` | 404 (`robots: { index: false }`). The global one also mounts `<Sheet>` itself                                                           |

### The running header

`components/schematic/Header.tsx` is `position: sticky` and condenses once it
leaves the top of the page. Four things about it are load-bearing.

- **There is one copy of it in the DOM.** A separate sticky clone is the easy
  way and it would register the whole keyboard map twice, which
  `ShortcutProvider` refuses and warns about in development.
- **The outer box never changes size**, locked to `--hd-h`, which `Header.tsx`
  measures while unstuck. A sticky element stays in flow, so a header that
  shrinks on stick pulls the page up by the difference at that exact moment. A
  spacer below it driven by a `ResizeObserver` was tried first and was worse:
  the observer fires _after_ each resize, so the content below sat a frame
  behind the header for the whole condense and juddered the entire way down.
- **`overflow-x` on `html` is `clip`, not `hidden`, and that is what makes
  sticky work at all.** `hidden` makes the element a scroll container, so a
  sticky child sticks to _its_ box rather than to the viewport, and a box as
  tall as the document never sticks. `clip` contains a stray horizontal
  overflow without creating a scrollport. Safari 16 and up, which is the floor.
- **The strip is `.hd-strip` (the row plus the rule), not `.hd`.** The header
  carries only the space; the strip carries the ground, the blur and the rule
  in one element, or the rule sits below the blurred band with unblurred
  content passing through the gap between them. `.hd` is `pointer-events:
none` with `.hd > *` set back to `auto`, so the dead area under the condensed
  strip does not swallow clicks meant for the page. Putting the ground on `.hd`
  instead tints and blurs the whole locked box, which is twice the height of
  the strip. ⚠️ In `.hd-strip` the `-webkit-backdrop-filter` line is written
  **before** the unprefixed one, and that ordering is load-bearing — the CSS
  minifier keeps only the last of the pair, and the other order shipped a
  build with no blur at the standard name.
- **Nothing inside the strip may reflow while it condenses.** Only padding,
  opacity, a background colour and a blur radius animate. Three earlier
  versions each looked wrong for the same reason: `display: none` on the
  Kannada name (not animatable, so the brand block relaid out in one frame),
  an animated `font-size` on the name and `height` on the mark (text reflow is
  a sequence of different layouts, not an interpolation), and `backdrop-filter`
  switching on (not animatable, so its backdrop layer was created mid
  transition). The blur is a pair of registered custom properties now, present
  from the start at zero strength, and every part of the condense shares
  `--dur-base` and `--ease-out`.
- **The bottom line is the drawing title's own rule, morphing.** Not a second
  line that appears. `.hd-title` collapses to zero width between the two
  `flex: 1 1 12px` hairlines, they grow into the space it leaves, and the
  compass — which sat right of centre because the title took the left half —
  ends up dead centre of an unbroken rule. The compass is not animated; it
  travels because the hairlines equalise, which is why the whole thing rides
  one interpolation. Three details make it land: the collapsed title still
  contributes a flex gap, so `margin-inline-start` is pulled back by exactly
  one gap or the compass settles half a gap off centre; the strip is
  `display: flow-root` or the rule's negative bottom margin collapses out of it
  and the ground runs past the line; and the rule's `margin-bottom: -9px` is
  half its own height, which puts the hairline exactly on the ground's bottom
  edge with the compass straddling it.
- **The scroll offset it needs is `scroll-margin-top: 56px` on every element
  with an id** (`:where([id])` in `base.css`), not `scroll-padding-top` on
  `html`. The condensed strip bottoms out ~48px from the viewport top, so a
  ruler tick, an anchor jump or focus moving into an off-screen control would
  otherwise land its target underneath it. The scrollport padding was the
  first answer and it was reverted on 2026-09-03: WebKit applies it to scroll
  restoration as well, so a reload of a scrolled page came back 56px short,
  even with the padding switched on only after load. **There is no
  `scroll-behavior: smooth` on `html` either**, for the same family of reason:
  Chromium applied it to restoration (a reload eased from the top over 600ms)
  and Next's restore on Back animated and stopped short. The ruler's ticks
  scroll smoothly through `scrollIntoView` on their own.
- **A reload that lands scrolled is handled before hydration.** The inline
  script at the end of the strip locks `--hd-h` (measured while the header is
  still at its natural height, so it must stay LAST in the strip), stamps
  `data-stuck` from the sentinel's position, keeps it current from a scroll
  listener, and holds `data-instant` for 400ms so the strip paints condensed
  rather than condensing. React seeds `stuck` from the same sentinel and its
  `measure()` skips while stuck (it would measure the condensed box, and
  toggling the state to measure restarted the ground's transition). Without
  this the strip sat transparent over the content until hydration, and its
  260ms condense shrank the box while scroll anchoring dragged the page.
- **A selection made on the old page is cleared on route change**
  (`Header.tsx`, the pathname effect). React keeps the DOM nodes, so a word
  double-clicked on the home page arrived as half a title painted in the ink
  on the essay.
- **Two widths, deliberately.** The ground bleeds to the sheet's inner edge,
  because a blur that stops mid-air is worse than no blur. The rule inside it
  stays at the drawing's width, like every other rule here.

- **The strip is one row at every width, by measurement and not by
  breakpoint.** `.hd-row` is `flex-wrap: nowrap`. `fitRow()` in `Header.tsx`
  stamps `data-fit` on `.hd` with tokens from `FIT`, one more at a time, until
  `scrollWidth <= clientWidth`: `kn` (the Kannada name) → `compact` (tighter
  gaps, 18px name, 22px mark, no year on the rule) → `tray` (the ink tray
  collapses to the active swatch) → `resume` (the strip's résumé link goes;
  the title block still has it) → `name`. The résumé link came back to the
  strip on 2026-09-05 (owner: on a wide sheet, yes; in the phone bar, no). It
  is a plain link with no key.
  Every rule is `.hd[data-fit~="<token>"]` in chrome.css. It re-runs from a
  `ResizeObserver` on the row and on `document.fonts.ready`. Breakpoints were
  tried and wrapped at 660px, because a breakpoint has to guess how wide the
  name and six chips are in the fonts that actually loaded. **The first paint
  is the same measurement, run inline**: a `<script>` rendered after the row
  (`FIT_INLINE`) runs the loop during parse and stamps `data-fit` before the
  strip paints; the state initialiser reads it back through `window.__mgFit`
  (`suppressHydrationWarning`, the same pattern as `SpecimensTray`). A
  viewport-based guess was tried first and it erred wide on purpose, which
  put an 18px name on every tablet that grew to 22px at hydration. The row's
  children are `flex: none` and its text `nowrap`, because a child that
  shrinks or wraps hides the overflow the loop is measuring.
  With `tray` in force the active swatch is a disclosure (`aria-expanded`);
  pressing it opens all six, `data-tray="open"` goes on `.hd`, and the name
  steps out while it is open so the chips have the row it was on. A press
  anywhere outside `.inks`, or Escape, closes it. The name does not hide on
  stick any more: one row condenses into one row.
- **On a phone (≤640px) the link and the three preferences are not in the
  strip at all.** Writing (with `b` on it), a plain home link carrying the
  mark, then ink, theme and sound render through a portal into `.ptray`, a
  fixed bar at the foot above the safe-area inset, because the sticky strip is
  out of thumb's reach on a tall phone and the reader moves between the pages
  often. The résumé is not in the bar: on a phone it lives in the title block
  only, and `links` drops it when `phone` is true. Same JSX, one place at a
  time, so every shortcut registers once. The bar's left half is `.pt-nav`
  at `flex: 1; justify-content: space-evenly`, so the pill's slack spreads
  between the mark and the word instead of pooling before the rule. The strip keeps the mark and the names,
  and the Kannada name comes back there because it fits. The server still
  renders links and controls in the strip and the phone stylesheet hides them
  there, so nothing relocates on screen; the bar fills after hydration. It
  hides while the title block is in view (an IntersectionObserver on
  `.tb-wrap`), observed once: it is the layout's node on every route, and
  re-observing per navigation fired mid-swap. The bar has `will-change:
transform` for a compositing layer of its own. **The pill never changes
  width, and its width is a measurement rather than a taste: the ink picker is
  a sheet inside it, so the pill's width sets how far apart the six swatches
  fan, and 248px is the narrowest that keeps their 24px hit targets from
  overlapping. It was 300 while the résumé link was in the bar. Change what
  the bar carries and re-derive it — the arithmetic is in the comment on
  `.ptray` in chrome.css.** The six swatches live on a layer spanning the pill
  from its left edge to the ink slot, in the pill's own material. Closed, the layer is
  clipped to the slot and shows the active ink. Pressed, the clip opens
  leftward over the links and the six fan from the slot to even positions,
  staggered 25ms per step so the far ink lands last; a pick folds it back.
  Theme and sound never move or get covered. Home's current-page mark is the
  bar under the G (grey at rest, the ink when current), not a second rule.
  Growing the pill to fit six chips, then a popover above it, were the first
  two versions and the owner called both out. **The route swap is instant on
  phones** (`base.css`): the bar is fixed over the content and the fade
  painted the new sections on top of it; naming the bar as its own group
  made WebKit drop it for the whole swap. Three layouts were prototyped on
  2026-09-03 (one pill, two pills, an edge-to-edge tab bar); the owner chose
  the single centred pill.
- **The nav links' 24px hit area is vertical padding pulled back with a
  vertical negative margin only.** A negative side margin on the last link
  poked 3px past the row's edge and the fit loop, which measures overflow,
  never saw the row fit: every token went on, name included.
- **The words on the rule are plain.** `drawingTitle()` says Home, Writing,
  Résumé, Essay or Not found. It said "General arrangement", "Specification
  sheet" and "Revision index" for a while, which meant nothing to the reader
  the page is for. The same pass (2026-09-03) renamed the panels ("Open
  source", "Writing"), the fig. 5 label ("timeline"), the ruler's `data-sec`
  labels (about · projects · career · process · contact) and the title
  block's "Page" cell. Do not put drawing-office jargon back in front of a
  reader; it belongs in this file.

It is translucent and blurred, which is a deliberate exception to the rule in
`.impeccable.md` that nothing here is glass. It is tinted with the ground rather
than with white, separated by a rule rather than a shadow, and has no radius:
tracing paper laid over the drawing, not a floating panel.

### The sheet

`components/schematic/Sheet.tsx` is the chrome every page shares: the skip
link (first, so it is the first Tab stop), the dither field, the ruler, the
four corner registration ticks, the header, the children, the title block,
and `<PageFX />`.

`PageFX` is two page-wide delegated listeners with no element of their own: the
panels' hex-mesh cursor mask, and the sound layer (hover tick, button
press/release). **Delegated on purpose** — a new control is audible the moment
it exists rather than when someone remembers to wire it.

**One action makes one sound, and a control that voices its own outcome does
not also get a generic cue.** The rule has two enforcement points and both are
declared by the control, never by a list kept somewhere else:

- **Pointer: `data-cue="self"` on the button.** `PageFX` skips its generic
  press/release for it. Put the attribute next to the cue the control plays.
- **Keyboard: `silent: true` on the shortcut.** `ShortcutProvider` skips its
  generic tick for it.

This was a hardcoded `.ctl` / `.ink-sw` allowlist inside `PageFX` and nothing
kept it current, so every self-voicing control added since made **three** sounds
per click: the copy chip, both "draw another" chips, `PrintCV` and the measuring
edge's section ticks all played their own note plus the generic press and
release. The keyboard half had the same shape with `silent`, which only the six
inks ever set: `e` was a tick in front of the copy blip, and `m` a tick in front
of the unmute confirmation. The header's paper toggle was the loudest of them,
playing `clack` **and** a `chime` 80 ms behind it — four tones for one press,
beside a sound toggle that plays one.

Two things follow. A plain button — one with no cue of its own, like
the keys chip — carries no attribute and correctly gets the
press/release pair; do not tag a control that has nothing else to say. And a
`tick` is throttled to 80 ms inside `FXProvider` while every other cue is not,
so a duplicated tick hides and a duplicated anything-else does not. Do not read
"it sounds fine" as "it fires once".

## Provider stack

Root (`app/layout.tsx`) owns everything:

```
<SweepProvider>             // glimm. Outermost: InkProvider hands it the ink pick.
  <ThemeProvider>           // paper iris via withViewTransition. mg_theme.
    <FXProvider>            // WebAudio cue set + haptic. mg_sound.
      <ShortcutProvider>    // keyboard registry. ? = help, Esc = close. Scope stack: global|modal|page.
        <InkProvider>       // ink. mg_ink. Stamps data-ink and nothing else.
          {children}
          <HintLayer /> <ShortcutHelp />
```

`InkProvider` is inside `FXProvider` because a pick plays that ink's pitch.
`SweepProvider` builds no WebGL context until the first sweep, and no longer
pulls glimm's root module into the root chunk either, so a reader who never
touches the palette really does pay nothing for it.

**Neither provider may guard its mount with a `useRef(true)` flag flipped
inside the effect.** StrictMode mounts, unmounts and mounts again, so the second
pass reads a flag the first already cleared: `ThemeProvider` swept the whole
six-ink tray and fired a `track({ name: "theme" })` on every dev page load, with
the band arriving unprompted a beat after the paper. Both providers compare the
value they are about to paint against the one already painted instead —
`ThemeProvider` against a `painted` ref seeded during render, `InkProvider`
against `painted.current` set in its hydration effect — which is idempotent and
so cannot care how many times it runs.

`app/(press)/layout.tsx` adds only `<Sheet>`, `<main id="main-content">` and
`<ViewTransition name="route">`.

Plus `<WebVitals />` outside the providers; reports CLS/FCP/LCP/TTFB/INP to GA4
as one event per metric (CLS scaled ×1000 — GA4 rounds `value` to an integer
and would otherwise record 0 every time). It used to POST the same payload to
`/api/vitals` as well; the static export has no server to receive it and the
duplicate carried nothing GA4 wasn't already given.

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

| Kind    | Use for                             | Example                                        |
| ------- | ----------------------------------- | ---------------------------------------------- |
| `nav:`  | in-site navigation the reader chose | `nav:header.writing`, `nav:title-block.resume` |
| `cta:`  | a named content link                | `cta:project.microcharts`, `cta:part.<name>`   |
| `feed:` | a machine-readable surface          | `feed:rss`, `feed:llms`, `feed:markdown`       |
| `mail:` | a mailto worth naming               | `mail:title-block`, `mail:resume`              |

On top of that, and without any attribute: **any link leaving the origin** is
reported as `outbound`, and any bare `mailto:` as a contact. Nothing else fires
— this does not log every click on the page.

**An external link with a `cta:` on it therefore reports twice**, once as its
`cta` and once as `outbound`. That is deliberate and it is not symmetric with
`mail:`, which sets `handledAsMail` and suppresses the second event: a contact
is one act, while an outbound click is worth counting both as the named thing
it is and in the outbound total. Do not "fix" the asymmetry without deciding
which of the two numbers you want to change.

**`href` is optional on `nav`.** Not every navigation is an anchor — the
measuring edge's section ticks are buttons that scroll — and a required field
had every tick reporting `link_url: ""`.

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
| `r`     | résumé                 | `schematic/TitleBlock.tsx`            |
| `t`     | switch the paper       | `schematic/Header.tsx`                |
| `m`     | mute / unmute          | `schematic/Header.tsx`                |
| `1`–`6` | pick an ink            | `InkSwatch` in `Header.tsx`           |
| `e`     | copy the email address | `schematic/CopyEmail.tsx` (home only) |
| `?`     | the help sheet         | `shortcuts/ShortcutHelp.tsx`          |
| `Esc`   | close the help sheet   | `shortcuts/ShortcutHelp.tsx`          |

There is no `0` and no `w`/`a`. `r` is registered on the title block's résumé
chip, because the key lives with the control it floats its Shift-hold hint
over. **The résumé link lives in the title block on every width, and in the
strip on a wide sheet (owner, 2026-09-05)**, which reverses the footer-only
call of 2026-09-04, which reversed the both-places call of 2026-09-01. The
strip's copy is a plain link (`.hd-resume`) and drops out of the phone bar and
under the `resume` fit token. Do not put it in `.ptray` or `app/not-found.tsx`.

The registry refuses duplicate keys within a scope and warns in development.
`silent: true` on a shortcut means it plays its own cue instead of the
registry's generic tick — the six inks, `e` (the copy blip), `t` (the paper
clack) and `m` (the unmute confirmation). It is the keyboard half of the rule
in "The sheet" above; `data-cue="self"` is the pointer half.

## Static files in `public/`

`favicon.ico` (committed; `pnpm gen:favicon`), `humans.txt` (linked from `<link
rel="author">` in `app/layout.tsx`), `BingSiteAuth.xml`, IndexNow key
`mgindexnow7k2p9xq4m8n1w5e3r6t.txt`, `brand/` (wordmark, logo, monogram +
`screenshot-wide.png` / `screenshot-narrow.png` for the manifest), `portrait/`,
`posts/`, and three deploy-facing pieces: `_headers` and `_redirects`
(Cloudflare parses both at deploy — every header and redirect the site serves
lives there), and the gitignored `blog/` of markdown mirrors from
`scripts/gen-md.ts`. `_headers` also carries explicit `Content-Type` lines for
the extensionless metadata routes (`/icon`, the PNG family, the OG cards) —
static assets serve an extensionless file with **no** Content-Type, and an SVG
favicon is never content-sniffed.

## Deploy

Cloudflare Workers static assets, and nothing else. `wrangler.jsonc` names the
worker `meetguns`, points `assets.directory` at `./out`, and attaches
`meetguns.com` + `www.meetguns.com` as **Custom Domains** (`routes` with
`custom_domain: true`) — wrangler writes the DNS records and mints the cert on
deploy, so the zone's DNS table is meant to be empty of A/AAAA/CNAME for those
two hosts. `workers_dev` is `false`: one origin for crawlers, no duplicate under
`*.workers.dev`. `pnpm cf:deploy` builds, ships, and pings IndexNow.

Seven things live in the zone dashboard rather than in the repo, and were set
on 2026-09-04. **None of them fail loudly.** A drift here costs speed, serves
`http://` in the clear, or rewrites what the crawlers are told — and the build
stays green through all three, so the only way to catch one is to check the
live response.

- **Redirect Rule** "Redirect from WWW to root": `https://www.*` → `https://${1}`,
  301, query preserved. The Worker serves both hosts; the rule runs before it.
  The dashboard warns that `www` "may not be proxied" because it cannot see a
  Worker custom domain as a normal record — ignore it, the rule fires.
- **SSL/TLS → Always Use HTTPS: on.** A Worker custom domain answers plaintext
  `http://` with a 200 otherwise; HSTS in `_headers` only covers return visits.
- **Speed → Speed Brain, 0-RTT, Early Hints: on.** HTTP/3 and TLS 1.3 are on by
  default. Early Hints is inert today (the pages emit no `Link` header) and
  harmless.
- **Rocket Loader: off, and stays off.** It rewrites inline scripts, which
  would defer the no-flash `data-theme`/`data-ink` stamp and the gtag stub.
  Cloudflare Fonts is off too: `next/font` already self-hosts, so there are no
  third-party font requests for it to rewrite. Web Analytics (RUM beacon) is
  off: GA4 + `WebVitals` already carry the same numbers, and the beacon is a
  second 6 kB script.
- **AI Crawl Control → Managed robots.txt: OFF, and it must stay off.** Zone
  onboarding turns it ON, and it does not add to `robots.txt` — it _replaces_
  the served file (2314 bytes where `app/robots.ts` builds 478), prepending
  `Content-Signal: ai-train=no` and `Disallow: /` for ClaudeBot, GPTBot, CCBot,
  Google-Extended, Applebot-Extended, Amazonbot, Bytespider and
  meta-externalagent — the exact crawlers `app/robots.ts` allows by name. It
  fails silently: nothing 500s, the build is untouched, and only a byte count
  or a `grep Disallow` on the live file catches it. The "Block AI bots" rule is
  separate and is not deployed (verified by UA: those crawlers get 200); its
  Sept-15 preference is set to **allow** mixed-purpose crawlers, for the same
  reason.
- **The domain sends and receives no mail, and says so in DNS.** Null `MX 0 .`,
  SPF `v=spf1 -all`, and `_dmarc` `v=DMARC1; p=reject; sp=reject; aspf=s;
adkim=s`. The contact address on the site is Gmail (`BIO`/`identity` in
  `lib/resume.ts`), so nothing legitimate sends as `@meetguns.com` and anything
  that claims to is a forgery. **Adding a newsletter or a work address means
  loosening all three first** — a sender added under `-all` / `p=reject` is
  rejected outright, not spam-foldered. The DMARC record carries no `rua=`
  on purpose: reports to an address at a domain you do not control need an
  authorisation record on _that_ domain, which cannot be added to gmail.com.
- **Browser Cache TTL is 4 hours in the dashboard and is inert.** Every
  response the Worker serves carries its own `Cache-Control` from `_headers`,
  which wins; the content-hashed chunks were checked and arrive `immutable`.
  Left alone rather than set to "Respect Existing Headers", which would change
  nothing.

### CI and deploy

Deploy is **Cloudflare Workers Builds**, the same integration `microcharts.dev`
runs, and it is configured in the Cloudflare dashboard rather than in this repo
(Workers & Pages → meetguns → Settings → Builds). A push to `main` builds and
deploys; a push to any other branch builds and uploads a version, which is
where the preview URL on a pull request comes from.

| Field             | Value                                   |
| ----------------- | --------------------------------------- |
| Build command     | `pnpm build`                            |
| Deploy command    | `pnpm exec wrangler deploy`             |
| Version command   | `pnpm exec wrangler versions upload`    |
| Root directory    | `/`                                     |
| Production branch | `main`, non-production branch builds on |

**Build cache is on** (Settings → Builds → Build cache), or every build
reinstalls 277 packages and rebuilds `.next` from cold.

**`wrangler deploy` reconciles the triggers, not just the assets**, so the
custom domains in `wrangler.jsonc` ship from a build the same way they ship
from a laptop. `pnpm cf:deploy` still works and is still the way to ship
without a commit; it is the only path that also pings IndexNow, which Workers
Builds does not run.

**`wrangler.jsonc` declares neither `workers_dev` nor `preview_urls`, exactly
as microcharts does, and that is what makes preview URLs work.** Both hosts are
switched on the Worker instead (Settings → Domains → Worker URL): production
`meetguns.vsg-inbox.workers.dev` and preview `*-meetguns.vsg-inbox.workers.dev`.
Every branch build then publishes `https://<version>-meetguns.vsg-inbox.workers.dev`
and a stable `https://<branch>-meetguns.vsg-inbox.workers.dev`.

⚠️ **Do not add `workers_dev: false` back.** It looks tidy — one host, no
duplicate of the live site for crawlers — and it silently disables the preview
URLs along with it, so branch builds still go green while posting a comment with
no link. `preview_urls: true` does **not** rescue it: that key is not in
wrangler 4.127's config schema, so it is read as nothing at all. This was tried
twice and reverted twice; the duplicate host is the accepted cost of previews.

The toggles are Worker state as well, and state and config can disagree.
Deleting a key does not re-enable a host an earlier deploy switched off, and
`wrangler versions upload` cannot change it either — the build log says as
much: _"Changes to triggers must be applied with `wrangler triggers deploy`"_.

`.github/workflows/ci.yml` is the other half: `pnpm check` and `pnpm build` on
every pull request. Workers Builds runs neither oxfmt, oxlint nor `tsc`, and
the repo's pre-commit hook only binds the machine it is installed on. Nothing
in Actions deploys — there is no Cloudflare API token in this repo.

Two things about the connection itself, both learned by hitting them:

- **The token is `meetguns build token`, minted for this project alone.** The
  connect dialog offers `microcharts build token`, which works and is the wrong
  answer: one token shared by two projects means rotating it for either breaks
  the other.
- **The Cloudflare Workers and Pages GitHub App has to be granted this repo,
  separately from connecting it.** The app was installed for `microcharts`, so
  the repository picker listed `portfolio-v2` and connected to it happily,
  then the Builds panel read _"This project is disconnected from your Git
  account"_ and no build could ever fire. The fix is on GitHub, not Cloudflare:
  Settings → Applications → Cloudflare Workers and Pages → Configure →
  Repository access. Worth checking there first if builds simply never start.

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
  site's fonts.** They are devDependencies consumed only by
  `scripts/gen-og-fonts.mjs`, which bakes their raw `.woff` files into the
  committed `lib/og-fonts.ts` as base64. `lib/og.tsx` reads that module, never
  the filesystem — next/font keeps its copies inside the build output where a
  render-time read could not reach them, and the base64 path also survived the
  Worker era, where there was no filesystem at all.

## Persistence keys (localStorage)

| Key        | Values                             | Owner                            |
| ---------- | ---------------------------------- | -------------------------------- |
| `mg_theme` | `"light" \| "dark"`                | `ThemeProvider`, no-flash script |
| `mg_ink`   | ink id from `lib/ink.ts`           | `InkProvider`, no-flash script   |
| `mg_sound` | `"1"` unmuted, anything else muted | `FXProvider`                     |
| `mg_stars` | `{ t, c }` — 6 h star-count cache  | `components/LiveStars.tsx`       |

Four keys. `mg_mode` is gone with the press runs. All reads and writes are
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

Rows in **tray order** — the order `INKS` declares in `lib/ink.ts`, the order
the header paints, and the order keys `1`–`6` pick. The default leads it.

| ID                   | Label          | Light (`--sw-*`)      | Dark (`--sw-*`)       | Mirror light / dark   | Hz  |
| -------------------- | -------------- | --------------------- | --------------------- | --------------------- | --- |
| `dustblue` (default) | dust blue      | `oklch(.47 .08 240)`  | `oklch(.75 .075 245)` | `#2b6083` / `#86b3db` | 440 |
| `amber`              | drafting amber | `#8f5c0c`             | `#d9962b`             | `#8f5c0c` / `#d9962b` | 492 |
| `bottle`             | bottle green   | `oklch(.45 .095 158)` | `oklch(.75 .092 154)` | `#176540` / `#7fbf93` | 544 |
| `oxblood`            | oxblood        | `oklch(.46 .115 25)`  | `oklch(.73 .11 29)`   | `#8d3936` / `#e58c7f` | 596 |
| `aubergine`          | aubergine      | `oklch(.44 .112 316)` | `oklch(.72 .105 320)` | `#6a3c7c` / `#c28fce` | 648 |
| `olive`              | olive          | `oklch(.5 .095 112)`  | `oklch(.78 .11 108)`  | `#65681f` / `#bebd66` | 700 |

`brass`, `umber` and `slate` are **gone**. Do not reintroduce them. `slate` was
retired because at `oklch(.46 .05 250)` it was dust blue at 10 degrees and half
the chroma: a second blue rather than a sixth pigment. `olive` took the slot
because amber to bottle is the palette's widest hue gap (88 degrees), so it is
the only place a sixth ink sits more than 40 degrees from both neighbours.

The Hz column is the pitch the picker plucks on a pick. The six rise linearly by
52 Hz, so playing the tray left to right is a rising run — that is the point of
having six.

Two rules govern the pairs, and neither is arithmetic:

1. **The dark value is not the light value lightened.** Amber goes from a burnt
   `#8F5C0C` on paper to a brighter, yellower `#D9962B` on graphite, because a
   dark ground swallows chroma and a lit amber has to shout a little to stay
   amber. Every pair moves in hue, not only in lightness.
2. **Every pair clears AA against its own ground as text** (the weakest is amber
   on paper at 5.11:1, then olive at 5.32:1) and 3:1 as a line. The palette is
   checked as type, not as swatches, because `--accent` sets live values and
   actions.

**Dust blue is the default, and it is a material, not a hue.** It is the ink a
drawing office reproduced in: blueprint stock, the diazo line, the pencil-blue a
draughtsman set out with. The other five are pigments a drawing office would
actually have had, drafting amber among them as the colour of a hard pencil on
tracing paper.

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
standard, 1.5px emphasised. **Depth is line weight, never shadow.** `--shadow-sm`
/ `--shadow-xl` in the bridge block are literally `none`.

**No shadow is ever depth here, but the repo is not free of `box-shadow`.** Five
rules use one, and every one of them draws a line rather than a lift: the
loupe's crosshair arms are a single offset spread-zero shadow on one 1px element
(`home.css`), the essay's zoomed figure and the microcharts demos ring
themselves with `0 0 0 1px` instead of a border so nothing reflows, and the help
sheet carries the one real shadow in the repo, which its own comment already
flags as debt. This file used to claim the count was zero. Adding a blurred,
offset shadow to lift something is still forbidden.

### The shared-component bridge

The bottom of `tokens.css` maps an older set of token names (`--bg-surface`,
`--fg-1`, `--font-display`, `--khadi`, …) onto the drawing's
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

**Scale**: there isn't one, as tokens. `--t-1` … `--t-8` were declared for a
1.25 ratio (`12 · 15 · 19 · 24 · 30 · 37 · 46 · 58`) and referenced **zero
times**, so they have been deleted rather than left as a scale the site could be
mistaken for following. Every `font-size` here is a literal — 114 of them across
24 distinct values, eight between 7px and 11.5px. If a scale is wanted, add it
and convert the literals in the same change; do not re-declare the tokens and
leave them unused.

The `--t-micro / --t-overline / --t-caption / --t-small / --t-body / --t-h5 /
--t-h4 / --t-h3 / --t-h2` aliases lower down are a different thing and are
**live** — 28 references from `microcharts-demos.css` and `shortcuts.css`. They
are part of the shared-component bridge below, not of the deleted scale.
**Spacing**: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 144` (`--s-1` … `--s-10`).
**Measures**: `--w-sheet 1040px` the drawing, `--w-essay 760px` the reading
measure, `--sheet-margin 24px`, `--gutter 32px`, **`--page-top 36px`**: the
gap between the header's rule and the first thing on every route (home's
`.subject`, `.doc-head`, `.essay`, the résumé's `.cv`), so all four pages open
at the same height, 45px under the hairline. The essay's column stays
centred in the plate (owner's call, 2026-09-03: the vertical opening has to
match, the x does not). **One h1 scale**:
`clamp(30px, calc(23px + 1.5vw), 42px)` on 1.08, shared by home, the writing
index and the essay; the résumé's name is a document heading and stays at its
own clamp. **One lede**: 1.19rem on 1.46 for the home introduction, the
writing lede and the essay spoiler. Measured on 2026-09-03 before this: the
four pages opened at 45, 69, 61 and 53px, with three h1 sizes.

**Radius — three values, each with a job.** `--r-rule 0` is drawing geometry:
every rule, panel, slab and axis. `--r-chip 2px` is a touched thing: chips,
buttons, swatches, kbd. `--r-point 50%` is a point: the loupe, station dots, the
portrait ripple. **There is no third box radius. A drawing has no rounded
corners.**

**Press**: `--press 0.94`, how far a control gives under a press. Four sibling
controls used to press by four different amounts (0.88 / 0.92 / 0.94 / 0.97),
which reads as four different mechanisms. `.chip` documents the one exception:
it is 236px wide, where the token is 14px of travel.

**Motion**: `--dur-fast 140ms` hover and focus · `--dur-base 260ms` everything
the reader caused · `--dur-ink 340ms` the coordinated ink tween · `--dur-iris
720ms` the paper mix · the ink sweep at 900ms + 420ms, which lives in
`SweepProvider.tsx` rather than in a token because it belongs to the library
that draws it. Sheet easing is `--ease-out cubic-bezier(.22,1,.36,1)`. The
paper mix uses `--ease-iris` — a gentler start — because houseEase on a
hard circle jumped a hairline drawing ~25px a frame. Direct
manipulation has no duration at all, because the hand sets it.

### The motion law (`styles/press/motion.css`)

Motion is reserved for things the reader caused — a hover, a drag, an ink pick,
a route swap — with **three sanctioned one-shot exceptions**:

1. the halftone portrait blooming in from two or three random seeds, once, on
   load (`Portrait.tsx` — the only randomness on the page);
2. the pipeline playing one pass through its stages the first time it is seen;
3. the loupe's lens settling onto the sentence the moment it is placed
   (`lp-lens-in`, 420 ms), with its two tangents extending out of the ring
   behind it (`lp-lines-in`, a top-down `clip-path` wipe on `.lp-lines`).
   Narrower than it looks: the lens is positioned from a measurement taken
   after first paint, so it cannot render finished from the first byte the way
   every retired draw-in could, and appearing in a single frame read as a
   glitch. The zoom is the independent `scale` property and the wipe is on the
   container, because `transform` and `width` on the lines are written by
   `Loupe.tsx` on every pointermove.

(Everything else that once moved on load was deleted on the owner's call —
line appearance on load read as motion nobody caused. That covers the figure
draw-ins on figs. 1 and 3 with their `useDrawOnFirstView` hook, `.willdraw`
rules, setting-out ghosts and plate-number replay buttons; the sheet frame's
400 ms four-mask wipe; and the portrait's dimension-line draw. All of it
renders finished from the first byte. The machinery is in git history; do not
reintroduce any of it.)

Each happens once per load and never again, and each is interruptible by
touching the thing it is happening to. **There is no scroll-reveal. Do not
introduce one.**

### `<html>` data attributes

| Attribute                  | Set by                     | Triggers                        |
| -------------------------- | -------------------------- | ------------------------------- |
| `data-theme="light\|dark"` | no-flash → `ThemeProvider` | Every dark surface              |
| `data-ink="<id>"`          | no-flash → `InkProvider`   | The active ink                  |
| `data-repapering`          | `ThemeProvider`, one frame | Kills the `--accent` transition |

These three and nothing else, plus the inline ground colour and
`colorScheme`. `data-mode` is gone.

`data-repapering` is not a third palette axis: it is written and removed inside
one theme swap and is never persisted. It exists so the ink snaps with the
ground it belongs to instead of tweening to catch up with it — see
`:root[data-repapering]` in `tokens.css` and the sweep contract below.
(Registering the surface tokens so ink and ground tween together was tried on
2026-09-01 and reverted with the flat band on the owner's call: the original
snap-under-the-mesh-band is the shipped behaviour.)

---

## Sweep contract

Ink is a glimm band. Paper is a circle from the control. They are different
events on purpose.

1. **Route nav** uses `<ViewTransition name="route">` in
   `app/(press)/layout.tsx`, with its own quiet crossfade. **The `root` group is
   explicitly not animated** (`base.css`): everything outside the routed content
   — header, measuring edge, title block — lands in `root`, and the API's
   default crossfade dipped two identical headers through a pair of half-opaque
   copies. It read as the ink bar under the G blinking out and back on every
   navigation. A paper flip adds `.vt-recolor-radial` and **overrides** that
   `display: none` so the old frame can hold still while the new one opens.
   1a. **React names the routed groups `route_2`, `route_3`… and the CSS
   targets them by class.** `<ViewTransition name="route" default="vt-route">`
   gives every one of them `view-transition-class: vt-route`, and the
   `route-fade` rules in `base.css` select `(.vt-route)`. They selected the
   name `route` for a while, matched nothing, and the browser's own 250ms
   crossfade ran instead. **On a phone there is no route transition at
   all**: `installPhoneRouteSwap()` in `lib/vt.ts` (mounted from
   `ThemeProvider`) replaces `document.startViewTransition` under 640px with
   a stub that applies the update and resolves, because even a zero-length
   transition held the screen for one frame in Chromium and the fixed bar at
   the foot blinked on every navigation. The iris keeps the native call
   through `nativeStart`, captured at module load; nothing else on the site
   calls the document's method directly. Naming the bar as its own group was
   tried instead and WebKit dropped it for 20 frames. **The old route
   snapshots are `display: none`.**
   They are captured where they sat on screen, which after a scroll is under
   the sticky strip, and any crossfade drew them on top of the new header:
   Chromium ghosted the strip for six frames, Safari kept the old text over
   the new page. Naming the header as its own group (`view-transition-name`)
   fixed Chromium and made WebKit drop the header for the whole transition,
   so do not try that again. The new content fades in with no delay over a
   sheet that is simply there. Verified in Chromium and in WebKit
   (Playwright's cached build, driven by `executablePath`).
   1b. **The header paints above the band.** `.hd` is `z-index: 70`, over the
   band's 60. The band re-inks the sheet on an ink pick; the control surface
   that caused it stays legible while it happens.
   1c. **The header is also the only place the `--accent` tween is visible on a
   theme flip**, which is why there is not one any more. See
   `data-repapering` under "`<html>` data attributes".
2. **An ink pick goes through `sweepApply()` in `lib/sweep.ts`.** glimm draws
   one WebGL band and applies the ink underneath it at the midpoint.
   2b. **A paper flip goes through `withViewTransition()` in `lib/vt.ts`.** The
   new sheet is clipped to a circle that opens from the control (viewport
   centre from the keyboard, which has no pointer). A linear band always
   enters from an edge, so a theme flip started from the header flashed the
   left side of the sheet first, then snapped the paper in the open — two
   animations. The live site's iris is the one motion that does not do that.
   Do not also run a sweep on a paper flip: the canvas is snapshotted with
   the root, so the band would freeze or play after the circle as a second
   event.
   2c. **`sweepApply` takes the band as hexes (`{ kind: "pair", hexes }`),
   not as a built palette**, and builds it itself after the module lands.
   `accentPair` pins its two endpoints exactly.
   2d. **glimm's root module is fetched on the first ink pick, not
   imported at the top of a provider.** Static imports of its palette builders
   sat in the root layout chunk, 13.2 kB gzip on every route, including routes
   with no palette control in reach. **Moving one and not the others buys
   nothing**: `glimm/react` carries its own copy of the colour helpers but does
   not export them, so the root module comes back for whichever import is left.
   Everything for the band goes through `lib/sweep.ts` now, including the wavy
   shader in `sweep-shader.ts` (same tick as the glimm import). The 1.6 s
   guard timer starts before the fetch, so a press whose band never arrives
   still gets its ink.
3. **The band is painted in the tray's LIT values — `INK_HEX_DARK` — on both
   grounds.** The flat band is a translucent veil of light, and light is lit:
   sweeping the light-ground pigments, which are dark, filmed the paper brown
   (measured in a pinned-frame harness). An ink pick sweeps the lit values of
   the ink being replaced and the one replacing it.
4. **Direction says how the ink pick was done.** `ltr` when a pointer landed
   on a swatch, `ttb` from a number key. A number key has no position on the
   page, and a different axis is a more honest way to say so than a wipe
   pretending to start somewhere.
5. **The ink swap is fired by whichever comes first, the midpoint or a 1.6 s
   guard**, and `apply` is idempotent so it cannot run twice. See the glimm trap
   in "Stack snapshot" for why the guard is not optional.
6. **A second ink press while the band is still crossing restarts it.**
   `playSweep` continues from the controller's current progress by design,
   which is right for a page navigation and wrong for a toggle.
   `sweepApply` lands the interrupted change immediately, cancels its handle,
   and winds the band back to zero through the controller `SweepProvider`
   hands it via `onController`.
7. **Reduced motion**: glimm's own `reducedMotion: "instant"` default is left
   alone, `withViewTransition` skips the iris and runs the swap, and
   `motion.css` kills the `--accent` transition. The ink and the paper arrive
   rather than travelling.

`SweepProvider`'s settings are all decisions, documented in the file. The band
is a **custom flat shader** (`lib/sweep-shader.ts`), not glimm's `createShader`
and not `createMeshShader`. glimm's own edge is a 0.4% sine × `waveAmount`, so
even 2 reads as a straight stripe (measured: crest x by row differed by ~1%).
The mesh has real harmonics but its swell is a white specular ridge, and with
swell 0 it is a faint haze rather than a band. Ours keeps the flat-quad
controller and puts the mesh's three sines on the edge (~5% at `waveAmount`
1). **`swellAmount` is 0 and must stay 0**: it gates the specular highlight
and Fresnel rim, and the library defaults it to 0.55. Palette samples are
clamped and the wake is 0.12 rather than 0.30. There is no cross-axis
`vfade`: that 1.5% fade was the white strip at the top and bottom, and
growing the canvas past the viewport to hide it is the same replaced-element
trap `.dither` already documents.

Timing is the mesh's — `sweepMs 900` / `outroMs 420` / `midpoint 0.45` /
`houseEase` — and it is **ink only**. Theme is `--dur-iris 720ms`, a
feathered radial mask from the control so the two papers dissolve across the
edge. A hard `clip-path: circle()` jumped a hairline drawing ~25px per
frame and read as skipped frames. Do not put `filter: blur()` on the
view-transition snapshots to mix them: that is the whole sheet, every frame.

`waveAmount` is 1 (the harmonics are already the displacement),
`rippleAmount` is 1, `brightness`/`peakAlpha` stay pulled down because the
library is tuned for white sites.

**An ink pick sweeps two colours.** `accentPair` for the pick, because two
colours is the whole event. A paper flip is not a band.

---

## When you write code

- Server Components by default. Add `"use client"` only when you need state,
  effects, refs, or browser APIs.
- Imports use `@/*` for anything outside the current folder. Don't reach into
  `.claude/`.
- `next/image` runs **unoptimized** under the static export (`images:
{ unoptimized: true }` in `next.config.ts` — there is no optimizer to serve
  a transform). It still earns its keep for lazy loading and layout
  reservation, but the file you commit is the file that ships: size and
  compress images by hand before committing them.
- New entry-style files (sitemap, manifest, OG, route handlers, error/not-found)
  are caught by the existing `knip.json` `entry` glob.
- Don't add new top-level dependencies casually. Check `package.json` and
  `knip.json` first.
- **Images inside an MDX body are lossless WebP, not PNG.** `medium-zoom` needs a
  raw `<img>`, so they cannot go through `next/image` and are served exactly as
  committed — which meant they were the only images on the site not getting
  avif/webp. `cwebp -lossless` is pixel-identical and was 75% smaller on the
  three of them (329 kB → 81 kB); on screenshots it also beats `-q 88`. Post
  covers go through `next/image` too, but the export runs it **unoptimized**,
  so they are served exactly as committed as well: pre-size every cover to
  1520px wide (2x the essay measure) and prefer webp. "They go through
  next/image" excused two covers shipping at 2560px/436 kB as the LCP.
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
- **A new button that plays its own cue wants `data-cue="self"`**, and a new
  shortcut whose action plays its own cue wants `silent: true`. Without them the
  control makes two or three sounds where it means to make one. See the rule
  under "The sheet".
- **A control is 24px to the pointer even when it is smaller than that on the
  page.** The ink chips are 16px painted with an inset `::after` and an 8px gap,
  so the 24px targets tile without overlapping; the ruler's section ticks pay
  for their padding with a matching offset. Both were failing WCAG 2.2's
  2.5.8, and the chips were failing it in the worse direction: overlapping
  targets, where a press lands on somebody else's control.
- **Two of the plate numbers (`.p-fig-lead`) are rendered by their figure
  component**, which sits below the heading in source, and put back on top
  with `order: -1` on the flex column. Do not "fix" that by splitting the
  component in two. (They were replay buttons while the draw-ins existed.)
- **A caption slot that swaps text keys its content and lets the slot animate
  its height.** `interpolate-size: allow-keywords` is set on `:root` in
  `tokens.css`; `.tl-cap` transitions `height`, and the inner `.cap-in` element
  carries a React `key` so it remounts and replays its fade. Without both halves
  the swap reads as a flicker, the height snaps and the text cuts. **Only fig. 5
  still works this way**, because its entries are dates and ranges that cannot
  be evened out. Figs. 1 and 3 take the other road entirely, below. `.xp-cap` is
  gone with them.
- **The figures carry no draw-in.** See the note under "The motion law": the
  self-inking pass (dash offsets, fill-opacity ramps, setting-out ghosts) was
  deliberately deleted, and its hard-won lessons live in git history with it.
- **`CHART` in `app/(press)/content.ts` is a hand-plotted path, not data.**
  `{ x: 10, y: 50 }` is a pixel position in fig. 6's own 272x64 SVG space, so
  `52 - c.y` is a height above a baseline running 2 to 44 and is not a quantity
  of anything. `Pipeline.tsx` uses it correctly, as coordinates. `Loupe.tsx` and
  `Specimens.tsx` feed it to real chart components, and that is fine as a shape
  and **not** fine the moment a component states a value from it. The loupe's
  two charts were on the `…/interactive` entry point, whose picker printed "44"
  in a hover chip and announced "Point 1 of 14: 2" to a screen reader. Both are
  on the **static** entry point now, which has no picker at all, the same as the
  specimen tray. That was the right answer rather than suppressing the picker's
  output, because the interaction here is the loupe: a second focusable control
  inside the sentence was competing with it for the same drag.
  **Every chart drawn from `CHART` must be a static entry point** unless it is
  given a real series first. A plausible number that means nothing is the one
  dishonest thing this page can do, and it is why fig. 3 carries no numbers at
  all.
- **A microcharts chart is coloured through its `color` prop, never by
  selecting its internals.** `.lp-sentence .spark polyline` set the inline
  sparkline in the ink for a while and then silently stopped: the component
  renders a `path`. The one chart on this page that is set in prose was grey
  while the copy beside it called it the real thing, and nothing failed. Both
  the inline chart and the enlarged one in the loupe's detail box pass
  `color="var(--accent)"`, the same way `SpectrumDemo` passes its palette.
- **The loupe's detail box holds the real component, not a picture of it.** It
  was a hand-drawn `<polyline>` of nine literal points inside a lens whose whole
  claim is that the thing in the sentence is real. It is the same `Sparkline` on
  the same `SPARK` series at 280x64 on `curve="smooth"`, with the dimension line
  and the caption as their own small SVG beneath it, so the two cannot drift.
- **The lens is `visibility: hidden` until `Loupe.tsx` raises `data-placed` on
  the STAGE, and that is not the first placement — it is the first placement
  the fonts cannot move.** The lens is positioned by a transform written from a
  measurement, and the placing effect runs after first paint, so a visible lens
  is painted at the stage's top left corner for a frame and then flies onto the
  sentence. Revealing at the first placement only moved the problem: that
  measurement lands before the fonts do, so the reader watched the lens fade in
  at the pre-font position and snap across when they arrived. The flag goes up
  on `document.fonts.ready`, or on a 600 ms guard timer if that promise never
  lands, and `reveal()` is idempotent. It is on the stage rather than on the
  lens so the two tangents share the one moment. It also starts on
  the inline chart rather than on a word (`CHART_WORD`, derived from `WORDS`),
  because the detail box should be showing the component when the reader
  arrives.
- **Never combine `pathLength` with `vector-effect: non-scaling-stroke` on a
  dash-drawn path.** `pathLength` normalises the dash pattern to the path's own
  length, but `non-scaling-stroke` moves dash computation into screen space, so
  `stroke-dasharray: 1` becomes one CSS pixel and the figure prints as a field
  of 1px dashes. It is silent: the drawing simply looks like a scribble. (This
  is why fig. 1's glyphs faded rather than drew, back when the draw-in
  existed, and it still binds anything new that dash-draws a
  non-scaling-stroke path.)
- **A glyph drawn on an isometric face is built from that face's two axes.**
  The projection in `Exploded.tsx` turns a horizontal into a line sloping
  down-right and a vertical into one sloping down-left. Rectangles and axis-
  parallel runs read as figures lying on the surface; free angles and curves
  close up into mush. Three sets of symbols were lost before the rest of the
  rule was found: **the face has to be round enough to draw on** (190 x 80,
  about 2.4:1 — at the 3.5:1 it started with, a square came out as a
  46-degree rhombus and nothing survived), **four strokes is the ceiling**, and
  **one solid fill** is the only mark that reliably singles something out after
  the shear. Prototype glyph sets against the face before committing: a symbol
  that reads flat tells you nothing about how it reads on the slab.
- **A glyph's hover story is transform-only.** Each stroke in `PARTS`
  (`Exploded.tsx`) can carry an `act` class (`write`, `pop`, `part-*`, `plug`)
  that home.css animates while the slab is on: scales and translates in the
  glyph's local plane, which land on the face's axes after the projection. No
  dash-draw here, ever — the pathLength trap below. One local unit is about 2px
  on screen. The stack also parts at the hovered seam (`data-rel="above|below"`
  on the slabs, written by React), and the hovered row's leader inks accent —
  its draw-in transition keeps its delay inside the shorthand, because a bare
  `transition-delay` would sit on the hover stroke change too.
- **A slab's hit target never moves; its drawing does.** Each slab is a static
  `.hit` hexagon (pointer-events: fill, nothing painted) plus a `.lift` group
  holding everything visible, pointer-inert, that the hover transforms move. A
  slab that was its own hit target lifted out from under a pointer on its edge
  and oscillated: enter, lift, leave, drop, enter. Style slab polygons through
  `.lift polygon`, never bare `polygon` — at `[data-on] polygon` specificity
  the accent stroke out-ranks `.hit`'s `stroke: none` and inks the invisible
  hexagon.
- **Fig. 6 is a figure like the rest and carries `fig. 6 · process` plus an
  `<h2>`.** It had the plate label alone, so the largest drawing on the sheet was
  the only one absent from the document outline. It sits outside `.panel`, so
  `.pipe-head h2` restates `.panel h2` rather than inheriting it.
- **Fig. 6 is a grid of four areas (head, note, stage, scrub), and on a phone
  the note goes last and holds two lines.** As a flex row above the stage it
  grew from one line to two between stages and moved everything under it.
  Under 768px the card stays at the top of the stage in every stage and the
  slot below it holds the tallest side panel's height. **Do not centre the
  card while the slot is empty**: a scrub-driven transform that let it rise
  as a panel faded in was tried on 2026-09-03 and read as the card lurching
  on every stage change. Nothing in the stage moves; only opacity does.
  `build()` measures with `--o-tok` and `--o-dom` forced to 1 (the panel rows
  slide 8px as they fade, and the wires sat 8px off their swatches), keys
  its cache on the first swatch as well as the card (the fonts.ready rebuild
  was otherwise skipped), starts each phone wire at the swatch itself and
  lands it 30% into the node (the bottom centre is where the "244" dimension
  and the "2020" axis label sit), and puts the markup chips clear of the
  node's text: header above the card, chart inside the chart's empty
  top-left, button below the button.
- **On a phone (≤640px) the sheet has no frame.** `.sheet` loses its margin
  and border and the registration ticks hide; the gutter is 16px. The frame
  cost 26px of a 375px screen plus a band top and bottom. It returns at 641px.
  The compass closes to zero width once the strip sticks there: it follows a
  pointer the device does not have, and it straddled the rule over the
  reader's content. **The strip has no backdrop blur on a phone**: a
  backdrop-filter over a scrolling page re-blurs every frame on the GPU, and
  that was the frame drop on the home page. The ground is 94% of the paper
  there instead.
- **Arrows are drawn, not typed.** The essay's back link and the home page's
  "all writing" carry inline SVG arrows. The "←" and "→" glyphs fell back to
  whichever font the phone had for them and rendered as specks.
- **A control that swaps its own label reserves the wider string rather than
  resizing.** The copy chip grew 17.6px under the press that confirmed it. Both
  strings sit in one `.cp-slot` grid cell now with the idle one `visibility:
hidden` — the same reserve-don't-animate move as the `.xp-note` slots, and for
  the same reason: `visibility` holds the space while leaving the accessibility
  tree, so the button has exactly one accessible name at a time.
- **Direct manipulation covers everything tied to the hand, not just the thing
  under it.** The loupe killed its own transition while dragging and its two
  leader lines did not, so they eased 260ms behind it for the whole drag. The
  flag is `data-dragging` on `.lp-stage`, not on `.loupe`, because the tangents
  are in a sibling element. Anything that follows a drag goes in that selector.
- **A box that cross-fades its contents needs a `key`, not just a keyframe.**
  `.lp-detail > *` animates `lp-swap`, but React reused the same two nodes, so
  it replayed only on the chart↔word branch change: for 16 of the 17 stops the
  box swapped at t=0 while the lens travelled. The children are keyed on the
  current stop.
- **Every pointer capture needs `onPointerCancel` as well as `onPointerUp`.**
  The browser can take a captured pointer away — a system gesture, a context
  menu, a touch becoming a scroll — and the loupe stayed latched in drag.
- **A drag reads the offset it was grabbed at.** The pipeline's pen handles set
  the control point to the pointer position, so a grab anywhere but the exact
  centre teleported the curve on the first move.
- **Overlapping hit shapes are resolved by distance, not by paint order.** The
  two pen handles are `r="11"` with centres 13.3px apart, so they overlap by
  about 9px and the one painted second took every press in that band — `c1` was
  unreachable through most of its own area. `onHandleDown` picks the nearer
  centre. ⚠️ **This does not make them pass WCAG 2.5.8**: the criterion wants
  24px circles that do not intersect, and 13.3px apart cannot give that without
  moving the handles in the drawing. That is a design decision, not a bug fix.
- **A caption slot is not a live region.** `Caption` takes an `id` and the
  controls that drive it point at it with `aria-describedby`, so it is read once
  on focus. As `aria-live="polite"` a figure with five parts announced five
  times while a pointer crossed it.
- **Text that changes under the pointer goes through
  `components/schematic/Caption.tsx`.** It measures both heights and animates
  between them, because `interpolate-size: allow-keywords` is Chrome 129 and
  Safari 26 and this site's floor is Safari 16.4. Fig. 3 and fig. 5 use it; the
  pipeline's stage note and its computed readout take the `cap-in` fade alone,
  being single lines in a fixed box.
- **Figs. 1 and 3 do not. They reserve instead of animating (`.xp-note`).** The
  slot carries the plate's own copy at rest and a part's note under the pointer,
  and **every string it can hold is rendered into one grid cell, all but the
  live one `visibility: hidden`**. A grid row is as tall as its tallest item, so
  the slot is the tallest note at whatever width the plate happens to be, it
  cannot move when the text swaps, and it stays correct when the copy is next
  edited. `visibility` rather than `opacity`, because hidden also takes the
  ghosts out of the accessibility tree and out of the selection while still
  occupying their space.
  This replaced a Caption sitting above a second paragraph of copy: two blocks
  of prose, the top one growing and shrinking on every part. On fig. 3 that was
  worse than it looked, because both plates in `.mechs2` are grid items of one
  track, so the react-spectrum plate beside it rose and fell along with it.
  **Writing the strings to the same length was tried first and is not enough.**
  It holds at most widths and drops a line at about one viewport in five: a line
  break falls where the spaces are, not where the character count is. The copy
  is still evened up, because it reads better and it keeps the reserved box
  tight, but the grid is what makes it exact.
  **A plate's link moves into `.meta` when its body moves into the slot**, and
  that is not cosmetic: a link inside a block that swaps on hover leaves the tab
  order under a reader tabbing towards it, so the browser picks the next target
  before React puts it back.
- **A figure's top gap is `padding-top`, never `margin-top`, because every
  figure here also carries `margin-block: auto`.** The plates are flex columns
  and the auto margins hand the free space to the figure so it sits centred
  rather than leaving a hole at the foot. Two things follow, and both shipped
  broken. `margin-block` is written after `margin-top`, so it overwrites it and
  the declared gap never applies at all. And an auto margin resolves to **zero**
  when there is no free space, which is exactly the case for a plate that is not
  being stretched by a taller neighbour: `.spectrum` sat flush against its
  paragraph on desktop because it is the tallest thing in its row, and `.xp` sat
  flush against the meta line at every width below 900 because a one-column
  plate is only as tall as its contents. Padding is not distributable, so it
  survives both. `.xp`, `.spectrum` and `.lp-stage` all carry the floor as
  padding now.
- **The loupe is 34px (`R = 17` in `Loupe.tsx`, `.loupe` in home.css) and the
  sentence's leading is 2.3 because of it.** At 58px on a 35px line the ring
  stood over the line above and the line below at every wrap; at 46px on 2.7
  the lines sat so far apart the sentence read as a list (owner, 2026-09-03).
  2.3 × 17.5px is 40px: the ring clears and the crosshair arms land in the
  blank between neighbouring lines' glyphs. The tangents leave the ring at
  ±10px, which the same constants derive; the arms' `box-shadow` offset is the
  diameter plus 8. Below 640px `.lp-lines` is hidden: the detail box is far
  under the ring there and the pair ran through three lines of prose.
- **`.lp-stage`'s padding is also what keeps the lens off the type above it.**
  The word rectangles are measured against the stage box, so padding there
  moves the lens down with the sentence and no second number is needed in
  `Loupe.tsx`.
- **Fig. 5 has two drawings and one is always `display: none`.** Above 900px
  the dimensioned axis (`.tl-scroll`, 720px wide, roles above and below);
  at 900 and under, `.tl-v`, a vertical list of the same `ERAS` with every
  note visible and nothing to hover. The axis scrolled on a phone and opened on
  2022, hiding nine years; at 768 it clipped '15 and "engineer" at the left
  edge. The switch was at 800 and that was measured wrong: the panel gives the
  axis 720px only from 884px up (viewport minus 164px of sheet and panel
  padding), so an 820px iPad still got a scrolling axis. 900 is also where
  `.mechs` collapses. Both are rendered by `Career.tsx`; home.css swaps them.
- **The open-source table's column rules are drawn by `.prow > :nth-child(n +
2)`**, and the phone reset has to name that selector. A bare `.prow > *`
  is out-ranked by it, so the rules survived the reset with their padding gone
  and sat flush against every name and spec under 640px.
- **The open-source table is two-line entries under 640px** (number, name and
  year on the first line, the spec under the name, `grid-template-areas` in
  home.css) and the column heads go with the columns. Four columns in 300px
  put the spec on three lines a row. The writing rows do the same: date and
  read time first, title second.
- **A figure is drawn at a size, and both figures on the sheet are capped to
  it** (`max-width` on `.xp` and on `.sgbfig`). They are percentage-sized inside
  their plate, and the plate doubles in width when its row collapses to one
  column, so without a cap the exploded view went from 241 x 369 to 456 x 700
  and its plate from 683 to 912. More room is not a reason to redraw a figure
  bigger. `.xp` caps at 390 because `--w-sheet` puts the plate at 439 and the
  figure inside it at 389, which is the drawing at its intended size.
- **`.mechs` collapses at 900 and `.mechs2` at 640, and that gap is measured,
  not an oversight.** Two columns were tried on `.mechs` down to 640: it holds
  at 880, and by 780 fig. 1's leader labels run past the plate edge and fig. 2's
  specimen tray truncates its captions ("change po…", "quantile …"). The two
  plates in `.mechs` carry more than the two in `.mechs2` and need the width.
- **`--cap-dir` sets which way a swapped caption enters.** The shared `cap-in`
  keyframe reads it as `calc(var(--cap-dir, 1) * 4px)`, so `1` enters from below
  and `-1` from above. Fig. 1 sets it to the direction the pointer moved along
  the stack, so the note arrives the way the eye did. Fig. 3 does the same along
  its three parts. Every other slot leaves it unset and gets the old rise.
- **The portrait renders a real `<img>` on the server and hides it only once the
  halftone canvas has actually drawn.** Keep it that way — a bare canvas has no
  `alt` and nothing for a crawler. It is a raw `<img>` and **not** `next/image`,
  for the reason set out in the comment at `Portrait.tsx:476`; this file called
  it a `next/image` for a while and the comment was the half that was right.
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
`/about` and `/work`. `ItemList` earns its place: "38 original public repos" is
a number in a sentence, whereas the list names the repositories in a form an
answer engine can cite, each with its real primary language and licence from
`lib/resume.ts`.

## Bundle shape, and one framework leak

Three of the home page's figures are behind `next/dynamic` in
`app/(press)/page.tsx`: the specimen tray (25 static chart builds so a shuffle
can pick eight), the pipeline, and the loupe. `ssr` stays ON for all three.
Specimens' server-rendered eight are the eight the reader sees (no mount
re-roll — the swap a beat after load read as the page failing to settle;
only the "draw another eight" chip re-rolls), the
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
every other route pays for it. (Re-verified 2026-08-31: routing the microcharts
essay's chart imports through `next/dynamic` wrappers reshuffled chunks and
saved ~0 kB for the text-only posts — the manifest group, not the imports, is
the mechanism. Don't retry that shape.)

The script-tag numbers are also only half the wire story: the header's brand
`<Link href="/">` is on every route, and its prefetch pulled the home page's
whole chunk group onto `/resume` and every essay a second after load. It is
`prefetch={false}` now — the home page is static and fetch-on-click is
imperceptible — so the route-size numbers below are real on the network too.

Measured first-load JS, gzip, excluding the `noModule` polyfill nothing at the
browserslist floor fetches: **`/` 220 kB · `/resume` 164 kB · `/blog` 163 kB ·
a blog post 227 kB · 404 163 kB.** Measure it by summing the gzip of every
`<script src>` in the prerendered HTML under `.next/server/app/`; Next no longer
prints the table.

### The home-page chunk leak, and how it was closed

`/resume` and `/_not-found` used to ship ~57 kB gzip of home-page chunks and
render none of it. Two things about it were misdiagnosed for a long time, so
they are written down.

**It was never about the home page's own imports.** Putting the figures behind
`next/dynamic` moved 0.2 kB, because the figures were not what those routes were
pulling. `next/link`'s code lives in the shared chunk `9417`, which every route
already loads — nothing was ever duplicated.

**It was the client-reference manifest listing a chunk _group_ where one file
was needed.** For a route whose own page entry does not contain `next/link`, the
manifest resolves `link.js` against the home page's entrypoint, and then names
every file in that group — `5498` (the chart library), `9042` (the syntax
highlighter), `6521`, `app/(press)/page` — as the requirement for loading it.
`/blog` never leaked because `blog/page.tsx` imports `Link` itself, so its own
entry satisfies the module.

So the fix, on both routes, was to stop referencing `link.js` from a route whose
entry does not carry it:

- **`/resume`** now uses `<Link href="/">` for the `meetguns.com` line instead of
  `<a href={SITE_URL}>`. That was a real bug on its own — an internal navigation
  doing a full page load — and it puts `next/link` in the route's own entry.
  **221.6 → 164.3 kB.**
- **`app/not-found.tsx`** uses plain `<a>` for its three ways out. A 404 is a dead
  end the reader is leaving; prefetching three routes from it buys nothing, and a
  full page load out of a broken URL is the honest cost of not shipping the whole
  home page to render three words. **219.9 → 162.6 kB.**

⚠️ **A route's manifest still _lists_ home-page modules it never references** —
`/resume` names fourteen. That is harmless: listed is not loaded. Only a module
the route actually renders pulls its group in. Diagnose from the `<script>` tags
in the built HTML, not from the manifest's module list.

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
- ❌ Run a glimm sweep for a paper flip. Theme is the iris in `lib/vt.ts`; layering both is two animations, and the band always enters from an edge.
- ❌ Call glimm's `sweep()` directly for a state change. Use `sweepApply()`, or a hidden tab eats the swap.
- ❌ Import `react-spectrum` by its bare name, or delete `react-spectrum.d.ts`.
- ❌ Add a rounded corner that is not `--r-chip` or `--r-point`, or a `box-shadow`. Depth is line weight.
- ❌ Ship anything at `opacity: 0` waiting for a scroll. The three one-shot draw-ins in `motion.css` are the whole allowance.
- ❌ Let `wrangler` edit `wrangler.jsonc` for you. Its "add it on your behalf"
  offers (e.g. `wrangler r2 bucket create`) get **answer no**: saying yes once
  appended a duplicate binding and reformatted the whole file from spaces to
  tabs, collapsing every blank line between the comment blocks.
- ❌ Reintroduce `@opennextjs/cloudflare`, R2, or any incremental cache. The
  site is a static export; the only thing a writable cache ever served was a
  daily star refresh, and `components/LiveStars.tsx` does that in the browser
  now. If a real server need appears, that is a redesign decision, not a config
  flip.
- ❌ Add a route handler without `export const dynamic = "force-static"`, or one
  that answers anything but GET, or anything that reads the incoming request.
  `output: "export"` builds files, not handlers — a POST endpoint has nowhere to
  live.
- ❌ Put headers, redirects, or rewrites back in `next.config.ts`. The export
  ignores them **silently**. Headers go in `public/_headers`, redirects in
  `public/_redirects`.
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
- ❌ Remove the `Cache-Control` rule for `/_next/static` from `public/_headers`. Workers static assets default every response to `max-age=0, must-revalidate`, so without it the content-hashed chunks are never cached. (The old prohibition here was about Next's own server, which set the header itself; the export has no server.)
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
