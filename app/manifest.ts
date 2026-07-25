import type { MetadataRoute } from "next";
import { getAccent } from "@/lib/accents";

export default function manifest(): MetadataRoute.Manifest {
  const isProd = process.env.NODE_ENV === "production";
  const accent = getAccent(isProd ? "terracotta" : "sage").c;
  const suffix = isProd ? "" : " (dev)";

  return {
    name: `Ganapati V S — meetguns${suffix}`,
    short_name: `meetguns${suffix}`,
    description:
      "Engineer and engineering leader, in Bengaluru. Ten years in one place — building product, growing the team, still writing code.",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    lang: "en",
    dir: "ltr",
    categories: ["portfolio", "personal", "blog"],
    background_color: "#FBF6EA",
    theme_color: accent,
    icons: [
      { src: "/icon", sizes: "any", type: "image/svg+xml" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
