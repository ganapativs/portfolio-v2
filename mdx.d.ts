// pnpm's isolated node_modules keeps @types/mdx out of TypeScript's automatic
// `node_modules/@types` sweep, so `import("@/content/blog/<slug>/page.mdx")` in
// app/blog/[slug]/page.tsx fails to type-check. Pull the package in explicitly.
/// <reference types="mdx" />
