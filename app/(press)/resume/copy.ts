/**
 * Résumé copy, in the voice the rest of the site is written in.
 *
 * Same facts as lib/resume.ts, one dropped (the TinyConf talk, which the
 * Speaking column already carries): this is a VP résumé and the
 * detail is the point. What changed is the register, twice.
 *
 * The originals stacked six qualified clauses into a sentence and led with
 * nouns ("Architect of…", "Technical ownership across…"), which is how a scope
 * statement reads, not a person. The pass after that fixed the nouns but kept
 * the sentence lengths.
 *
 * This one follows ASD-STE100, the simplified English an aircraft maintenance
 * manual is written in: one idea per sentence, active voice, a plain word where
 * a long one would do, and nothing over about twenty words. It suits a drawing,
 * and it is also how a person talks. The summary is first person because a
 * summary is someone introducing himself; the bullets lead with the verb,
 * because sixteen sentences starting "I" is a tic rather than a voice.
 *
 * lib/resume.ts stays the source of truth for the facts: dates, titles, orgs.
 * This file only rephrases them. If a fact changes, change it there.
 */
export const ROLE_COPY: Record<string, string[]> = {
  "Vice President, Technology": [
    "Built the customer-facing AI assistant and its knowledge base. Specs, docs and search feed it. An intent router picks the model for each question. Behind that sit a tools and skills layer, document export, versioned prompts under an eval harness and auditable logs.",
    "Designed the MCP server surface and shipped its first version. Read-only connectors behind OAuth, so AI coding clients reach the API without a pasted key. The team co-owns it now.",
    "Wrote @microcharts/react on my own time. 106 word-sized chart types, no runtime dependencies, 1-7 kB gzip each, accessible by default and safe in server components. I did the design, code, docs and release.",
    "Ran a performance program across the stack: native image loading with DPR-aware URLs, asset compression, render profiling, a pass over scroll, re-renders and CSS. Rewrote the PDF viewer every document surface uses, and hardened the server-side PDF report pipeline.",
  ],
  "Senior Associate VP, Technology": [
    "Owned architecture review, hiring loops and design partnerships across several engineering teams.",
    "Wrote a custom AST codemod that moved a foundational button component across a frontend eight years old. Built the browser-extension pipeline for Chrome and Firefox.",
  ],
  "Associate VP, Technology": [
    "Turned product strategy into engineering work across several teams, and owned the review queue and escalations.",
    "Kept the React Native app running through a major framework upgrade and the Apple App Site Association work. There was no dedicated mobile team.",
    "Built sgb.vercel.app on my own time, a Sovereign Gold Bond tracker for India's secondary market that ranks every series by what a buyer earns at today's price. Live since 2021.",
  ],
  "Technology Lead": [
    "Created the internal React component library in November 2016 and still maintain it. Every product surface uses it.",
    "Stood up the first Node service, an image-processing pipeline. Drove Webpack, Babel, ESLint and Storybook standards across the web frontends.",
  ],
  "Software Engineer": [
    "Made the first commit on the original React, Reflux and Webpack frontend. Landing page, dashboard, masonry feeds, sidebar, signup flow and theme system in four months.",
    "Designed and shipped the iOS and Android app on React Native and Redux, as the only frontend engineer on it.",
  ],
  "UI/UX Engineer": [
    "Designed and shipped the interface for invenzone.com, a social network for researchers, and for the early arya.ai.",
  ],
  "Intern, Web Frontend": ["Built the complete frontend for eezyconnect.com."],
};

export const SUMMARY =
  "Full-stack engineer with a design mind. I joined Tracxn in 2015 as a software engineer and I am VP of Technology now. Most of the job is the team, the hiring and what we build next. I still write a lot of code.";
