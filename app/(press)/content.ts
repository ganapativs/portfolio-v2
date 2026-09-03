import { flagships, skills } from "@/lib/resume";

/**
 * The drawing's copy and its data, kept out of the JSX so the page reads as
 * structure.
 *
 * Every number on this page is real and checked. The counts of public work
 * live in `PUBLIC_WORK` in lib/resume.ts with the API calls that verify them;
 * the rest are 2,050 stars on bttn.css, 106 chart types in microcharts and
 * 1.16 kB for react-dynamic-import. Where a number also appears on the résumé
 * it is pulled from lib/resume.ts rather than retyped, so the two surfaces
 * cannot drift.
 */

const stars = (name: string) => flagships.find((f) => f.name === name)?.stars ?? 0;

// Read from lib/resume rather than typed here, so the parts list and the CV
// cannot disagree about how many stars bttn.css has.
const BTTN_STARS = stars("bttn.css");

/* ---- fig. 5 · the career, dimensioned ----------------------------------- */

export type Era = {
  /** Fractional years, because the axis is a measurement and 2023.0 is a date. */
  from: number;
  to: number;
  short: string;
  length: string;
  range: string;
  body: string;
};

export const ERAS: readonly Era[] = [
  {
    from: 2013,
    to: 2015,
    short: "startups",
    length: "2 yrs",
    range: "2013 - 2015 · before Tracxn",
    body: "Intern at Thinkappz, then UI engineer at InvenZone and on early arya.ai. My first public repos date from here and they are still up.",
  },
  {
    from: 2015,
    to: 2016,
    short: "engineer",
    length: "1 yr",
    range: "2015 - 2016 · Software Engineer",
    body: "I shipped on my first day. Landing page, dashboard, feeds, signup. Then the mobile app on React Native, which was new at the time.",
  },
  {
    from: 2016,
    to: 2020,
    short: "tech lead",
    length: "4 yrs",
    range: "2016 - 2020 · Technology Lead",
    body: "I wrote the internal React component library in November 2016. The team still builds on it.",
  },
  {
    from: 2020,
    to: 2022,
    short: "assoc. VP",
    length: "2 yrs",
    range: "2020 - 2022 · Associate VP",
    body: "Architecture across several teams, and turning product asks into engineering work. Fewer commits, more reviews.",
  },
  {
    from: 2022,
    to: 2023,
    short: "sr. assoc. VP",
    length: "1 yr",
    range: "2022 - 2023 · Senior Associate VP",
    body: "An extension build pipeline for Chrome and Firefox, and a custom AST codemod that moved a button component across a frontend eight years old.",
  },
  {
    from: 2023,
    to: 2026.7,
    short: "VP, Technology",
    length: "3 yrs+",
    range: "2023 - now · VP, Technology",
    body: "I built the customer-facing AI assistant and the API docs portal it lives in. I also run the frontend hiring loop, the architecture reviews and the RFCs.",
  },
] as const;

/**
 * What the current work is actually built out of. Ten names, weighted to the
 * recent work, because a wall of every tool ever touched says less than a short
 * list does.
 *
 * Each one is looked up in lib/resume's skills rather than retyped, and a miss
 * throws at module load: the build fails loudly rather than shipping a name the
 * résumé no longer claims.
 */
const SKILL_ITEMS = new Set(skills.flatMap((g) => g.items));

export const MATERIALS: readonly string[] = [
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
    throw new Error(`content.ts MATERIALS: "${name}" is not in lib/resume.ts skills — renamed?`);
  }
  return name;
});

/* ---- the parts list ------------------------------------------------------ */

export type Part = {
  name: string;
  /** `{stars}` is substituted with the live-counting star number. */
  spec: string;
  stars?: number;
  year: string;
  href?: string;
};

export const PARTS: readonly Part[] = [
  {
    name: "bttn.css",
    spec: "CSS buttons · {stars} stars",
    stars: BTTN_STARS,
    year: "2016",
    href: "https://github.com/ganapativs/bttn.css",
  },
  {
    name: "microcharts",
    spec: "106 chart types · 1-7 kB gzip",
    year: "2026",
    href: "https://github.com/ganapativs/microcharts",
  },
  {
    name: "sgb",
    spec: "gold bond tracker · still live",
    year: "2021",
    href: "https://sgb.vercel.app",
  },
  {
    name: "priority",
    spec: "one-task new tab · Chrome + Firefox",
    year: "2024",
    href: "https://github.com/ganapativs/priority-browser-extension",
  },
  {
    name: "puppeteer-warc",
    spec: "WARC capture over Puppeteer",
    year: "2025",
    href: "https://github.com/ganapativs/puppeteer-warc",
  },
  {
    name: "react-delightful-scroller",
    spec: "virtualised scroll · 7 kB",
    year: "2019",
    href: "https://github.com/ganapativs/react-delightful-scroller",
  },
  {
    name: "react-spectrum",
    spec: "colourful text placeholders · React only",
    year: "2019",
    href: "https://github.com/ganapativs/react-spectrum",
  },
  {
    name: "react-dynamic-import",
    spec: "on-demand modules · 1.16 kB",
    year: "2018",
    href: "https://github.com/ganapativs/react-dynamic-import",
  },
] as const;

/* ---- fig. 6 · the pipeline ----------------------------------------------- */

export const STAGES = ["sketch", "vectors", "tokens", "markup", "shipped"] as const;

// Keyed to the stage, because a caption that says the same thing at every
// position is a label, not a caption.
export const STAGE_NOTE: readonly string[] = [
  "drag the handle · one card, from first sketch to shipped",
  "vectors · drag the pen handles to reshape the curve",
  "tokens · colour and type as named values, wired to what they set",
  "markup · the same card as a DOM tree. Point at a node",
  "shipped · point at the card, read the chart, press the button",
];

/**
 * The card's chart: cumulative public work shipped, 2013 to 2026, plotted in
 * the SVG's own 272×64 space.
 *
 * Every point is a year and every year has one line of story, so hovering the
 * finished chart is reading a career rather than a tooltip. Four of them are
 * promotions and are marked on the line; 2023 keeps a permanent annotation
 * because it is the one the rest of the page is written from.
 */
export const CHART: readonly { x: number; y: number; story: string; promotion?: boolean }[] = [
  { x: 10, y: 50, story: "first public repos" },
  { x: 29, y: 47, story: "more repos, still learning" },
  { x: 49, y: 44, story: "joined Tracxn" },
  { x: 68, y: 38, story: "bttn.css · Tech Lead", promotion: true },
  { x: 88, y: 35, story: "pure-cache" },
  { x: 107, y: 32, story: "react-dynamic-import" },
  { x: 126, y: 23, story: "react-spectrum · a talk" },
  { x: 146, y: 23, story: "promoted to AVP", promotion: true },
  { x: 165, y: 20, story: "sgb" },
  { x: 184, y: 20, story: "promoted to Sr AVP", promotion: true },
  { x: 204, y: 20, story: "promoted to VP", promotion: true },
  { x: 223, y: 17, story: "priority" },
  { x: 243, y: 11, story: "the assistant · puppeteer-warc" },
  { x: 262, y: 8, story: "microcharts" },
] as const;

/* ---- panel copy ---------------------------------------------------------- */

/**
 * The assistant. Built at work, so the ceiling on detail is the architecture:
 * no internal metrics, no customer names, nothing from the source. The shape of
 * the decisions is public-safe and is the interesting part anyway.
 *
 * The first two sentences describe Tracxn from its own published coverage
 * (w.tracxn.com/about-us), not from memory. If they restate it, restate this.
 */
export const ASSISTANT = {
  href: "https://w.tracxn.com/tracxn-ai-assistant",
  meta: "2026 · at Tracxn · shipping",
  body: "Tracxn is a private-market data platform. Millions of companies, investors, funding rounds and cap tables, across fifty countries. The assistant answers questions over all of it.",
} as const;

export const MICROCHARTS = {
  href: "https://github.com/ganapativs/microcharts",
  site: "https://microcharts.dev",
  meta: "2026 · own time",
} as const;

/**
 * Two private repos behind one public URL, kept running for five years. It gets
 * a card rather than a parts-list row because it is the only thing here that is
 * a product rather than a library.
 */
export const SGB = {
  href: "https://sgb.vercel.app",
  meta: "2021 · still live",
  body: "A tracker for India's Sovereign Gold Bonds. Every live series on one page, ranked by what a buyer earns at today's price. Live since 2021, and I still run it.",
} as const;

/**
 * react-spectrum gets the fourth figure rather than bttn.css. bttn.css is ten
 * years old and already carries the parts list; this one is small, still
 * accurate, and — because the real package is on the page — can simply run.
 */
export const SPECTRUM = {
  href: "https://github.com/ganapativs/react-spectrum",
  npm: "https://www.npmjs.com/package/react-spectrum",
  // stars() and not a literal: this was the one public-work number on the
  // sheet typed by hand, which is exactly the drift PUBLIC_WORK exists to end.
  meta: `2019 · own time · ${stars("react-spectrum").toLocaleString("en-US")} stars`,
  // 1.9 kB is the gzipped size of dist/react-spectrum.es.js, which is the
  // build this page actually loads. "No dependencies" was not true either:
  // React is a dependency, and saying so costs nothing.
  body: "A small library that lays out a paragraph of colourful text placeholders from a palette and a few shape rules. It is 1.9 kB gzipped and needs nothing but React. The one below is the real package, drawing in the ink you picked.",
} as const;
