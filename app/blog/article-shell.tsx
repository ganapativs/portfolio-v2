"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef } from "react";
import { PostCard, ordinalLabel } from "@/components/sections";
import { AmbientBlob } from "@/components/primitives/AmbientBlob";
import { posts, type Post } from "./posts";
import { SITE_URL } from "@/lib/jsonld";

function getRelatedPosts(slug: string, tag: string, limit = 2): Post[] {
  const published = posts.filter((p) => !p.draft && p.slug !== slug);
  const sameTag = published.filter((p) => p.tag === tag);
  const others = published.filter((p) => p.tag !== tag);
  const ordered = [...sameTag, ...others].toSorted((a, b) => +new Date(b.date) - +new Date(a.date));
  return ordered.slice(0, limit);
}

export function ArticleShell({ post, children }: { post: Post; children: React.ReactNode }) {
  const ringRef = useRef<SVGSVGElement>(null);
  useEffect(() => {
    let frame = 0;
    // Cache the scroll range — reading scrollHeight/innerHeight forces layout,
    // so do it on resize / content reflow only, not on every scroll frame.
    let max = 0;
    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };
    const update = () => {
      frame = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, max)));
      if (ringRef.current) ringRef.current.style.setProperty("--p", String(p));
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    // Body height changes as lazy images load / content reflows → re-measure.
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    measure();
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);
  const related = useMemo(() => getRelatedPosts(post.slug, post.tag), [post.slug, post.tag]);

  const dateStr = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title + " — by @Ganapativs")}&url=${encodeURIComponent(`${SITE_URL}/blog/${post.slug}`)}`;
  const coverSrc = post.cover ? `/posts/${post.slug}/${post.cover}` : null;

  return (
    <div className="surface article">
      <AmbientBlob />
      <svg
        ref={ringRef}
        className="read-progress"
        viewBox="0 0 36 36"
        width="36"
        height="36"
        aria-hidden="true"
        style={{ ["--p" as string]: 0 } as React.CSSProperties}
      >
        <circle className="read-progress-track" cx="18" cy="18" r="15" />
        <circle className="read-progress-arc" cx="18" cy="18" r="15" />
      </svg>
      <div className="container-narrow">
        <div className="article-back">
          <Link href="/blog" className="btn ghost">
            ← back to writing
          </Link>
        </div>

        <article>
          {coverSrc && (
            <div className="article-cover">
              <Image
                src={coverSrc}
                alt={`Cover image for ${post.title}`}
                fill
                priority
                fetchPriority="high"
                quality={70}
                sizes="(min-width: 1100px) 960px, 100vw"
              />
            </div>
          )}

          <header className="article-header">
            <h1 className="article-title">{post.title}</h1>
            <div className="article-meta">
              <time dateTime={post.date}>{dateStr}</time>
              <span aria-hidden="true">·</span>
              <span>{post.read} read</span>
              <span aria-hidden="true">·</span>
              <a className="ulink" href={tweetUrl} target="_blank" rel="noreferrer">
                Tweet
              </a>
            </div>
          </header>

          {post.spoiler && <p className="article-spoiler">{post.spoiler}</p>}

          {children}
        </article>

        {related.length > 0 && (
          <aside className="article-related" aria-labelledby="article-related-heading">
            <h2 id="article-related-heading" className="article-related-heading">
              Read next
            </h2>
            <div className="article-related-grid">
              {related.map((p, i) => (
                <PostCard
                  key={p.slug}
                  accent={p.accent}
                  n={ordinalLabel(i)}
                  tag={p.tag}
                  read={p.read}
                  title={p.title}
                  sub={p.spoiler}
                  href={`/blog/${p.slug}`}
                />
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
