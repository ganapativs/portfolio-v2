import { Icon } from "@/components/primitives/Icon";
import { Pill } from "@/components/primitives/Pill";
import { AmbientBlob } from "@/components/primitives/AmbientBlob";
import { SectionHead, Ticket, accentAt } from "@/components/sections";
import { JsonLd, routeBreadcrumb, SITE_URL, workItemListSchema } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/metadata";

const caseStudies = [
  {
    n: "01",
    yr: "2025 — now",
    t: "A Customer-Facing AI Assistant & API Docs Portal",
    tags: ["flagship", "tracxn", "AI", "docs portal", "MCP"],
    accent: "terracotta",
    lede: "A self-serve API documentation portal — with an embedded AI assistant — on top of the company's private-market intelligence APIs. Architected end-to-end and hardened continuously since launch. Earlier platform work on the AI side was the warm-up.",
    bullets: [
      "A self-serve API docs portal on Fumadocs — access-scoped, long-form guides kept in sync with the code, the assistant embedded in it",
      "A build-time OpenAPI pipeline feeding both the docs and the assistant's context, so neither drifts from the API",
      "An intent router that picks the model per question — provider-agnostic by default, so new frontier models can be adopted without reworking the stack",
      "Versioned, modular system prompts",
      "A tool surface — API search and docs retrieval among them — plus a skills layer for deeper research flows",
      "An answer surface built for reading — streaming markdown that stays legible mid-stream, tables and charts, and server-side document export",
      "Security and reliability treated as product requirements, not a launch checklist — with an evaluation harness and regression suite that keep both from regressing",
      "Audit-grade conversation logging",
      "A read-only MCP server surface so AI coding clients reach the API without a pasted key — architected and first shipped by me, now co-owned with the team — all alongside platform, design and data work",
    ],
  },
  {
    n: "02",
    yr: "2026 — now",
    t: "microcharts — Word-Sized Charts for React",
    tags: ["own project", "OSS", "library", "a11y", "dataviz"],
    accent: "saffron",
    lede: "106 handcrafted chart types small enough to sit inside a sentence, a table cell, or a streamed AI reply. Zero runtime dependencies, accessible by default, server-component safe. Mine, start to finish — design, code, docs, site.",
    bullets: [
      "106 stable chart types across four tiers — core, decision, expressive, frontier — each grouped by the question it answers, not the shape it draws",
      "One grammar for all of them: a chart is `data` plus a generated sentence, so a model that has seen one can write them all",
      "Measured, not rounded — ~2–7 kB gzip interactive (median 5.0), ~1–4 kB static (median 2.6), budget-gated in CI; 500 server-rendered sparklines in 5.5 ms",
      "Zero runtime dependencies — no chart engine, no D3, just SVG; React is the only peer and CI enforces it",
      "Static charts are hook-free with zero client JavaScript; interactivity is an opt-in subpath composing the static twin — one contract: hover / arrows activate a unit, click or Enter pins, Escape clears",
      "Every chart is an `img` with a natural-language summary built from its own data — accessibility that can't drift; themed through ~two dozen CSS custom properties, `defineTheme` deriving a colour-blind-safe palette and dark twins from one accent",
      "Machine surfaces alongside the human ones — llms.txt, llms-full.txt, a catalog.json of every chart's props and data shapes — and a documented no-list (pie, speedometer, battery, waffle, violin), each failing at micro scale, each with a better in-catalog replacement",
    ],
  },
  {
    n: "03",
    yr: "2016 — now",
    t: "A React Component Library for a Decade",
    tags: ["platform", "tracxn", "10y"],
    accent: "sage",
    lede: "Started in November 2016. The team has been evolving it ever since — through framework upgrades, build-tool migrations, design-system rewrites, and team turnover.",
    bullets: [
      "A PDF viewer rewrite, now live — animations, micro-interactions, vertical-scroll mode",
      "A cross-stack image-loading rewrite — backend, library and app, moving from a custom React loader to native, DPR-aware URLs",
      "A hand-rolled AST codemod for a button-component migration, touching the call-sites the migration needed",
      "Storybook upgrades, build-toolchain modernisation, type-definition cleanup",
      "Storybook hygiene, lint conventions, the small things a long-lived library needs",
    ],
  },
  {
    n: "04",
    yr: "2018 — now",
    t: "Performance & Platform",
    tags: ["platform", "perf"],
    accent: "rose",
    lede: "Bandwidth, FPS, bundle-size — slow-cooked wins across eight years and three repositories, shipped by the platform team.",
    bullets: [
      "Native browser image loading with DPR-aware URLs — bandwidth down, layout shift down, complexity down",
      "react-scan render profiling, an FPS meter for jank hunts, Brotli on static assets",
      "A Puppeteer-based PDF renderer, parallelised and compressed",
    ],
  },
  {
    n: "05",
    yr: "2017 — now",
    t: "Build Tooling & Force Multipliers",
    tags: ["DX", "OSS"],
    accent: "plum",
    lede: "The work that does not show up in feature flags but shows up in how fast every other engineer on the team ships.",
    bullets: [
      "A hand-rolled AST codemod for a long-lived button migration — same tool, hundreds of call-sites",
      "The @ganapativs/* scope on npm — eslint-config-react, eslint-config-react-ts, babel-preset-react, used as team defaults",
      "Cursor and Claude Code dev-tooling rules codifying review and AI-pairing conventions for the team",
    ],
  },
  {
    n: "06",
    yr: "2015 — 2024",
    t: "Mobile & Cross-Platform",
    tags: ["mobile", "browser"],
    accent: "coffee",
    lede: "From the original React Native app in 2015, to a public Chrome Web Store extension nine years later.",
    bullets: [
      "Helped architect and ship the cross-platform iOS + Android app on React Native + Redux",
      "Years later: a full React Native upgrade, plus the iOS app-site-association work",
      "A Chrome + Firefox extension build pipeline for the product",
      "Priority Browser Extension — a small productivity utility, live on Chrome Web Store and Firefox since May 2024",
    ],
  },
  {
    n: "07",
    yr: "2019 — 2025",
    t: "Data Ingest & PDF Tooling",
    tags: ["data", "backend"],
    accent: "terracotta",
    lede: "Data pipelines and the document-processing primitives sitting underneath them — built with the data team.",
    bullets: [
      "A streaming ingestion pipeline for regulatory filings — resilient fetch orchestration and scheduling",
      "Reusable batch and stream consumer building blocks for the data team",
      "puppeteer-warc — public OSS, captures Web ARChive (WARC) of pages",
      "PDFium and PDF-tooling sandboxes that later fed the production PDF viewer rewrite",
    ],
  },
];

const flagships: {
  yr: string;
  t: string;
  stars: number;
  sub: string;
  href: string;
  live?: string;
  tagOverride?: string;
}[] = [
  {
    yr: "2026",
    t: "@microcharts/react",
    stars: 0,
    sub: "106 word-sized chart types for React. Zero dependencies, ~1–7 kB gzip each, accessible by default, RSC-safe.",
    href: "https://github.com/ganapativs/microcharts",
    live: "microcharts.dev",
    tagOverride: "v0.8.0 · 106 charts",
  },
  {
    yr: "2016",
    t: "bttn.css",
    stars: 2052,
    sub: "A CSS button library — Product Hunt feature in 2016, still in people's projects today.",
    href: "https://github.com/ganapativs/bttn.css",
    live: "bttn.surge.sh",
  },
  {
    yr: "2019",
    t: "react-spectrum",
    stars: 318,
    sub: "Generate colourful text placeholders, from any string.",
    href: "https://github.com/ganapativs/react-spectrum",
    live: "react-spectrum.netlify.app",
  },
  {
    yr: "2018",
    t: "react-dynamic-import",
    stars: 28,
    sub: "Dynamic imports for React with hooks. Suspense-ready.",
    href: "https://github.com/ganapativs/react-dynamic-import",
  },
  {
    yr: "2019",
    t: "react-delightful-scroller",
    stars: 24,
    sub: "Virtualised infinite scroll. Subject of the TinyConf 2 talk.",
    href: "https://github.com/ganapativs/react-delightful-scroller",
  },
  {
    yr: "2024",
    t: "priority-browser-extension",
    stars: 3,
    sub: "A productivity new-tab utility, live in the Chrome Web Store and Firefox add-on store.",
    href: "https://github.com/ganapativs/priority-browser-extension",
  },
  {
    yr: "2017",
    t: "pure-cache",
    stars: 11,
    sub: "Tiny, pure JavaScript caching utility.",
    href: "https://github.com/ganapativs/pure-cache",
  },
  {
    yr: "2025",
    t: "puppeteer-warc",
    stars: 5,
    sub: "Web ARChive (WARC) capture utility on top of Puppeteer.",
    href: "https://github.com/ganapativs/puppeteer-warc",
  },
  {
    yr: "2025",
    t: "rust-learning-plan",
    stars: 0,
    sub: "Notes from learning Rust, published openly.",
    href: "https://github.com/ganapativs/rust-learning-plan",
    live: "ganapativs.github.io/rust-learning-plan",
    tagOverride: "learning",
  },
];

const archive = [
  {
    t: "SGB",
    d: "personal data-generation workbench (TS + Next.js) — live at sgb.vercel.app, four years of iteration",
    v: "live",
    yr: "'21 → '25",
    href: "https://sgb.vercel.app",
  },
  {
    t: "@ganapativs/eslint-config-react",
    d: "shared eslint config",
    v: "v0.3.0",
    yr: "2024",
    href: "https://www.npmjs.com/package/@ganapativs/eslint-config-react",
  },
  {
    t: "@ganapativs/eslint-config-react-ts",
    d: "eslint config for TS",
    v: "v0.2.0",
    yr: "2022",
    href: "https://www.npmjs.com/package/@ganapativs/eslint-config-react-ts",
  },
  {
    t: "@ganapativs/babel-preset-react",
    d: "babel preset",
    v: "v0.0.7",
    yr: "2022",
    href: "https://www.npmjs.com/package/@ganapativs/babel-preset-react",
  },
];

export const metadata = pageMetadata({
  title: "Work",
  path: "/work",
  description:
    "Seven case studies across a decade — an AI assistant and API docs portal, microcharts, a long-lived React component library, performance, tooling and more.",
});

export default function WorkPage() {
  const itemList = workItemListSchema(
    caseStudies.map((c) => ({
      name: c.t,
      description: c.lede,
      url: `${SITE_URL}/work#case-${c.n}`,
    })),
  );
  return (
    <div className="surface">
      <AmbientBlob />
      <JsonLd data={[itemList, routeBreadcrumb("Work", "/work")]} />
      <div className="container-narrow">
        <div className="surface-pill">
          <Pill warm>work · 55 original repos · 15 npm packages</Pill>
        </div>
        <h1 className="surface-h1">
          A decade of <em className="flourish">code</em>,
          <br />
          told in seven case studies.
        </h1>
        <p className="lede surface-lede">
          Each thread spans years and multiple repositories — work shipped with the team at one
          company, one library that&apos;s entirely mine, plus the public OSS that fell out of both.
          Read the long-form, or scroll for the index.
        </p>

        <div className="section section--anchor">
          <SectionHead size="lg" meta="seven long-form">
            Case <em className="section-accent">studies</em>
          </SectionHead>
          <div className="cs-grid-v2">
            {caseStudies.map((c) => (
              <details key={c.n} id={`case-${c.n}`} className={`cs-card-v2 stat-${c.accent}`}>
                <summary className="cs-v2-summary" aria-label={`Case study ${c.n}: ${c.t}`}>
                  <div className="cs-v2-side">
                    <div className="cs-v2-num">{c.n}</div>
                    <div className="cs-v2-yr">{c.yr}</div>
                  </div>
                  <div className="cs-v2-body">
                    <h3 className="cs-v2-title">{c.t}</h3>
                    <div className="cs-v2-tags">
                      {c.tags.map((t) => (
                        <span key={t} className="cs-v2-tag">
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="cs-v2-lede">{c.lede}</p>
                    <span className="cs-v2-toggle" aria-hidden="true">
                      <span className="cs-v2-toggle-text">read more</span>
                      <span className="cs-v2-toggle-text cs-v2-toggle-text-open">read less</span>
                      <span className="cs-v2-toggle-chev" />
                    </span>
                  </div>
                </summary>
                <div className="cs-v2-detail">
                  <ul className="cs-v2-bullets">
                    {c.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              </details>
            ))}
          </div>
        </div>

        <div className="section section--loose">
          <SectionHead meta="2,400+ ★ combined">
            Flagship <em className="section-accent">open source</em>
          </SectionHead>
          <div className="ticket-list">
            {flagships.map((p, i) => (
              <Ticket
                key={p.t}
                accent={accentAt(i)}
                yr={p.yr}
                title={p.t}
                sub={`${p.sub}${p.live ? ` — live: ${p.live}` : ""}`}
                tag={p.tagOverride ?? `${p.stars.toLocaleString()} ★`}
                href={p.href}
              />
            ))}
          </div>
        </div>

        <div className="section section--loose">
          <SectionHead size="sm" meta="npm + older repos">
            The rest of the <em className="section-accent">catalogue</em>
          </SectionHead>
          <div className="oss-grid-v2">
            {archive.map((p, i) => (
              <a
                key={p.t}
                className={`oss-row-v2 stat-${accentAt(i)}`}
                href={p.href}
                target="_blank"
                rel="noreferrer"
              >
                <span className="oss-v2-dot" aria-hidden="true" />
                <div className="oss-v2-main">
                  <div className="oss-v2-name">{p.t}</div>
                  <div className="oss-v2-desc">{p.d}</div>
                </div>
                <div className="oss-v2-meta">
                  {p.v} · {p.yr}
                </div>
              </a>
            ))}
          </div>
          <p className="flourish-aside">
            — all 55 original repos at{" "}
            <a
              className="ulink"
              href="https://github.com/ganapativs?tab=repositories"
              target="_blank"
              rel="noreferrer"
            >
              github.com/ganapativs
            </a>
            .
          </p>
        </div>

        <div className="section section--tight">
          <SectionHead meta="drawn from one library">
            Selected <em className="section-accent">talk</em>
          </SectionHead>
          <a
            className="speak-card"
            href="https://blog.geekyants.com/tinyconf-2-2019-a-tiny-conference-about-react-59496b8d9aa"
            target="_blank"
            rel="noreferrer"
          >
            <div className="speak-date">
              07.dec<span className="yr">2019</span>
            </div>
            <div className="speak-body">
              <div className="speak-event">TinyConf 2 — Bangalore</div>
              <div className="speak-title">
                Building infinite scrolling — challenges &amp; virtualization as the answer
              </div>
              <div className="speak-sub">
                Drawn directly from <em>react-delightful-scroller</em> (24 ★) and its{" "}
                <em>react-iscroller</em> precursor.
              </div>
            </div>
            <Icon name="arrow" size={18} className="arrow" />
          </a>
        </div>
      </div>
    </div>
  );
}
