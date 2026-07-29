import Link from "next/link";
import { Mark } from "./Mark";

/**
 * The colophon. Same content everywhere; only the measure changes, so the
 * caller passes the width class that matches its page.
 */
export function PressFooter({ width = "" }: { width?: string }) {
  return (
    <footer className={`wrap ${width}`}>
      <div className="press-foot">
        <span className="press-foot-mark">
          <Mark />
          <span className="kn">ಗಣಪತಿ ವಿ ಎಸ್</span> · Karnataka
        </span>
        <span>meetguns · est. 2013</span>
        <span>© 2013–2026 · made in India</span>
        <span className="press-foot-links">
          <Link href="/resume">Résumé</Link>
          {/* RSS is a static asset, not a Next.js page route. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/rss.xml">RSS</a>
        </span>
      </div>
    </footer>
  );
}
