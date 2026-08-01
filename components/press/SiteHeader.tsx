"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { Mark } from "./Mark";

/**
 * The masthead line for every page that isn't home. The home route has the
 * folio bar instead — same job, different voice.
 *
 * `progress` turns the header's bottom rule into the reading indicator rather
 * than adding a second object to the page.
 */
export function SiteHeader({ progress = false }: { progress?: boolean }) {
  const pathname = usePathname();
  const fx = useFX();
  const [scrolled, setScrolled] = useState(false);
  const railRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    // scrollHeight/innerHeight force layout, so measure on resize and content
    // reflow only — never inside the scroll handler.
    let max = 0;
    const measure = () => {
      max = document.documentElement.scrollHeight - window.innerHeight;
    };
    const update = () => {
      frame = 0;
      const y = window.scrollY;
      setScrolled(y > 4);
      if (railRef.current) {
        const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
        railRef.current.style.setProperty("--p", String(p));
      }
    };
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(document.body);
    measure();
    update();
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      ro.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const on = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <header className="site-head" data-scrolled={scrolled}>
      <div className="wrap wrap-doc site-head-in">
        <Link href="/" className="brand" data-analytics="nav:header.home" onClick={() => fx?.nav()}>
          <Mark className="brand-mark" />
          <span className="brand-name">meetguns</span>
        </Link>
        <nav className="site-nav" aria-label="Sections">
          <Link
            href="/blog"
            data-analytics="nav:header.writing"
            aria-current={on("/blog") ? "page" : undefined}
            onClick={() => fx?.nav()}
          >
            Writing
          </Link>
        </nav>
      </div>
      {progress && <span ref={railRef} className="read-line" aria-hidden="true" />}
    </header>
  );
}
