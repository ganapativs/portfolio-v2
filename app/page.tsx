import Link from "next/link";
import type { Metadata } from "next";
// eslint-disable-next-line import/no-unassigned-import -- chart stylesheet, side-effect import by design
import "@microcharts/react/styles.css";
import { published } from "@/app/blog/posts";
import { HeroSignal } from "@/components/HeroSignal";
import { Btn } from "@/components/primitives/Btn";
import { Icon } from "@/components/primitives/Icon";
import { GLogo } from "@/components/primitives/GLogo";
import { IndiaFlag } from "@/components/primitives/IndiaFlag";
import { AmbientBlob } from "@/components/primitives/AmbientBlob";
import {
  SectionHead,
  StatBlock,
  Pillar,
  Ticket,
  PostCard,
  type Accent,
} from "@/components/sections";
import { Reveal } from "@/components/Reveal";
import { RevealGroup } from "@/components/RevealGroup";
import { ShaderHero } from "@/components/ShaderHero";
import { ContactSection } from "@/components/ContactSection";

const selectedWork: {
  yr: string;
  t: string;
  sub: string;
  tag: string;
  accent: Accent;
  href: string;
}[] = [
  {
    yr: "2026",
    t: "microcharts",
    sub: "106 word-sized chart types for React — zero dependencies, ~1–7 kB each, accessible by default. microcharts.dev",
    tag: "106 charts",
    accent: "terracotta",
    href: "https://github.com/ganapativs/microcharts",
  },
  {
    yr: "2016",
    t: "bttn.css",
    sub: "A CSS button library — Product Hunt feature in 2016, still in people's projects today.",
    tag: "2,050+ ★",
    accent: "rose",
    href: "https://github.com/ganapativs/bttn.css",
  },
  {
    yr: "2019",
    t: "react-spectrum",
    sub: "Generate colourful text placeholders, from any string.",
    tag: "318 ★",
    accent: "plum",
    href: "https://github.com/ganapativs/react-spectrum",
  },
  {
    yr: "2024",
    t: "priority browser extension",
    sub: "A productivity new-tab utility, live in the Chrome Web Store and Firefox add-on store.",
    tag: "shipped",
    accent: "sage",
    href: "https://github.com/ganapativs/priority-browser-extension",
  },
  {
    yr: "2025",
    t: "puppeteer-warc",
    sub: "Web ARChive (WARC) capture utility on top of Puppeteer.",
    tag: "OSS",
    accent: "saffron",
    href: "https://github.com/ganapativs/puppeteer-warc",
  },
];

const operatingPillars: { i: string; accent: Accent; t: string; d: string }[] = [
  {
    i: "01",
    accent: "plum",
    t: "Hands-on, most days",
    d: "Primarily building right now. The AI wave made it far faster to take an idea to something real — so I'm back in the code.",
  },
  {
    i: "02",
    accent: "terracotta",
    t: "Hiring & interviewing",
    d: "Deep in the frontend hiring loop — full-loop interviews, and shaping the rubric we hire against.",
  },
  {
    i: "03",
    accent: "sage",
    t: "Technical direction",
    d: "Architecture reviews, RFCs, framework upgrades, codemods — the calls that keep a long-lived codebase moving.",
  },
  {
    i: "04",
    accent: "rose",
    t: "Cross-team delivery",
    d: "Work that cuts across app, platform and infra teams. The AI assistant and docs portal is the current one.",
  },
  {
    i: "05",
    accent: "saffron",
    t: "Mentoring & growth",
    d: "1:1s, direction, and clearing blockers — coaching people forward, not running a process.",
  },
  {
    i: "06",
    accent: "coffee",
    t: "Culture & craft",
    d: "Cursor and Claude Code conventions, review standards, Storybook hygiene — the defaults the team inherits.",
  },
];

// Hand-written teaser copy per slug; everything else (title, tag, accent,
// read time, order) derives from app/blog/posts.ts so the home cards can't
// drift from the /blog index.
const TEASER_SUBS: Record<string, string> = {
  "microcharts-word-sized-charts":
    "Why I built 106 tiny chart types for React — and why the constraints turned out to be the product.",
  "aborting-a-fetch-request":
    "The AbortController API, the gotchas, and why your dropdowns flicker without it.",
  "introducing-react-spectrum": "A small library for generating colourful text placeholders.",
};

const blogTeasers = published
  .filter((p) => p.slug in TEASER_SUBS)
  .slice(0, 3)
  .map((p, i) => ({
    t: p.title,
    sub: TEASER_SUBS[p.slug],
    tag: p.tag,
    accent: p.accent,
    n: String(i + 1).padStart(2, "0"),
    read: p.read,
    href: `/blog/${p.slug}`,
  }));

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <div className="surface home-v4">
      <AmbientBlob />
      <div className="hero-shader-v2-wrap" aria-hidden="true">
        <ShaderHero className="shader-hero-v2" />
      </div>

      <div className="container-narrow home-v4-container">
        <header className="hero-v4 hero-v6">
          <div className="hero-v6-grid">
            <div className="hero-v6-main">
              <div className="hero-id">
                <GLogo size={36} />
                <div className="hero-id-col">
                  <span className="hero-id-name">
                    Ganapati V S{" "}
                    <span className="id-flag">
                      <IndiaFlag />
                    </span>
                  </span>
                  <span className="hero-id-sub">VP, Technology · Tracxn · Bengaluru</span>
                </div>
              </div>

              <h1 className="hero-h1 h1-giant">
                <span className="h1-line2">
                  Engineering <span className="h1-outline">leader.</span>
                </span>
                <br />
                <em className="flourish hl-accent">Still</em> shipping.
              </h1>

              <p className="hero-lede">
                Ten years at{" "}
                <a href="https://tracxn.com" target="_blank" rel="noreferrer" className="ulink">
                  Tracxn
                </a>{" "}
                — joined as an engineer in 2015, now VP, Technology. Since 2025: a customer-facing
                AI assistant and the API documentation portal it lives in. On the side,{" "}
                <a
                  href="https://microcharts.dev"
                  target="_blank"
                  rel="noreferrer"
                  className="ulink"
                >
                  microcharts
                </a>{" "}
                — 106 word-sized chart types for React.
              </p>

              <div className="hero-actions">
                <Btn variant="primary" withArrow href="/about">
                  about
                </Btn>
                <Btn variant="ghost" href="/work">
                  selected work →
                </Btn>
              </div>

              <div className="social-row">
                <a
                  className="soc"
                  href="https://github.com/ganapativs"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub profile"
                >
                  <Icon name="github" size={16} />
                </a>
                <a
                  className="soc"
                  href="https://linkedin.com/in/ganapativs"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn profile"
                >
                  <Icon name="linkedin" size={16} />
                </a>
                <a
                  className="soc"
                  href="https://x.com/ganapativs"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Twitter profile"
                >
                  <Icon name="twitter" size={16} />
                </a>
                <a className="soc" href="mailto:vsg.inbox@gmail.com" aria-label="Send email">
                  <Icon name="mail" size={16} />
                </a>
                {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
                <a className="soc" href="/rss.xml" aria-label="RSS feed">
                  <Icon name="rss" size={16} />
                </a>
              </div>
            </div>

            <aside className="hero-v6-side">
              <HeroSignal />
            </aside>
          </div>
        </header>

        <div className="section section--anchor">
          <Reveal>
            <SectionHead size="lg" meta="public receipts">
              By the <em className="section-accent">numbers</em>
            </SectionHead>
          </Reveal>
          <RevealGroup stagger={80} className="stat-blocks stat-blocks--mosaic">
            <StatBlock
              accent="plum"
              big="10"
              unit="+ yrs"
              cap="at one company"
              sub="building, shipping, mentoring"
              long
            />
            <StatBlock
              accent="terracotta"
              big="55"
              cap="original repos"
              sub="on github since 2013"
            />
            <StatBlock accent="saffron" big="15" cap="npm packages" sub="a decade-long trail" />
            <StatBlock
              accent="sage"
              big="2.4"
              unit="k ★"
              cap="combined github stars"
              sub="across the catalogue"
            />
          </RevealGroup>
        </div>

        <div className="section section--tight">
          <Reveal>
            <SectionHead meta="the operating system" variant="borderless">
              How the work gets <em className="section-accent">done</em>
            </SectionHead>
          </Reveal>
          <RevealGroup stagger={60} className="pillar-grid">
            {operatingPillars.map((p) => (
              <Pillar key={p.i} accent={p.accent} num={p.i} title={p.t} desc={p.d} />
            ))}
          </RevealGroup>
        </div>

        <div className="section">
          <Reveal>
            <SectionHead meta="the short list, from a decade of repos">
              Selected <em className="section-accent">work</em>
            </SectionHead>
          </Reveal>
          <Reveal>
            <div className="ticket-list">
              {selectedWork.map((p) => (
                <Ticket
                  key={p.t}
                  accent={p.accent}
                  yr={p.yr}
                  title={p.t}
                  sub={p.sub}
                  tag={p.tag}
                  href={p.href}
                />
              ))}
            </div>
            <Link className="see-all" href="/work">
              see all seven case studies →
            </Link>
          </Reveal>
        </div>

        <div className="section section--loose">
          <Reveal>
            <SectionHead meta="/blog">
              From the <em className="section-accent">blog</em>
            </SectionHead>
          </Reveal>
          <RevealGroup stagger={80} className="post-grid">
            {blogTeasers.map((p) => (
              <PostCard
                key={p.href}
                accent={p.accent}
                n={p.n}
                tag={p.tag}
                read={p.read}
                title={p.t}
                sub={p.sub}
                href={p.href}
              />
            ))}
          </RevealGroup>
          <Reveal>
            <Link className="see-all" href="/blog">
              all writing →
            </Link>
          </Reveal>
        </div>

        <ContactSection />
      </div>
    </div>
  );
}
