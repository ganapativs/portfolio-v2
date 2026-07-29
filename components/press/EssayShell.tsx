import Link from "next/link";
import Image from "next/image";
import { SiteHeader } from "@/components/press/SiteHeader";
import { PressFooter } from "@/components/press/PressFooter";
import { posts, type Post } from "@/lib/posts";
import { SITE_URL } from "@/lib/jsonld";

function relatedTo(slug: string, tag: string, limit = 2): Post[] {
  const rest = posts.filter((p) => !p.draft && p.slug !== slug);
  const sameTag = rest.filter((p) => p.tag === tag);
  const others = rest.filter((p) => p.tag !== tag);
  return [...sameTag, ...others]
    .toSorted((a, b) => +new Date(b.date) - +new Date(a.date))
    .slice(0, limit);
}

/**
 * The essay page. A server component — the only client work on a post is the
 * header's reading rule and whatever the MDX itself pulls in.
 */
export function EssayShell({ post, children }: { post: Post; children: React.ReactNode }) {
  const related = relatedTo(post.slug, post.tag);
  // Explicit UTC — see the note in app/(press)/blog/page.tsx.
  const dateStr = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${post.title} — by @Ganapativs`,
  )}&url=${encodeURIComponent(`${SITE_URL}/blog/${post.slug}`)}`;
  const cover = post.cover ? `/posts/${post.slug}/${post.cover}` : null;

  return (
    <div className="doc">
      <SiteHeader progress />

      <div className="wrap wrap-essay doc-main">
        <Link href="/blog" className="essay-back">
          <span aria-hidden="true">←</span> Writing
        </Link>

        <article className="essay">
          <h1 className="essay-title">{post.title}</h1>
          <div className="essay-meta">
            <time dateTime={post.date}>{dateStr}</time>
            <span aria-hidden="true">·</span>
            <span>{post.read}</span>
            <span aria-hidden="true">·</span>
            <a href={shareUrl} target="_blank" rel="noreferrer">
              Share
            </a>
            <span aria-hidden="true">·</span>
            {/* The markdown mirror of this page — see app/blog/[slug].md. */}
            <a href={`/blog/${post.slug}.md`}>.md</a>
          </div>

          {cover && (
            <div
              className="essay-cover"
              style={
                post.coverAspect
                  ? ({ "--cover-ar": post.coverAspect } as React.CSSProperties)
                  : undefined
              }
            >
              <Image
                src={cover}
                alt={`Cover image for ${post.title}`}
                fill
                priority
                fetchPriority="high"
                quality={70}
                sizes="(min-width: 1000px) 960px, 100vw"
              />
            </div>
          )}

          {post.spoiler && <p className="essay-spoiler">{post.spoiler}</p>}

          <div className="prose">{children}</div>
        </article>

        {related.length > 0 && (
          <aside className="readnext" aria-labelledby="readnext-h">
            <h2 id="readnext-h" className="readnext-h">
              Read next
            </h2>
            <div className="teasers">
              {related.map((p) => (
                <Link key={p.slug} className="teaser" href={`/blog/${p.slug}`}>
                  <span className="teaser-read">{p.read}</span>
                  <span className="teaser-title">{p.title}</span>
                  <span className="teaser-sub">{p.spoiler}</span>
                </Link>
              ))}
            </div>
          </aside>
        )}
      </div>

      <PressFooter width="wrap-essay" />
    </div>
  );
}
