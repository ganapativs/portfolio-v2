import type { MetadataRoute } from "next";
import { INK_HEX, SURFACE_HEX } from "@/lib/ink";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const isProd = process.env.NODE_ENV === "production";
  const accent = INK_HEX[isProd ? "terracotta" : "sage"];
  const suffix = isProd ? "" : " (dev)";

  return {
    name: `Ganapati V S — meetguns${suffix}`,
    short_name: `meetguns${suffix}`,
    description:
      "Engineer and engineering leader in Bengaluru. Eleven years at Tracxn, from first-week engineer to VP — still writing code most weeks.",
    start_url: "/",
    id: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "minimal-ui"],
    orientation: "portrait",
    lang: "en",
    dir: "ltr",
    categories: ["portfolio", "personal", "blog"],
    background_color: SURFACE_HEX.light.paper,
    theme_color: accent,
    // Chrome's install criteria need a 192 and a 512 PNG. The SVG is there for
    // anything that would rather scale than resample, and the maskable cut is
    // its own render (see lib/icon-png.tsx) rather than a second `purpose` on
    // the square artwork — Android would shave the bar off that.
    icons: [
      { src: "/icon", sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512-maskable", sizes: "512x512", type: "image/png", purpose: "maskable" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
    ],
    // Both form factors, because Chromium only shows the richer install dialog
    // when it has a screenshot matching the device doing the installing.
    // Regenerate with `pnpm gen:pwa-assets`.
    screenshots: [
      {
        src: "/brand/screenshot-wide.png",
        sizes: "1280x800",
        type: "image/png",
        form_factor: "wide",
        label: "The masthead and the eleven-year press run",
      },
      {
        src: "/brand/screenshot-narrow.png",
        sizes: "540x1170",
        type: "image/png",
        form_factor: "narrow",
        label: "The masthead, on a phone",
      },
    ],
    // The two destinations worth a long-press on the installed icon. The dock
    // carries Home and Writing; Résumé deliberately isn't in it, which makes it
    // exactly the thing a shortcut is for.
    shortcuts: [
      {
        name: "Writing",
        short_name: "Writing",
        url: "/blog",
        description: "Essays and notes",
        icons: [{ src: "/icon-192", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Résumé",
        short_name: "Résumé",
        url: "/resume",
        description: "The CV, print-friendly",
        icons: [{ src: "/icon-192", sizes: "192x192", type: "image/png" }],
      },
    ],
    prefer_related_applications: false,
  };
}
