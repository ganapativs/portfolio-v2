import Link from "next/link";
import Image from "next/image";
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
 * An essay, set on the drawing's own sheet.
 *
 * The measure narrows to 760px because prose has a different job than a
 * drawing, and the metadata line is set as a drawing's revision note: mono,
 * small, dated, with the machine-readable mirror named beside it.
 *
 * A server component — the only client work on a post is whatever the MDX
 * itself pulls in.
 */
export function EssayShell({ post, children }: { post: Post; children: React.ReactNode }) {
  const related = relatedTo(post.slug, post.tag);
  // Explicit UTC — see the note in app/(press)/blog/page.tsx.
  const dateStr = new Date(post.date).toLocaleDateString("en-CA", { timeZone: "UTC" });
  const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `${post.title} · by @Ganapativs`,
  )}&url=${encodeURIComponent(`${SITE_URL}/blog/${post.slug}`)}`;
  const cover = post.cover ? `/posts/${post.slug}/${post.cover}` : null;

  return (
    <article className="essay" id="essay" data-sec="essay">
      <Link href="/blog" className="essay-back" data-analytics="nav:essay.back">
        <span aria-hidden="true">←</span> writing
      </Link>

      <h1 className="essay-title">{post.title}</h1>

      <div className="essay-meta">
        <time dateTime={post.date}>{dateStr}</time>
        <span aria-hidden="true">·</span>
        <span>{post.read}</span>
        <span aria-hidden="true">·</span>
        <span>{post.tag}</span>
        <span aria-hidden="true">·</span>
        <a
          href={shareUrl}
          target="_blank"
          rel="noreferrer"
          data-analytics={`cta:essay.share.${post.slug}`}
        >
          share
        </a>
        <span aria-hidden="true">·</span>
        {/* The markdown mirror of this page — see app/api/blog-md. */}
        <a href={`/blog/${post.slug}.md`} data-analytics="feed:markdown">
          .md
        </a>
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
            // 834px, not 760: the cover deliberately bleeds wider than the prose measure.
            sizes="(min-width: 940px) 834px, 100vw"
          />
        </div>
      )}

      {post.spoiler && <p className="essay-spoiler">{post.spoiler}</p>}

      <div className="prose">{children}</div>

      {related.length > 0 && (
        <aside className="readnext" aria-labelledby="readnext-h">
          <h2 className="sec-label" id="readnext-h">
            Read next
          </h2>
          <div className="entries">
            {related.map((p, i) => (
              <Link key={p.slug} className="entry" href={`/blog/${p.slug}`}>
                <span className="entry-no">{String(i + 1).padStart(3, "0")}</span>
                <span className="entry-main">
                  <h3 className="entry-title">{p.title}</h3>
                  <span className="entry-sub">{p.spoiler}</span>
                </span>
                <span className="entry-meta">
                  <span>{p.read}</span>
                </span>
              </Link>
            ))}
          </div>
        </aside>
      )}
    </article>
  );
}
