import type { NextConfig } from "next";
import createMDX from "@next/mdx";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [remarkGfm, remarkSmartypants],
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
    viewTransition: true,
    // Deliberately OFF, having been measured both ways.
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
