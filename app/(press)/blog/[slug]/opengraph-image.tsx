import { notFound } from "next/navigation";
import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { published } from "@/lib/posts";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;
// Required by `output: "export"` — a metadata image route is a route handler
// underneath, and the export builds only handlers marked static.
export const dynamic = "force-static";
// A static string, where a `generateImageMetadata` used to echo the post title.
// `output: "export"` and that hook fight over `generateStaticParams` (Next's
// metadata-route loader synthesises its own from it, and the export build then
// finds the slug param missing) — and the card already sets the title in
// 64px type, so the alt was the one thing it carried.
export const alt = "Blog post";

// `output: "export"` builds this image as its own static route, and that route
// does not inherit the page's params — without this, the build fails asking
// for "slug".
export async function generateStaticParams() {
  return published.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // `published`, not `posts` — a draft's OG image must not be generatable.
  const post = published.find((p) => p.slug === slug);
  if (!post) notFound();
  return renderOG({
    eyebrow: `${post.tag} · ${post.read}`,
    title: post.title,
    accent: post.accent,
  });
}
