import type { Metadata } from "next";
import { legacyFontVars } from "@/lib/fonts-old";
import { AccentProvider } from "@/components/providers/AccentProvider";
import { RevealController } from "@/components/RevealController";
import { Dock } from "@/components/Dock";
import { SiteFooter } from "@/components/SiteFooter";
// The retired design's stylesheet. It is imported here and nowhere else, so
// Next scopes it to /old/* and the live site never downloads it. Loading after
// styles/press.css means its :root token block wins on these routes — same
// specificity, later wins — which is exactly what the archive needs.
// eslint-disable-next-line import/no-unassigned-import
import "@/app/globals.css";

export const metadata: Metadata = {
  // An archive, not a destination. Keep it out of the index and off the sitemap
  // (app/robots.ts disallows the prefix as well).
  robots: { index: false, follow: false },
};

/**
 * The retired design, kept browsable at /old/* while the press design settles.
 * It mounts its own accent + reveal providers and its own chrome; theme, sound
 * and the shortcut registry come from the root layout and are shared.
 */
export default function OldLayout({ children }: { children: React.ReactNode }) {
  return (
    <AccentProvider>
      <RevealController>
        <div className={`${legacyFontVars} app-shell`}>
          <a href="#old-content" className="skip-link">
            Skip to content
          </a>
          <main id="old-content">{children}</main>
          <SiteFooter />
          <Dock />
        </div>
      </RevealController>
    </AccentProvider>
  );
}
