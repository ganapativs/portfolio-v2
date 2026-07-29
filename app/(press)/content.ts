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
  ["2021", "The quiet one. Reviewing the queue, escalating what needed escalating."],
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
    era: "2013 – 2014 · before",
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

export type LedgerRow = { year: string; name: string; href?: string; what: string };

export const LEDGER: readonly LedgerRow[] = [
  {
    year: "2025",
    name: "the assistant",
    what: "A customer-facing AI assistant and the documentation portal it lives in. Fumadocs over an OpenAPI pipeline, an intent router that picks the model per question, a tools and skills layer, versioned prompts behind an eval harness, an MCP server for coding clients.",
  },
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
