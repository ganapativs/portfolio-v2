import { flagships, skills } from "@/lib/resume";

/**
 * Homepage copy, kept out of the JSX so the page reads as structure.
 *
 * Numbers that also appear on the résumé (star counts, repo totals) are pulled
 * from lib/resume.ts rather than retyped, so the two surfaces cannot drift.
 */

// One row per year on the press. Index 0 is 2015, the first commit.
export const YEARS: readonly (readonly [string, string])[] = [
  ["2015", "First commit on day one. The landing page, the dashboard, feeds, the signup flow."],
  ["2016", "bttn.css, and the internal React component library the team still builds on."],
  ["2017", "The library spreads through the product. Nothing public."],
  ["2018", "react-dynamic-import. Otherwise a quiet year on the record."],
  ["2019", "react-spectrum, react-delightful-scroller, and one conference talk."],
  ["2020", "Associate VP. Multi-team architecture. Most of it does not show up in commits."],
  ["2021", "Quiet at work. Off it, the Sovereign Gold Bond tracker — a scraper, a cron, a site."],
  ["2022", "Senior Associate VP. A codemod across eight years of frontend."],
  ["2023", "VP, Technology. The hiring loop and the rubric we interview against."],
  ["2024", "priority, a new-tab extension that shows you one task."],
  ["2025", "The assistant, the documentation portal, and puppeteer-warc."],
  ["2026", "microcharts. 106 word-sized chart types, entirely my own time."],
] as const;

// Promotions banked by the end of each year above. Same length as YEARS.
export const PROMOTIONS: readonly number[] = [0, 1, 1, 1, 1, 2, 2, 3, 4, 4, 4, 4];

export const PROMOTION_WORDS = ["no", "one", "two", "three", "four"] as const;

export type Role = {
  era: string;
  title: string;
  body: string;
  aside?: string;
  now?: boolean;
  before?: boolean;
};

export const ROLES: readonly Role[] = [
  {
    era: "2023 → now",
    title: "VP, Technology",
    now: true,
    body: "The frontend hiring loop and the rubric we interview against. Architecture reviews, RFCs, framework upgrades. 1:1s, direction, and getting things out of people's way.",
  },
  {
    era: "2022 – 2023",
    title: "Senior Associate VP",
    body: "A browser-extension build pipeline across Chrome and Firefox. And a hand-rolled AST codemod that migrated a button component across a frontend that had been alive for eight years.",
  },
  {
    era: "2020 – 2022",
    title: "Associate VP",
    body: "Multi-team architecture. Translating product asks into engineering work, reviewing the queue, escalating what needed escalating.",
    aside: "Most of this doesn't show up in commits.",
  },
  {
    era: "2016 – 2020",
    title: "Technology Lead",
    body: "I wrote the internal React component library. The team has built on it for the decade since, which makes it the most useful thing I've made and the least visible. Also the first Node service and the Webpack, Babel, ESLint and Storybook stack everyone inherited.",
  },
  {
    era: "2015 – 2016",
    title: "Software Engineer",
    body: "First commit on day one. The landing page, the dashboard, feeds, the signup flow. Then the mobile app on React Native and Redux, when both were new.",
  },
  {
    era: "2013 – 2015 · before",
    title: "Thinkappz, then InvenZone",
    before: true,
    body: "The frontend for eezyconnect.com. Then the UI for invenzone.com, a social network for researchers, and for early arya.ai. My first public repos date from here. They're still up there.",
  },
] as const;

const stars = (name: string) => flagships.find((f) => f.name === name)?.stars ?? 0;

export const BTTN_STARS = stars("bttn.css");

/**
 * The stack line on the home page — a highlight reel, not the résumé's list.
 * Ten names, weighted to what the recent work actually uses, because a wall of
 * every tool ever touched says less than a short list does.
 *
 * Each one is looked up in lib/resume's skills rather than retyped, and a miss
 * throws at module load: the build fails loudly rather than shipping a name the
 * résumé no longer claims.
 */
const SKILL_ITEMS = new Set(skills.flatMap((g) => g.items));

export const STACK: readonly string[] = [
  "TypeScript",
  "React",
  "Next.js",
  "React Server Components",
  "Tailwind",
  "MCP",
  "Vercel AI SDK",
  "Anthropic SDK",
  "agent harness",
  "evals",
].map((name) => {
  if (!SKILL_ITEMS.has(name)) {
    throw new Error(`content.ts STACK: "${name}" is not in lib/resume.ts skills — renamed?`);
  }
  return name;
});

/**
 * The one piece of work that gets argued rather than listed.
 *
 * Everything else on this page says what a thing *is*. This says what was hard
 * and what I chose — which is the only thing a reader can actually judge. It
 * leads the section because it is the most recent and the most current work,
 * and because the stack line two sections up claims MCP, evals and an agent
 * harness: this is the evidence for that claim.
 *
 * It was built at work, so the ceiling on detail is the architecture. No
 * internal metrics, no customer names, nothing from the source — the shape of
 * the decisions is public-safe and is the interesting part anyway.
 */
export const ASSISTANT = {
  name: "The assistant",
  href: "https://w.tracxn.com/tracxn-ai-assistant",
  meta: "2026 · at Tracxn",
  // The opening sentence is written from Tracxn's own published coverage
  // (w.tracxn.com/about-us), not from memory: companies, legal entities,
  // investors, funding rounds, acquisitions, financials, cap tables, sectors,
  // across 50+ countries. If they restate their coverage, restate this.
  what: "Tracxn is a private-market data platform. Companies, the legal entities behind them, investors, funding rounds, acquisitions, cap tables, founders, sectors — millions of records across fifty-odd countries, cross-referenced. The assistant answers questions over all of it, and works out which parts a question needs.",
  how: "It lives inside the API documentation portal, which generates itself from the OpenAPI spec. A router picks the model per question. A skills layer covers what it can do. Prompts are versioned behind an eval harness. Document export runs server-side, and the logs are auditable.",
  // Not `then` — an object with a `then` key is thenable, and would silently
  // misbehave the first time it met an `await`.
  extension:
    "Then an MCP server on top. Read-only connectors behind OAuth, so coding clients reach the API without pasting a key. The team co-owns it now.",
  // The counterpart to microcharts' "Entirely my own time." — this one was the
  // day job, and it was built alongside the day job rather than instead of it.
  caveat: "Shipped it, then kept hardening it while running the rest of the engineering queue.",
} as const;

/**
 * The side project that outlived the itch that started it.
 *
 * It gets a card rather than a ledger row because it is the only thing here
 * that is a *product* — two private repos (`sgb-data-generator`, a Puppeteer
 * scraper on a scheduled Lambda; `sgb-data-generator-ui`, the Next.js front
 * end) behind one public URL, kept running for four years.
 *
 * Written from the repos and the live site, not from memory — the arithmetic it
 * claims is spelled out on sgb.vercel.app/help.
 *
 * Kept to the same length as the microcharts card beside it: one paragraph and
 * a quiet line. The architecture is the interesting part but it is not what a
 * reader needs here.
 */
export const SGB = {
  name: "sgb",
  href: "https://sgb.vercel.app",
  meta: "2021 · still live",
  what: "A tracker for India's Sovereign Gold Bonds. Every series on one page, ranked by what a buyer actually earns at today's price rather than the coupon printed on the face value.",
  caveat:
    "A scraper on a cron, one JSON file on S3, four years of iteration. Still up, still mine.",
} as const;

export type LedgerRow = { year: string; name: string; href?: string; what: string };

export const LEDGER: readonly LedgerRow[] = [
  {
    year: "2025",
    name: "puppeteer-warc",
    href: "https://github.com/ganapativs/puppeteer-warc",
    what: "Web ARChive capture on top of Puppeteer.",
  },
  {
    year: "2024",
    name: "priority",
    href: "https://github.com/ganapativs/priority-browser-extension",
    what: "A new-tab extension that shows you one task. Live in the Chrome Web Store and Firefox add-ons.",
  },
  {
    year: "2019",
    name: "react-delightful-scroller",
    href: "https://github.com/ganapativs/react-delightful-scroller",
    what: "A virtualised infinite scroller for thousands of items. Batches and recycles DOM nodes, handles fixed and dynamic heights, aims at 60fps. 7 kB gzipped.",
  },
  {
    year: "2019",
    name: "react-spectrum",
    href: "https://github.com/ganapativs/react-spectrum",
    what: "Generates colourful text placeholders from any string. One conference talk that year too, TinyConf 2 in Bangalore.",
  },
  {
    year: "2018",
    name: "react-dynamic-import",
    href: "https://github.com/ganapativs/react-dynamic-import",
    what: "Loads and renders a React module on demand, component or higher-order component. 1.16 kB gzipped. The README opens by telling you to check whether React.lazy already covers your case.",
  },
  // Internal, so there is no link — but leaving it off the ledger entirely would
  // hide the longest-running thing here. The Technology Lead role card says what
  // it meant; this says what it is.
  {
    year: "2016",
    name: "the component library",
    what: "The internal React component library. First commit in November 2016, still its primary maintainer — every product surface at the company is built on it.",
  },
] as const;

export const SOCIAL: readonly { label: string; href: string }[] = [
  { label: "GitHub", href: "https://github.com/ganapativs" },
  { label: "LinkedIn", href: "https://www.linkedin.com/in/ganapativs" },
  { label: "X", href: "https://x.com/ganapativs" },
  { label: "Dribbble", href: "https://dribbble.com/ganapativs" },
  { label: "npm", href: "https://www.npmjs.com/~ganapativs" },
] as const;

// One bar per chart type, 106 of them. Deterministic on purpose — a random
// strip would differ between the server and client renders.
export const STRIP_BARS: readonly number[] = Array.from({ length: 106 }, (_, i) =>
  Math.round(20 + 78 * Math.abs(Math.sin(i * 1.73))),
);

// The week Product Hunt found bttn.css.
export const SPIKE_BARS: readonly number[] = [16, 14, 20, 100, 46, 30, 24, 22];
