import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/jsonld";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // /old/* is the retired design, kept browsable but never indexed —
        // app/old/layout.tsx also sets robots noindex on every page under it.
        disallow: ["/api/", "/old/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
