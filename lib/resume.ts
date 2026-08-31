// Not exported: only `Identity` below refers to it.
type SocialKind = "github" | "linkedin" | "twitter" | "dribbble" | "npm" | "mail";

export type Identity = {
  name: string;
  jobTitle: string;
  worksFor: { name: string; url: string };
  orgTagline?: string;
  location: string;
  email: string;
  social: { kind: SocialKind; label: string; href: string }[];
};

export type Role = {
  role: string;
  org: string;
  location?: string;
  start: string;
  end: string;
  bullets: string[];
};

export type Flagship = {
  name: string;
  stars: number;
  year: string;
  repo: string;
  blurb: string;
};

export type Education = {
  kind: "degree" | "school" | "award" | "role" | "cert";
  title: string;
  org: string;
  range: string;
  detail?: string;
  href?: string;
};

export type SkillGroup = { label: string; items: string[]; strong?: string[] };

/**
 * The career starts in July 2013, with the Thinkappz internship. Every surface
 * that counts the years counts from here, so the home page, the portrait's
 * dimension, the pipeline card and the metadata cannot disagree.
 *
 * A checked constant rather than an age computed from a date: this number is
 * rendered on the server and again on the client, and one that turned over
 * between the build and the visit would be a hydration mismatch. Bump it each
 * July.
 */
export const CAREER_YEARS = 13;

/**
 * The public work, counted against the GitHub and npm APIs on 2026-08-30.
 *
 *   194 public repositories on the account, of which 38 are original and the
 *   remaining 156 are forks of record. 2,649 stars across the originals. 16
 *   packages published to npm.
 *
 * These replace a set of numbers that had drifted: the site claimed 55 repos
 * and 15 npm packages, and neither was right. The résumé renders the star
 * total live through lib/github.ts; this is what every other surface prints,
 * and the fallback when the API cannot be reached.
 *
 * Re-check with:
 *   api.github.com/users/ganapativs/repos?per_page=100&type=owner  (walk every
 *   page, drop `fork: true`, sum `stargazers_count`)
 *   registry.npmjs.org/-/v1/search?text=maintainer:ganapativs
 */
export const PUBLIC_WORK = {
  repos: 38,
  /** Everything on the account, forks of record included. */
  reposIncludingForks: 194,
  stars: 2649,
  npm: 16,
} as const;

/** "2,600+" — rounded down to the hundred, so it is true for a while. */
export const STARS_ROUNDED = `${(Math.floor(PUBLIC_WORK.stars / 100) * 100).toLocaleString("en-US")}+`;

/**
 * The one-line biography.
 *
 * The site's meta description, the web manifest, the Person schema and
 * llms.txt all print this. They used to print four hand-typed copies, and
 * three of them said he joined Tracxn as an intern. He did not: the internship
 * was at Thinkappz in 2013, and he joined Tracxn in 2015 as a software
 * engineer. One string, so a fact cannot be wrong in three places at once.
 */
export const BIO =
  `Full-stack engineer with a design mind, ${CAREER_YEARS} years in, based in Bengaluru. ` +
  `At Tracxn since 2015, VP of Technology now. I still write a lot of code.`;

export const identity: Identity = {
  name: "Ganapati V S",
  jobTitle: "Vice President, Technology",
  worksFor: { name: "Tracxn", url: "https://tracxn.com" },
  orgTagline: "Publicly listed private-market intelligence platform · BSE / NSE: TRACXN",
  location: "Bengaluru, India",
  email: "vsg.inbox@gmail.com",
  social: [
    { kind: "github", label: "github.com/ganapativs", href: "https://github.com/ganapativs" },
    {
      kind: "linkedin",
      label: "linkedin.com/in/ganapativs",
      href: "https://www.linkedin.com/in/ganapativs",
    },
    { kind: "twitter", label: "@Ganapativs", href: "https://x.com/ganapativs" },
    { kind: "npm", label: "npmjs.com/~ganapativs", href: "https://www.npmjs.com/~ganapativs" },
    { kind: "mail", label: "vsg.inbox@gmail.com", href: "mailto:vsg.inbox@gmail.com" },
  ],
};

export const roles: Role[] = [
  {
    role: "Vice President, Technology",
    org: "Tracxn",
    location: "Bengaluru",
    start: "Sep 2023",
    end: "Present",
    bullets: [
      "Architect of the company's customer-facing AI assistant and the API documentation portal it lives in: an OpenAPI-driven docs pipeline, intent-based routing across multiple model providers, a tool and skills layer, server-side document export, versioned prompts behind an evaluation harness, and audit-grade logging. Shipped and hardened since, while running the broader engineering queue.",
      "Architected the MCP server surface and shipped its first version: read-only connectors behind OAuth, so AI coding clients reach the API without a pasted key; now co-owned with the team.",
      "Authored @microcharts/react outside the day job. 106 word-sized React chart types, zero dependencies, ~1-7 kB gzip each, accessible and server-component safe; design, code, docs and release, solo.",
      "Cross-stack performance program: native browser image loading with DPR-aware URLs, compression on portal assets, render profiling, and a framework-level scroll / re-render / CSS pass.",
      "PDF viewer rewrite in the internal component library: animation system, vertical-scroll mode, micro-interactions; consumed by every product surface that displays a document.",
      "Hardened the server-side PDF report pipeline and authored Cursor / Claude Code rule packs formalising AI-assisted contribution for the team.",
    ],
  },
  {
    role: "Senior Associate VP, Technology",
    org: "Tracxn",
    location: "Bengaluru",
    start: "Sep 2022",
    end: "Sep 2023",
    bullets: [
      "Technical ownership across multiple engineering teams: architecture review, hiring loops and design partnerships across the engineering queue.",
      "Authored a custom AST codemod migrating a foundational button component across a large, long-lived frontend.",
      "Browser-extension build pipeline (Chrome + Firefox); Storybook and build-toolchain upgrades.",
    ],
  },
  {
    role: "Associate VP, Technology",
    org: "Tracxn",
    location: "Bengaluru",
    start: "Sep 2020",
    end: "Sep 2022",
    bullets: [
      "Multi-team architect translating product strategy into engineering work, owning the review queue and the escalation path across engineering.",
      "Sustained the React Native mobile app across a major framework upgrade and Apple App Site Association integration without a dedicated mobile team.",
      "Built and still operate sgb.vercel.app outside the day job: a Sovereign Gold Bond tracker for India's secondary market. A Puppeteer scraper on a scheduled AWS Lambda writes a single JSON file to S3; a Next.js front end derives fair value, effective interest rate and effective cash-flow rate per series. Live since 2021, iterated on for four years.",
    ],
  },
  {
    role: "Technology Lead",
    org: "Tracxn",
    location: "Bengaluru",
    start: "Sep 2016",
    end: "Sep 2020",
    bullets: [
      "Created the internal React component library (Nov 2016): primary maintainer for ten years and counting; consumed by every product surface.",
      "Stood up the first Node-based backend service, an image-processing pipeline. Drove Webpack / Babel / ESLint / Storybook standardisation across web frontends.",
      "Spoke at TinyConf 2 (Bangalore, 2019) on virtualised infinite scroll, drawing from the published react-delightful-scroller.",
    ],
  },
  {
    role: "Software Engineer",
    org: "Tracxn",
    location: "Bengaluru",
    start: "Sep 2015",
    end: "Sep 2016",
    bullets: [
      "Committed to the original React + Reflux + Webpack frontend on my first day. Landing page, dashboard, masonry feeds, sidebar, signup flow and theme system in a four-month sprint.",
      "Architected and shipped the cross-platform iOS + Android mobile app on React Native + Redux as sole frontend engineer.",
    ],
  },
  {
    role: "UI/UX Engineer",
    org: "InvenZone",
    location: "Mumbai",
    start: "Jun 2014",
    end: "Sep 2015",
    bullets: [
      "Wireframed, designed and shipped UI/UX for invenzone.com (researcher social network) and the early arya.ai (applied-AI product).",
    ],
  },
  {
    role: "Intern, Web Frontend",
    org: "Thinkappz",
    location: "Bengaluru",
    start: "Jul 2013",
    end: "May 2014",
    bullets: ["Built the complete frontend for eezyconnect.com."],
  },
];

export const flagships: Flagship[] = [
  {
    name: "@microcharts/react",
    stars: 152,
    year: "2026",
    repo: "https://github.com/ganapativs/microcharts",
    blurb:
      "106 word-sized React chart types. Zero runtime dependencies, ~1-7 kB gzip each, accessible by default, server-component safe.",
  },
  {
    name: "bttn.css",
    stars: 2050,
    year: "2016",
    repo: "https://github.com/ganapativs/bttn.css",
    blurb: "A CSS button library: Product Hunt feature in 2016, still in people's projects today.",
  },
  {
    name: "react-spectrum",
    stars: 318,
    year: "2019",
    repo: "https://github.com/ganapativs/react-spectrum",
    blurb: "Generate colourful text placeholders, from any string.",
  },
  {
    name: "preact-redux-autocompete",
    stars: 34,
    year: "2016",
    repo: "https://github.com/ganapativs/preact-redux-autocompete",
    blurb: "Preact + Redux autocomplete with keyboard nav.",
  },
  {
    name: "react-dynamic-import",
    stars: 28,
    year: "2018",
    repo: "https://github.com/ganapativs/react-dynamic-import",
    blurb: "Dynamic imports for React with hooks. Suspense-ready.",
  },
  {
    name: "react-delightful-scroller",
    stars: 24,
    year: "2019",
    repo: "https://github.com/ganapativs/react-delightful-scroller",
    blurb: "Virtualised infinite scroll. Subject of the TinyConf 2 talk.",
  },
  {
    name: "portfolio (Gatsby source)",
    stars: 16,
    year: "2018",
    repo: "https://github.com/ganapativs/portfolio",
    blurb: "Gatsby source for the previous incarnation of meetguns.com.",
  },
  {
    name: "pure-cache",
    stars: 11,
    year: "2017",
    repo: "https://github.com/ganapativs/pure-cache",
    blurb: "Tiny, pure JavaScript caching utility.",
  },
  {
    name: "puppeteer-warc",
    stars: 5,
    year: "2025",
    repo: "https://github.com/ganapativs/puppeteer-warc",
    blurb: "Web ARChive (WARC) capture utility on top of Puppeteer.",
  },
  {
    name: "priority-browser-extension",
    stars: 3,
    year: "2024",
    repo: "https://github.com/ganapativs/priority-browser-extension",
    blurb: "Productivity new-tab utility, live on Chrome Web Store and Firefox.",
  },
];

export const education: Education[] = [
  {
    kind: "degree",
    title: "BE, Computer Science",
    org: "RNSIT, Bengaluru",
    range: "2011: 2014",
    detail: "College football team.",
    href: "https://www.rnsit.ac.in",
  },
  {
    kind: "role",
    title: "Intern, Web Frontend",
    org: "Thinkappz",
    range: "Jul 2013: May 2014",
    detail: "Built the complete frontend for eezyconnect.com.",
  },
  {
    kind: "role",
    title: "UI/UX Engineer",
    org: "InvenZone",
    range: "Jun 2014: Sep 2015",
    detail:
      "Wireframed, designed and shipped UI/UX for invenzone.com (researcher social network) and the early arya.ai (applied-AI product).",
  },
];

export const skills: SkillGroup[] = [
  {
    label: "Languages",
    strong: ["TypeScript", "JavaScript", "CSS"],
    items: ["TypeScript", "JavaScript", "CSS", "HTML", "Python"],
  },
  {
    label: "Frameworks & UI",
    strong: ["React", "React Native", "Next.js"],
    items: ["React", "React Native", "Next.js", "Redux", "Tailwind", "Fumadocs"],
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
      "tool-use / function calling",
      "OpenAPI tooling",
      "evals",
      "prompt-injection defense",
    ],
  },
  {
    label: "Dataviz & a11y",
    strong: ["SVG", "React Server Components"],
    items: [
      "SVG",
      "React Server Components",
      "WAI-ARIA",
      "design tokens",
      "colour-blind-safe palettes",
      "visual regression (Playwright)",
    ],
  },
  {
    label: "Backend & data",
    items: [
      "Node.js",
      "Kafka",
      "AWS (S3, Lambda)",
      "Puppeteer",
      "WARC archives",
      "PDF rendering",
      "exceljs",
    ],
  },
  {
    label: "Build & DX",
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
    label: "Performance",
    items: ["virtualised rendering", "Brotli", "DPR-aware images", "react-scan", "FPS profiling"],
  },
];

export type Talk = {
  event: string;
  place: string;
  year: string;
  /** One line. What the talk was actually about. */
  detail: string;
};

/**
 * Talks. Lives here rather than in either page because both the home page and
 * the résumé print it, and it was previously typed out by hand in the résumé :
 * one more pair that could drift.
 */
export const speaking: Talk[] = [
  {
    event: "TinyConf 2",
    place: "Bangalore",
    year: "2019",
    detail: "Virtualised infinite scroll, drawing on react-delightful-scroller.",
  },
];

/**
 * When the CV last actually changed. Typed, not computed.
 *
 * This was `new Date()`, evaluated at module load, so /resume printed the
 * build date and every deploy claimed the CV had been revised. app/sitemap.ts
 * already refuses to do that for `lastmod` on the grounds that a date moving
 * on every deploy teaches crawlers to ignore it; the same argument applies to
 * a line a reader can see. Edit this when the content changes.
 */
export const lastUpdatedISO = "2026-08-31";
