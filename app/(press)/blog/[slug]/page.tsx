import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EssayShell } from "@/components/schematic/EssayShell";
import { posts, published } from "@/lib/posts";
import { blogPostingSchema, breadcrumbSchema, JsonLd, SITE_URL } from "@/lib/jsonld";

const loaders: Record<string, () => Promise<{ default: React.ComponentType }>> = {
  "microcharts-word-sized-charts": () =>
    import("@/content/blog/microcharts-word-sized-charts/page.mdx"),
  "aborting-a-fetch-request": () => import("@/content/blog/aborting-a-fetch-request/page.mdx"),
  "babel-plugins-loose-mode-caveats": () =>
    import("@/content/blog/babel-plugins-loose-mode-caveats/page.mdx"),
  "introducing-react-spectrum": () => import("@/content/blog/introducing-react-spectrum/page.mdx"),
};

export const dynamicParams = true;

export async function generateStaticParams() {
  // Fail the build loudly if a published post has no loader entry — otherwise
  // sitemap + RSS advertise a URL that 404s.
  const missing = published.filter((p) => !loaders[p.slug]);
  if (missing.length > 0) {
    throw new Error(
      `Published post(s) missing a loader in app/(press)/blog/[slug]/page.tsx: ${missing
        .map((p) => p.slug)
        .join(", ")}`,
    );
  }
  return published.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post || post.draft) return { robots: { index: false, follow: false } };
  const url = `/blog/${slug}`;
  const ogTitle = `${post.title} · meetguns`;
  return {
    title: post.title,
    description: post.spoiler,
    keywords: post.keywords,
    alternates: {
      canonical: url,
      // The plain-markdown mirror, for anything reading this without a browser.
      types: { "text/markdown": [{ url: `${url}.md`, title: post.title }] },
    },
    openGraph: {
      title: ogTitle,
      description: post.spoiler,
      url: `${SITE_URL}${url}`,
      type: "article",
      siteName: "meetguns",
      locale: "en_US",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      authors: ["Ganapati V S"],
      tags: [post.tag],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: post.spoiler,
      creator: "@Ganapativs",
      site: "@Ganapativs",
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post || post.draft || !loaders[slug]) notFound();
  const Mod = await loaders[slug]();
  const Content = Mod.default;
  const breadcrumbs = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Writing", url: `${SITE_URL}/blog` },
    { name: post.title, url: `${SITE_URL}/blog/${slug}` },
  ]);
  return (
    <>
      <JsonLd data={[blogPostingSchema(post), breadcrumbs]} />
      <EssayShell post={post}>
        <Content />
      </EssayShell>
    </>
  );
}
