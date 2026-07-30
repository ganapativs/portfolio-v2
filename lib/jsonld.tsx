import type { Post } from "@/lib/posts";
import { education, flagships, identity, roles, skills } from "@/lib/resume";

export const SITE_URL = "https://meetguns.com";
const PERSON_NAME = identity.name;

// Stable node ids so sibling schemas on a page reference one Person / WebSite
// node instead of redeclaring near-duplicates the crawler may treat as
// distinct entities.
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PERSON_REF = { "@id": PERSON_ID };

const DEGREE = education.find((e) => e.kind === "degree");

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
  email: `mailto:${identity.email}`,
  nationality: { "@type": "Country", name: "India" },
  // The degree, from lib/resume.ts rather than restated — an alumniOf that
  // disagrees with the résumé page is worse than none.
  ...(DEGREE
    ? {
        alumniOf: {
          "@type": "CollegeOrUniversity",
          name: DEGREE.org,
          ...(DEGREE.href ? { sameAs: DEGREE.href } : {}),
        },
      }
    : {}),
  hasOccupation: {
    "@type": "Occupation",
    name: identity.jobTitle,
    occupationLocation: { "@type": "City", name: identity.location.split(",")[0].trim() },
    // Every skill the résumé claims, flattened. This is the property a
    // knowledge-graph builder actually reads to decide what this person is
    // known for, so it comes from the same list the CV renders.
    skills: skills.flatMap((g) => g.items).join(", "),
  },
  // `knowsAbout` is the coarse version of the same claim — a short, stable list
  // of subjects rather than the full tool inventory.
  knowsAbout: [
    "React",
    "TypeScript",
    "Next.js",
    "frontend engineering",
    "engineering management",
    "AI assistants",
    "Model Context Protocol",
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

/**
 * The open-source catalogue, as an ordered list of code repositories.
 *
 * This is the one part of the site that an answer engine has no way to
 * reconstruct from prose: "55 public repos" is a number in a sentence, whereas
 * this names the four that matter, their repositories and their authorship in
 * a form that can be cited. Rendered on the home page, beside the section that
 * lists them in words.
 */
export function projectsSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Open-source work by Ganapati V S",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: flagships.length,
    itemListElement: flagships.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "SoftwareSourceCode",
        name: f.name,
        description: f.blurb,
        codeRepository: f.repo,
        url: f.repo,
        dateCreated: f.year,
        programmingLanguage: "TypeScript",
        license: "https://opensource.org/license/mit/",
        author: PERSON_REF,
      },
    })),
  };
}

/**
 * The employment history, as a single Organization node with the roles hung
 * off the Person. Eleven years at one company is the central claim this site
 * makes; stated in prose it is a sentence, stated here it is a fact with dates.
 */
const MONTHS = "jan feb mar apr may jun jul aug sep oct nov dec".split(" ");

/** "Sep 2015" → "2015-09". Schema.org dates are ISO 8601; the résumé's are not. */
function isoMonth(human: string): string {
  const m = /^([A-Za-z]{3})[a-z]*\s+(\d{4})$/.exec(human.trim());
  if (!m) return human.trim();
  const i = MONTHS.indexOf(m[1].toLowerCase());
  return i === -1 ? m[2] : `${m[2]}-${String(i + 1).padStart(2, "0")}`;
}

export function employmentSchema() {
  const tracxn = roles.filter((r) => r.org === identity.worksFor.name);
  const earliest = tracxn.at(-1);
  if (!earliest) return null;
  return {
    "@context": "https://schema.org",
    "@type": "EmployeeRole",
    roleName: identity.jobTitle,
    startDate: isoMonth(earliest.start),
    employee: PERSON_REF,
    worksFor: {
      "@type": "Organization",
      name: identity.worksFor.name,
      url: identity.worksFor.url,
      ...(identity.orgTagline ? { description: identity.orgTagline } : {}),
    },
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
