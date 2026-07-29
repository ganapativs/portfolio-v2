import type { Post } from "@/lib/posts";
import { identity } from "@/lib/resume";

export const SITE_URL = "https://meetguns.com";
const PERSON_NAME = identity.name;

// Stable node ids so sibling schemas on a page reference one Person / WebSite
// node instead of redeclaring near-duplicates the crawler may treat as
// distinct entities.
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON_REF = { "@id": PERSON_ID };

// Person schema derives from `identity` in lib/resume.ts — single source of truth
// for name, job title, employer, location, and social URLs.
export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": PERSON_ID,
  name: PERSON_NAME,
  alternateName: "meetguns",
  url: SITE_URL,
  image: `${SITE_URL}/portrait/ganapativs.webp`,
  jobTitle: identity.jobTitle,
  worksFor: { "@type": "Organization", ...identity.worksFor },
  address: {
    "@type": "PostalAddress",
    addressLocality: identity.location.split(",")[0].trim(),
    addressCountry: "IN",
  },
  sameAs: identity.social.filter((s) => s.kind !== "mail").map((s) => s.href),
  knowsAbout: [
    "React",
    "TypeScript",
    "Next.js",
    "frontend engineering",
    "AI assistants",
    "API documentation",
    "data visualization",
    "open source",
  ],
};

export const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": WEBSITE_ID,
  name: "meetguns",
  alternateName: PERSON_NAME,
  url: SITE_URL,
  inLanguage: "en",
  author: PERSON_REF,
};

// Posts that are *about* a nameable artefact link the entity explicitly —
// search engines connect the write-up to the project it describes.
const POST_ABOUT: Record<string, JsonLdObject> = {
  "microcharts-word-sized-charts": {
    "@type": "SoftwareSourceCode",
    name: "microcharts",
    alternateName: "@microcharts/react",
    description:
      "Word-sized charts for React — 106 chart types, zero runtime dependencies, accessible by default, server-component safe.",
    codeRepository: "https://github.com/ganapativs/microcharts",
    programmingLanguage: "TypeScript",
    runtimePlatform: "React",
    url: "https://microcharts.dev",
    license: "https://opensource.org/license/mit/",
    author: PERSON_REF,
  },
};

export function blogPostingSchema(post: Post) {
  const url = `${SITE_URL}/blog/${post.slug}`;
  const about = POST_ABOUT[post.slug];
  const cover = post.cover ? `${SITE_URL}/posts/${post.slug}/${post.cover}` : null;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.spoiler,
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    inLanguage: "en",
    author: PERSON_REF,
    publisher: PERSON_REF,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    // The per-route OG image lives behind a hashed metadata segment Next
    // generates at build time — no stable public URL — so only the cover
    // qualifies here.
    ...(cover ? { image: cover } : {}),
    url,
    keywords: post.keywords ? post.keywords.join(", ") : post.tag,
    ...(about ? { about } : {}),
  };
}

export function profilePageSchema(url: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url,
    // The layout already emits the full Person node on every page; reference
    // it instead of inlining a second, unlinked copy.
    mainEntity: PERSON_REF,
  };
}

export function workItemListSchema(items: { name: string; description: string; url?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "CreativeWork",
        name: c.name,
        description: c.description,
        ...(c.url ? { url: c.url } : {}),
        creator: PERSON_REF,
      },
    })),
  };
}

export function blogIndexSchema(posts: Post[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "meetguns blog",
    url: `${SITE_URL}/blog`,
    inLanguage: "en",
    author: PERSON_REF,
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      mainEntityOfPage: { "@type": "WebPage", "@id": `${SITE_URL}/blog/${p.slug}` },
      datePublished: p.date,
      description: p.spoiler,
      keywords: p.tag,
      author: PERSON_REF,
      ...(p.cover ? { image: `${SITE_URL}/posts/${p.slug}/${p.cover}` } : {}),
    })),
  };
}

export function breadcrumbSchema(crumbs: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.url,
    })),
  };
}

// Build a breadcrumb schema rooted at the site home — every route page does this.
export function routeBreadcrumb(name: string, path: string) {
  return breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name, url: `${SITE_URL}${path}` },
  ]);
}

type JsonLdValue =
  | string
  | number
  | boolean
  | null
  | JsonLdValue[]
  | { [key: string]: JsonLdValue };
type JsonLdObject = { [key: string]: JsonLdValue };

function jsonLdScript(data: JsonLdObject) {
  return { __html: JSON.stringify(data) };
}

export function JsonLd({ data }: { data: JsonLdObject | JsonLdObject[] }) {
  const blobs = Array.isArray(data) ? data : [data];
  return (
    <>
      {blobs.map((blob) => {
        // `url` alone is not unique — sibling schemas routinely share one (the
        // layout renders Person + WebSite, both rooted at SITE_URL). Namespace
        // the fallback by `@type` so siblings can't collide. `@id`, when a blob
        // carries one, is already canonical.
        const key = String(
          blob["@id"] ?? `${blob["@type"] ?? "ld"}:${blob.url ?? JSON.stringify(blob)}`,
        );
        return (
          <script
            key={key}
            type="application/ld+json"
            dangerouslySetInnerHTML={jsonLdScript(blob)}
          />
        );
      })}
    </>
  );
}
