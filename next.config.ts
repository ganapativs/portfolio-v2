import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Stamp intrinsic pixel dimensions onto local MDX images, at compile time.
 *
 * `ZoomImage` has taken `width`/`height` since it was written and its own
 * docstring calls them the CLS guard, but nothing ever passed them: an MDX
 * author writes `![alt](/posts/…)` and there is nowhere in that syntax to say
 * how big the file is. So every essay image loaded at zero height and shoved
 * the prose down when it arrived.
 *
 * Compile time, not request time. A remark plugin runs in the build and leaves
 * plain numbers in the output, so no `node:fs` reaches the Worker bundle --
 * which it would if the `img` mapper in `mdx-components.tsx` did the reading.
 *
 * PNG and WebP, read straight from their headers, so it needs no dependency.
 * Those are the two formats an MDX body here references. **Anything it cannot
 * measure it leaves alone** -- a remote URL, a JPEG, a file that has moved --
 * because a wrong dimension is worse than none: it reserves the wrong box and
 * shifts the page twice.
 */
function imageSize(url: string): { width: number; height: number } | null {
  if (!url.startsWith("/")) return null;
  let buf: Buffer;
  try {
    buf = readFileSync(join(process.cwd(), "public", url));
  } catch {
    return null;
  }
  // PNG: 8-byte signature, then the IHDR length and type, then the dimensions.
  if (buf.length >= 24 && buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  // WebP: a RIFF container whose first chunk says which of the three codings
  // this is, and each stores its size differently. Lossless (VP8L) is what the
  // committed images are, but a file swapped for a lossy or extended one should
  // not silently lose its dimensions.
  if (
    buf.length >= 30 &&
    buf.toString("ascii", 0, 4) === "RIFF" &&
    buf.toString("ascii", 8, 12) === "WEBP"
  ) {
    const chunk = buf.toString("ascii", 12, 16);
    if (chunk === "VP8X") {
      return {
        width: 1 + buf.readUIntLE(24, 3),
        height: 1 + buf.readUIntLE(27, 3),
      };
    }
    if (chunk === "VP8L" && buf[20] === 0x2f) {
      // 14 bits of width-1 then 14 bits of height-1, little-endian.
      const bits = buf.readUInt32LE(21);
      return { width: 1 + (bits & 0x3fff), height: 1 + ((bits >> 14) & 0x3fff) };
    }
    if (chunk === "VP8 ") {
      return { width: buf.readUInt16LE(26) & 0x3fff, height: buf.readUInt16LE(28) & 0x3fff };
    }
  }
  return null;
}

function remarkImageSize() {
  return (tree: unknown) => {
    const walk = (node: Record<string, unknown>) => {
      if (node.type === "image" && typeof node.url === "string") {
        const size = imageSize(node.url);
        if (size) {
          const data = (node.data ??= {}) as Record<string, unknown>;
          data.hProperties = { ...(data.hProperties as object), ...size };
        }
      }
      const kids = node.children;
      if (Array.isArray(kids)) for (const k of kids) walk(k as Record<string, unknown>);
    };
    walk(tree as Record<string, unknown>);
  };
}

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkSmartypants, remarkImageSize],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: "wrap" }],
      [rehypeHighlight, { detect: true, ignoreMissing: true }],
    ],
  },
});

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), interest-cohort=(), browsing-topics=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  allowedDevOrigins: ["portfolio-v2.local"],
  // `X-Powered-By: Next.js` names the framework and version surface to anyone
  // scanning, and buys nothing.
  poweredByHeader: false,
  experimental: {
    // `viewTransition` was here and is gone. Next 16.3 turned view transitions
    // on for the App Router with no configuration, and the key no longer
    // exists on ExperimentalConfig, so leaving it in fails the typecheck.
    // <ViewTransition> in app/(press)/layout.tsx is unchanged.
    //
    // inlineCss is deliberately OFF, having been measured both ways.
    //
    // Inlining removes the stylesheet's round trip, which is the usual win.
    // But the flag has a documented flaw — the styles ship twice on first
    // load, once in a <style> tag and once again inside the RSC payload — and
    // this site's sheet is 18 kB, so the HTML went 18 kB → 57 kB to save one
    // request. Over HTTP/2, where that request is multiplexed onto a
    // connection already open, the trade is a loss: Lighthouse LCP was 0.7 s
    // desktop / 2.9 s mobile inlined, against 0.6 s / 2.7 s with the <link>.
    // Turn it back on only if the sheet gets much smaller, or the duplication
    // is fixed upstream.
    inlineCss: false,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: isProd ? 60 * 60 * 24 * 365 : 0,
    qualities: [70, 80, 90],
  },
  async headers() {
    // No entry for /_next/static here: Next already serves it
    // `public, max-age=31536000, immutable`, and overriding it earns a build
    // warning about breaking dev behaviour for a header that was identical.
    const cacheHeaders = isProd
      ? [
          {
            source: "/portrait/:path*",
            headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
          },
          {
            source: "/posts/:path*",
            headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
          },
          {
            source: "/rss.xml",
            headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
          },
          {
            source: "/llms.txt",
            headers: [{ key: "Cache-Control", value: "public, max-age=3600, s-maxage=3600" }],
          },
          {
            source: "/brand/:path*",
            headers: [{ key: "Cache-Control", value: "public, max-age=2592000" }],
          },
          // The generated icon family. A day, with a long stale window: the
          // artwork only changes when the mark does, but a browser holding a
          // stale favicon for a year is its own kind of bug.
          {
            source: "/:icon(favicon.ico|icon|icon-192|icon-512|icon-512-maskable|apple-icon)",
            headers: [
              {
                key: "Cache-Control",
                value: "public, max-age=86400, stale-while-revalidate=604800",
              },
            ],
          },
          {
            source: "/manifest.webmanifest",
            headers: [{ key: "Cache-Control", value: "public, max-age=86400" }],
          },
        ]
      : [];

    return [{ source: "/:path*", headers: securityHeaders }, ...cacheHeaders];
  },
  // The homepage absorbed both /about and /work, so those URLs no longer exist
  // as pages. They are indexed and linked from outside, so they redirect
  // permanently to the sections that replaced them rather than 404ing.
  async redirects() {
    return [
      { source: "/about", destination: "/#subject", permanent: true },
      { source: "/work", destination: "/#work", permanent: true },
    ];
  },
  // Every post is also served as plain markdown at /blog/<slug>.md. App Router
  // segments can't carry a file extension and a catch-all would collide with
  // the post page, so the public URL is rewritten onto a route handler.
  async rewrites() {
    return [{ source: "/blog/:slug.md", destination: "/api/blog-md/:slug" }];
  },
};

export default withMDX(nextConfig);

/**
 * Makes the Cloudflare bindings from wrangler.jsonc reachable in `next dev`,
 * through `getCloudflareContext()`. Nothing here calls it yet. It is wired now
 * because the alternative is discovering the gap the first time something does
 * need a binding, and finding that it works in production and not locally.
 *
 * Dev only. It is a no-op in `next build` and in the Worker.
 */
initOpenNextCloudflareForDev();
