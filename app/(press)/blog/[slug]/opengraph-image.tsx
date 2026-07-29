import { notFound } from "next/navigation";
import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";
import { published } from "@/lib/posts";

export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export async function generateImageMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = published.find((p) => p.slug === slug);
  return [{ id: "default", alt: post?.title ?? "Blog post", contentType, size }];
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
