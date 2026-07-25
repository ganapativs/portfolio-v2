import type { Metadata } from "next";
import { SITE_URL } from "./jsonld";

// Every route page assembled the same Metadata shape: title + description, a
// canonical, and matching openGraph + twitter blocks. This builds it once.
export function pageMetadata({
  title,
  path,
  description,
  ogType = "website",
  alternates,
}: {
  title: string;
  path: string;
  description: string;
  ogType?: "website" | "profile" | "article";
  alternates?: Metadata["alternates"];
}): Metadata {
  const ogTitle = `${title} · meetguns`;
  return {
    title,
    description,
    alternates: { canonical: path, ...alternates },
    openGraph: {
      title: ogTitle,
      description,
      url: `${SITE_URL}${path}`,
      type: ogType,
      siteName: "meetguns",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      creator: "@Ganapativs",
      site: "@Ganapativs",
    },
  };
}
