/**
 * Résumé copy, in the voice the rest of the site is written in.
 *
 * Same facts as lib/resume.ts, nothing dropped: this is a VP résumé and the
 * detail is the point. What changed is the register. The originals stack six
 * qualified clauses into a sentence and lead with nouns ("Architect of…",
 * "Technical ownership across…"), which is how a scope statement reads, not a
 * person. These lead with verbs, break the clauses apart, and say "wrote" and
 * "built" instead of "authored" and "delivered".
 *
 * lib/resume.ts stays the source of truth for the facts: dates, titles, orgs.
 * This file only rephrases them. If a fact changes, change it there.
 */
export const ROLE_COPY: Record<string, string[]> = {
  "Vice President, Technology": [
    "Built the company's customer-facing AI assistant and the API documentation portal it lives in: docs generated from OpenAPI, an intent router that picks the model per question, a tools and skills layer, server-side document export, versioned prompts behind an eval harness, and logging you can audit. Shipped and hardened since, while running the engineering queue.",
    "Designed the MCP server surface and shipped its first version: read-only connectors behind OAuth, so AI coding clients reach the API without anyone pasting a key. The team co-owns it now.",
    "Wrote @microcharts/react on my own time: 106 word-sized chart types, no runtime dependencies, 1-7 kB gzip each, accessible by default and server-component safe. Design, code, docs and release, all solo.",
    "Ran a performance program across the stack: native image loading with DPR-aware URLs, compression on portal assets, render profiling, and a pass over scroll, re-renders and CSS at the framework level.",
    "Rewrote the PDF viewer in the internal component library: new animation system, vertical-scroll mode, micro-interactions. Every document surface uses it.",
    "Hardened the server-side PDF report pipeline and wrote the team's Cursor and Claude Code rule packs for AI-assisted contribution.",
  ],
  "Senior Associate VP, Technology": [
    "Owned the technical side across several engineering teams: architecture review, hiring loops and design partnerships.",
    "Wrote a custom AST codemod to migrate a foundational button component across a large, long-lived frontend.",
    "Built the browser-extension pipeline for Chrome and Firefox, and pushed through the Storybook and build-toolchain upgrades.",
  ],
  "Associate VP, Technology": [
    "Multi-team architect: turned product strategy into engineering work, and owned both the review queue and the escalation path.",
    "Kept the React Native app alive through a major framework upgrade and the Apple App Site Association work, without a dedicated mobile team.",
    "Built sgb.vercel.app on my own time: a tracker for India's Sovereign Gold Bond secondary market. A Puppeteer scraper on a scheduled Lambda writes a JSON file to S3; a Next.js front end derives fair value, effective interest and cash-flow rate per series. Live since 2021, still running.",
  ],
  "Technology Lead": [
    "Created the internal React component library in November 2016 and have been its primary maintainer for ten years. Every product surface is built on it.",
    "Stood up the first Node service, an image-processing pipeline. Drove Webpack, Babel, ESLint and Storybook standardisation across the web frontends.",
    "Spoke at TinyConf 2 (Bangalore, 2019) on virtualised infinite scroll, drawing on react-delightful-scroller.",
  ],
  "Software Engineer": [
    "Day-one commit on the original React + Reflux + Webpack frontend: landing page, dashboard, masonry feeds, sidebar, signup flow and the theme system, in a four-month sprint.",
    "Architected and shipped the iOS and Android app on React Native + Redux as the only frontend engineer on it.",
  ],
  "UI/UX Engineer": [
    "Wireframed, designed and shipped the UI for invenzone.com, a social network for researchers, and for the early arya.ai.",
  ],
  "Intern, Web Frontend": ["Built the complete frontend for eezyconnect.com."],
};

export const SUMMARY =
  "I've been at Tracxn since 2015: joined as an engineer, run part of technology now, and still write code most weeks. Four promotions in, the work splits between the architecture and the people: the frontend hiring loop, the review queue, and what gets built next. Most recently: the customer-facing AI assistant and its API documentation portal, and @microcharts/react on my own time.";
