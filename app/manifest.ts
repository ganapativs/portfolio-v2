import type { MetadataRoute } from "next";
import { INK_HEX, SURFACE_HEX } from "@/lib/ink";
import { BIO } from "@/lib/resume";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  const isProd = process.env.NODE_ENV === "production";
  const accent = INK_HEX[isProd ? "dustblue" : "aubergine"];
  const suffix = isProd ? "" : " (dev)";

  return {
    name: `Ganapati V S · meetguns${suffix}`,
    short_name: `meetguns${suffix}`,
    description: BIO,
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
        label: "The home page: intro, project figures and the open-source list",
      },
      {
        src: "/brand/screenshot-narrow.png",
        sizes: "540x1170",
        type: "image/png",
        form_factor: "narrow",
        label: "The home page, on a phone",
      },
    ],
    // The two destinations worth a long-press on the installed icon. The header
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
