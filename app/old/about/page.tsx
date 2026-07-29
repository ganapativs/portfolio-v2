import Link from "next/link";
import Image from "next/image";
// eslint-disable-next-line import/no-unassigned-import -- chart stylesheet, side-effect import by design
import "@microcharts/react/styles.css";
import { HeatStrip } from "@microcharts/react/heat-strip/interactive";
import { Pill } from "@/components/primitives/Pill";
import { AmbientBlob } from "@/components/primitives/AmbientBlob";
import { SectionHead } from "@/components/sections";
import { JsonLd, profilePageSchema, routeBreadcrumb, SITE_URL } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/metadata";
import { education } from "@/lib/resume";

// Public GitHub contributions per year, 2015 → 2026 (2026 partial) — fetched
// from the GitHub contributions API. Real data; refresh it now and then.
const CONTRIBUTIONS = [1601, 3280, 2777, 2104, 2733, 1418, 1233, 885, 449, 546, 507, 840];

const timeline = [
  {
    when: "2023 → now",
    role: "Vice President — Technology",
    org: "Tracxn · Bengaluru",
    desc: "Multiple threads, with the team. The customer-facing AI assistant and the API documentation portal it lives in — a Fumadocs portal over an OpenAPI-driven pipeline, an intent router that picks the model per question, a tool and skills layer, versioned prompts behind an evaluation harness, and an MCP server for AI coding clients. Shipped, and hardened continuously since. A parallel performance and modernisation push across portal, library and backend. The PDF viewer rewrite, now live. And outside all of it, microcharts — 106 word-sized React chart types, entirely my own.",
  },
  {
    when: "2022 — 2023",
    role: "Senior Associate VP — Technology",
    org: "Tracxn",
    desc: "Org-wide technical ownership. Browser-extension build pipeline across Chrome and Firefox; Storybook and build-toolchain upgrades; a hand-rolled AST codemod that migrated a button component across a long-lived frontend.",
  },
  {
    when: "2020 — 2022",
    role: "Associate VP — Technology",
    org: "Tracxn",
    desc: "Multi-team architect — translating product asks into engineering work, reviewing the queue, escalating what needed escalating. Most of this work doesn't show up in commits.",
  },
  {
    when: "2016 — 2020",
    role: "Technology Lead",
    org: "Tracxn",
    desc: "Created the internal React component library that the team has built on for the decade since. Stood up the first Node-based backend service. Helped standardise the Webpack / Babel / ESLint / Storybook stack across frontends.",
  },
  {
    when: "2015 — 2016",
    role: "Software Engineer",
    org: "Tracxn",
    desc: "First commit on day one. Worked on the original landing page, dashboard, feeds and signup flow. Helped architect and ship the cross-platform mobile app on React Native + Redux.",
  },
  {
    when: "2014 — 2015",
    role: "UI/UX Engineer",
    org: "InvenZone · Mumbai",
    desc: "Wireframed, designed and shipped UI/UX for invenzone.com (researcher social network) and the early arya.ai (applied-AI product).",
  },
  {
    when: "2013 — 2014",
    role: "Intern, Web Frontend",
    org: "Thinkappz · Bengaluru",
    desc: "Built the frontend for eezyconnect.com. First public GitHub repos date from this period — they're still up there.",
  },
];

const skills = [
  {
    label: "core",
    strong: ["TypeScript", "JavaScript", "CSS"],
    items: ["TypeScript", "JavaScript", "CSS", "HTML", "Python"],
  },
  {
    label: "frameworks & UI",
    strong: ["React", "React Native", "Next.js"],
    items: ["React", "React Native", "Next.js", "Redux", "Tailwind", "MDX", "Fumadocs"],
  },
  {
    label: "AI / LLM",
    strong: ["MCP", "Vercel AI SDK", "Anthropic SDK", "agent harness", "prompt caching"],
    items: [
      "Vercel AI SDK",
      "Anthropic SDK",
      "OpenAI SDK",
      "MCP",
      "agent harness",
      "model routing",
      "prompt caching",
      "prompt versioning",
      "tool-use / function calling",
      "OpenAPI tooling",
      "evals",
      "prompt-injection defense",
      "SSE streaming",
    ],
  },
  {
    label: "dataviz & a11y",
    strong: ["SVG", "React Server Components"],
    items: [
      "SVG",
      "React Server Components",
      "WAI-ARIA",
      "design tokens",
      "gzip size budgets",
      "colour-blind-safe palettes",
      "visual regression",
    ],
  },
  {
    label: "backend & data",
    strong: [] as string[],
    items: ["Node.js", "Kafka", "AWS (S3, Lambda)", "Puppeteer", "WARC"],
  },
  {
    label: "build & DX",
    strong: [] as string[],
    items: [
      "Webpack",
      "esbuild",
      "Vite",
      "ESLint",
      "Storybook",
      "AST codemods",
      "Cursor",
      "Claude Code",
    ],
  },
  {
    label: "document & perf",
    strong: [] as string[],
    items: [
      "PDF rendering",
      "@react-pdf/renderer",
      "exceljs",
      "react-scan",
      "Brotli",
      "DPR-aware images",
      "virtualised rendering",
    ],
  },
];

export const metadata = pageMetadata({
  title: "About",
  path: "/about",
  description:
    "A decade in one place — Tracxn since 2015, currently VP, Technology. Hiring, mentoring, technical direction, and most weeks, still on the keyboard.",
  ogType: "profile",
});

export default function AboutPage() {
  return (
    <div className="surface">
      <AmbientBlob />
      <JsonLd data={[profilePageSchema(`${SITE_URL}/about`), routeBreadcrumb("About", "/about")]} />
      <div className="container-narrow">
        <div className="surface-pill about-pill-row">
          <Pill>about</Pill>
          <Link href="/old/resume" className="ulink about-resume-cta">
            View resume →
          </Link>
        </div>

        <div className="surface-body about-body">
          <div className="career-side about-float">
            <span className="career-stamp">
              <Image src="/portrait/ganapativs.webp" alt="Ganapati V S" width={112} height={112} />
            </span>
            <div className="career-ticket">
              <span className="career-ticket-label">career arc · 2013 → now</span>
              <span className="career-ticket-rows">
                <span>2013 · first public repo</span>
                <span>2015 · joins Tracxn</span>
                <span>2023 · VP, Technology</span>
              </span>
              <HeatStrip
                data={CONTRIBUTIONS}
                title="Contribution intensity by year, 2015 to 2026"
                width={210}
                height={16}
                style={{ width: "100%" }}
              />
              <span className="career-ticket-subfoot">intensity by year · hover</span>
              <span className="career-ticket-foot">microcharts · open source</span>
            </div>
          </div>

          <h1 className="surface-h1 h1-giant about-h1">
            A decade,
            <br />
            <span className="h1-outline">one place.</span>
          </h1>

          <p className="first">
            I&apos;m <strong>Ganapati V S</strong> — an engineer in Bengaluru. I joined{" "}
            <a href="https://tracxn.com" target="_blank" rel="noreferrer" className="ulink">
              Tracxn
            </a>{" "}
            in 2015 as a software engineer, and I&apos;m currently <strong>VP, Technology</strong>.
            The role is mostly about the team now, but most weeks I&apos;m still writing code with
            them.
          </p>
          <p>
            Outside that work — and uninterrupted since 2013 — there&apos;s a small catalogue of
            public stuff on GitHub and npm. One conference talk:{" "}
            <a
              href="https://blog.geekyants.com/tinyconf-2-2019-a-tiny-conference-about-react-59496b8d9aa"
              target="_blank"
              rel="noreferrer"
              className="ulink"
            >
              TinyConf 2 in Bangalore, back in 2019
            </a>
            .
          </p>
          <p>
            The current one is{" "}
            <a href="https://microcharts.dev" target="_blank" rel="noreferrer" className="ulink">
              microcharts
            </a>{" "}
            — 106 word-sized chart types for React, small enough to sit inside a sentence or a table
            cell. Zero runtime dependencies, accessible by default, and written so a language model
            can emit one mid-reply that a person can still read and trust.
          </p>
        </div>

        <div className="section">
          <SectionHead size="lg" meta="2013 → now">
            Career <em className="section-accent">arc</em>
          </SectionHead>
          <div className="timeline">
            {timeline.map((r) => (
              <div key={r.when} className="tl-row">
                <div className="when">{r.when}</div>
                <div>
                  <div className="role">{r.role}</div>
                  <div className="org">{r.org}</div>
                  <div className="desc">{r.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section section--tight">
          <SectionHead meta="before Tracxn">
            <em className="section-accent">Education</em>
          </SectionHead>
          <ul className="about-edu">
            {education
              .filter((e) => e.kind !== "role")
              .map((e) => (
                <li key={`${e.title}-${e.org}`}>
                  <div className="about-edu-line">
                    <span className="about-edu-title">{e.title}</span>
                    <span className="about-edu-sep" aria-hidden="true">
                      ·
                    </span>
                    {e.href ? (
                      <a
                        href={e.href}
                        target="_blank"
                        rel="noreferrer"
                        className="ulink about-edu-org"
                      >
                        {e.org}
                      </a>
                    ) : (
                      <span className="about-edu-org">{e.org}</span>
                    )}
                    <span className="about-edu-range">{e.range}</span>
                  </div>
                  {e.detail && <div className="about-edu-detail">{e.detail}</div>}
                </li>
              ))}
          </ul>
        </div>

        <div className="section section--tight">
          <SectionHead meta="at-a-glance" variant="borderless">
            Tech <em className="section-accent">stack</em>
          </SectionHead>
          <div className="skill-cluster">
            {skills.map((g) => (
              <div key={g.label} className="skill-group">
                <div className="skill-label">{g.label}</div>
                <div className="chips">
                  {g.items.map((s) => (
                    <span key={s} className={"chip " + (g.strong.includes(s) ? "is-strong" : "")}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="section section--tight">
          <SectionHead size="sm">
            <em className="section-accent">Off-screen</em>
          </SectionHead>
          <div className="surface-body">
            <p>
              Travel and photography, mostly together. Soccer, badminton, the occasional video game.
              English, Hindi, Kannada.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
