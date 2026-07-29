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
  experimental: {
    viewTransition: true,
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: isProd ? 60 * 60 * 24 * 365 : 0,
    qualities: [70, 80, 90],
  },
  async headers() {
    const cacheHeaders = isProd
      ? [
          {
            source: "/_next/static/:path*",
            headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
          },
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
        ]
      : [];

    return [{ source: "/:path*", headers: securityHeaders }, ...cacheHeaders];
  },
  // The homepage absorbed both /about and /work, so those URLs no longer exist
  // as pages. They are indexed and linked from outside, so they redirect
  // permanently to the sections that replaced them rather than 404ing.
  async redirects() {
    return [
      { source: "/about", destination: "/#about", permanent: true },
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
