import type { Accent } from "@/components/sections";

export type Post = {
  slug: string;
  title: string;
  date: string;
  updated?: string;
  spoiler: string;
  tag: string;
  read: string;
  accent: Accent;
  draft: boolean;
  cover?: string;
  keywords?: string[];
};

export const posts: Post[] = [
  {
    slug: "microcharts-word-sized-charts",
    title: "Introducing microcharts — word-sized charts for React",
    date: "2026-07-25",
    spoiler:
      "Why I built microcharts — 106 word-sized chart types for React. Zero dependencies, interactive at ~2–7 kB, accessible by default.",
    tag: "dataviz",
    read: "10 min",
    accent: "saffron",
    draft: false,
    cover: "hero.png",
    keywords: [
      "microcharts",
      "React chart library",
      "sparkline",
      "word-sized charts",
      "inline charts",
      "tiny charts",
      "React Server Components",
      "accessible charts",
      "AI streaming charts",
      "MCP server",
    ],
  },
  {
    slug: "aborting-a-fetch-request",
    title: "Aborting a fetch request",
    date: "2020-02-09",
    spoiler:
      "Cancelling in-flight requests with AbortController — the API, the gotchas, and why your dropdowns flicker without it.",
    tag: "fetch",
    read: "2 min",
    accent: "terracotta",
    draft: false,
    cover: "cover.png",
  },
  {
    slug: "introducing-react-spectrum",
    title: "Introducing 'react-spectrum'",
    date: "2019-12-22",
    spoiler: "A small library for generating colourful text placeholders, from any string.",
    tag: "react",
    read: "1 min",
    accent: "sage",
    draft: false,
    cover: "cover.png",
  },
  {
    slug: "babel-plugins-loose-mode-caveats",
    title: "Babel plugins: 'loose' mode caveats",
    date: "2019-12-18",
    spoiler:
      "What Babel's 'loose' mode actually trades away for smaller output — and when it bites.",
    tag: "babel",
    read: "2 min",
    accent: "saffron",
    draft: false,
    cover: "cover.jpg",
  },
];
// Newest first — sitemap, RSS and the blog index all treat published[0] as
// the latest post, so the order must not depend on hand-maintained file order.
export const published = posts
  .filter((p) => !p.draft)
  .toSorted((a, b) => +new Date(b.date) - +new Date(a.date));
