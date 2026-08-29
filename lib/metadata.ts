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
  const og = {
    title: ogTitle,
    description,
    url: `${SITE_URL}${path}`,
    siteName: "meetguns",
    locale: "en_US",
  };
  return {
    title,
    description,
    alternates: { canonical: path, ...alternates },
    openGraph:
      ogType === "profile"
        ? // og:type=profile carries its own name fields. Without them the card
          // is a profile that does not say whose.
          {
            ...og,
            type: "profile",
            firstName: "Ganapati",
            lastName: "V S",
            username: "ganapativs",
          }
        : { ...og, type: ogType },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description,
      creator: "@Ganapativs",
      site: "@Ganapativs",
    },
  };
}
