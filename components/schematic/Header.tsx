"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Mark } from "./Mark";
import { useFX } from "@/components/providers/FXProvider";
import { useInk } from "@/components/providers/InkProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useShortcut } from "@/components/shortcuts/useShortcut";
import { INKS, type InkId } from "@/lib/ink";
import { track } from "@/lib/analytics";
import { identity } from "@/lib/resume";
import { approach, useReducedMotion } from "./useReducedMotion";

/** The drawing's title, per sheet. A drawing says what it is of. */
function drawingTitle(pathname: string): string {
  if (pathname === "/") return "General arrangement";
  if (pathname === "/resume") return "Specification sheet";
  if (pathname === "/blog") return "Revision index";
  if (pathname.startsWith("/blog/")) return "Revision detail";
  return "Sheet";
}

export function SchematicHeader() {
  const [trayOpen, setTrayOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const fx = useFX();
  const { toggle } = useTheme();
  const { ink, setInk } = useInk();

  const homeRef = useShortcut<HTMLAnchorElement>({
    id: "nav.home",
    keys: ["h"],
    label: "Home",
    group: "Navigate",
    run: () => router.push("/"),
  });
  const writingRef = useShortcut<HTMLAnchorElement>({
    id: "nav.writing",
    keys: ["b"],
    label: "Writing",
    group: "Navigate",
    run: () => router.push("/blog"),
  });
  const resumeRef = useShortcut<HTMLAnchorElement>({
    id: "nav.resume",
    keys: ["r"],
    label: "Résumé",
    group: "Navigate",
    run: () => router.push("/resume"),
  });
  // No origin: a keyboard press has no point on the page behind it, so the
  // band sweeps top to bottom instead of left to right. See ThemeProvider.
  const themeRef = useShortcut<HTMLButtonElement>({
    id: "theme.toggle",
    keys: ["t"],
    label: "Switch the paper",
    group: "Theme",
    run: () => toggle(),
  });
  const soundRef = useShortcut<HTMLButtonElement>({
    id: "sound.toggle",
    keys: ["m"],
    label: fx?.soundOn ? "Mute" : "Unmute",
    group: "Sound",
    run: () => fx?.toggleSound(),
  });

  const on = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  /**
   * Whether the header has left the top of the page.
   *
   * A sentinel rather than a scroll listener: a 1px box sits above the header,
   * and the moment it leaves the viewport the header is stuck. That is one
   * observer callback per crossing instead of a handler on every scroll frame,
   * and it needs no thresholds to tune.
   */
  const [stuck, setStuck] = useState(false);
  const sentinel = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /**
   * The header's own box never changes size. Only what is drawn inside it does.
   *
   * A sticky element stays in flow, so a header that shrinks by 36px when it
   * sticks pulls everything under it up by 36px at that exact moment. The first
   * fix was a spacer below it driven by a ResizeObserver, and it was worse: the
   * observer fires after each resize, so through the whole 260ms condense the
   * content below sat a frame behind the header and juddered the entire way
   * down. That is the flicker.
   *
   * So the outer box is locked to its natural height and the strip condenses
   * inside it. Nothing below moves at all, there is no observer in the scroll
   * path, and the dead area under the condensed strip is handed back to the
   * page with `pointer-events` in chrome.css.
   *
   * Measured while unstuck, which is where the page starts and returns to.
   */
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const h = headerRef.current;
    if (!h) return;
    const measure = () => {
      if (h.dataset.stuck === "true") return;
      h.style.setProperty("--hd-h", `${Math.round(h.getBoundingClientRect().height)}px`);
    };
    measure();
    let rz = 0;
    const onResize = () => {
      window.clearTimeout(rz);
      rz = window.setTimeout(measure, 150);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(measure).catch(() => {});
    return () => {
      window.clearTimeout(rz);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <>
      <span className="hd-sentinel" ref={sentinel} aria-hidden="true" />
      <header className="hd" data-stuck={stuck} ref={headerRef}>
        <div className="hd-row">
          <Link
            href="/"
            className="hd-brand"
            ref={homeRef}
            data-analytics="nav:header.home"
            aria-label="Home"
            onPointerEnter={() => fx?.tick()}
            onClick={() => fx?.nav()}
          >
            <Mark className="hd-mark" />
            <span className="hd-name">{identity.name}</span>
            <span className="hd-kn" lang="kn">
              ಗಣಪತಿ ವಿ ಎಸ್
            </span>
          </Link>

          <nav className="hd-nav" aria-label="Site">
            <Link
              href="/blog"
              ref={writingRef}
              aria-current={on("/blog") ? "page" : undefined}
              data-analytics="nav:header.writing"
              onClick={() => fx?.nav()}
            >
              writing
            </Link>
            <Link
              href="/resume"
              ref={resumeRef}
              aria-current={on("/resume") ? "page" : undefined}
              data-analytics="nav:header.resume"
              onClick={() => fx?.nav()}
            >
              résumé
            </Link>

            <span className="hd-ctls">
              {/* Below 640px the CSS hides every swatch but the active one. The
                  one that stays visible is a real button, so pressing it is what
                  opens the tray: no handler on the group, and the keyboard gets
                  the behaviour for free. Above 640px the attribute does nothing
                  and all six are always shown. */}
              <span className="inks" role="group" aria-label="Ink" data-open={trayOpen}>
                {INKS.map((i, n) => (
                  <InkSwatch
                    key={i.id}
                    id={i.id}
                    label={i.label}
                    n={n + 1}
                    on={ink === i.id}
                    pick={setInk}
                    onPicked={() => setTrayOpen(ink === i.id)}
                  />
                ))}
              </span>

              <button
                type="button"
                className="ctl"
                ref={themeRef}
                // Deliberately not "switch to dark" / "switch to light". The
                // server does not know which paper the reader chose — the
                // no-flash script stamps that before React sees the page — so a
                // theme-dependent label is a guaranteed hydration mismatch, and a
                // toggle that renames itself is worse to hear read out anyway.
                aria-label="Switch the paper"
                title="Paper · t"
                onClick={(e) => {
                  // The origin is the middle of the control rather than the
                  // pointer, so a click and a keyboard activation of the same
                  // button are told apart by intent, not by a few pixels.
                  const r = e.currentTarget.getBoundingClientRect();
                  fx?.clack();
                  window.setTimeout(() => fx?.chime(), 80);
                  toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
                }}
              >
                {/* Half the disc hatched: the drawing-office way to say "this
                    side is in shadow", and it needs no sun or moon. */}
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                  <defs>
                    <pattern
                      id="hatch-theme"
                      width="1.75"
                      height="1.75"
                      patternUnits="userSpaceOnUse"
                      patternTransform="rotate(45)"
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1.75"
                        stroke="currentColor"
                        strokeWidth="0.8"
                      />
                    </pattern>
                  </defs>
                  <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1" />
                  <path d="M7 1.5 A5.5 5.5 0 0 1 7 12.5 Z" fill="url(#hatch-theme)" />
                </svg>
              </button>

              <SoundToggle btnRef={soundRef} />
            </span>
          </nav>
        </div>

        <div className="hd-rule">
          <span className="hd-title">
            {drawingTitle(pathname)}
            <span className="hd-title-full"> · {identity.name} · 2026</span>
          </span>
          <NorthArrow />
        </div>
      </header>
    </>
  );
}

function InkSwatch({
  id,
  label,
  n,
  on,
  pick,
  onPicked,
}: {
  id: InkId;
  label: string;
  n: number;
  on: boolean;
  pick: (id: InkId, origin?: { x: number; y: number } | null, via?: "tray" | "key") => void;
  /** Lets the header open its collapsed tray on the active swatch and close it
   *  again on any other. */
  onPicked: () => void;
}) {
  const ref = useShortcut<HTMLButtonElement>({
    id: `ink.${id}`,
    keys: [String(n)],
    label,
    group: "Ink",
    // The provider plays this ink's own pitch; the registry's generic tick
    // would land on top of it.
    silent: true,
    run: () => pick(id, null, "key"),
  });
  return (
    <button
      type="button"
      ref={ref}
      className="ink-sw"
      style={{ color: `var(--sw-${id})` }}
      aria-pressed={on}
      aria-label={`${label} ink`}
      title={`${label} · ${n}`}
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        onPicked();
        pick(id, { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
    >
      <i />
    </button>
  );
}

function SoundToggle({ btnRef }: { btnRef: React.RefObject<HTMLButtonElement | null> }) {
  const fx = useFX();
  const on = fx?.soundOn ?? true;
  return (
    <button
      type="button"
      ref={btnRef}
      className="ctl"
      aria-pressed={on}
      aria-label={on ? "Mute the drawing" : "Unmute the drawing"}
      title="Sound · m"
      onClick={() => {
        fx?.toggleSound();
        track({ name: "sound", on: !on });
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        aria-hidden="true"
      >
        <path d="M2.5 5.5h2L8 2.8v8.4L4.5 8.5h-2z" strokeLinejoin="round" />
        {on ? (
          <path d="M9.8 5.2c.9.9.9 2.7 0 3.6M11.3 3.8c1.6 1.7 1.6 4.7 0 6.4" />
        ) : (
          <path d="M9.6 5.4l3 3M12.6 5.4l-3 3" />
        )}
      </svg>
    </button>
  );
}

/**
 * The north arrow, whose needle points at the cursor.
 *
 * Every drawing has one and it always points the same way, which makes it the
 * one piece of drawing furniture with nothing to say. Pointing it at the reader
 * gives it a job: it is the only mark on the sheet that knows where the hand
 * is. It eases toward the target and stops the loop the moment it arrives.
 */
function NorthArrow() {
  const hostRef = useRef<SVGSVGElement>(null);
  const needleRef = useRef<SVGGElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = hostRef.current;
    const g = needleRef.current;
    if (!el || !g) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let ang = 0;
    let target = 0;
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      if (reduced.current) {
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
        return;
      }
      const dt = Math.min(now - (last || now - 16.667), 50);
      last = now;
      let d = target - ang;
      // Take the short way round, so a pointer crossing due north does not send
      // the needle the long way about.
      while (d > Math.PI) d -= 6.2832;
      while (d < -Math.PI) d += 6.2832;
      ang += d * approach(0.15, dt);
      g.style.transform = `rotate(${ang}rad)`;
      if (Math.abs(d) < 0.003) {
        ang = target;
        cancelAnimationFrame(raf);
        raf = 0;
        last = 0;
      }
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      target = Math.atan2(e.clientX - (r.left + 9), -(e.clientY - (r.top + 9)));
      if (!raf && !document.hidden && !reduced.current) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, [reduced]);

  return (
    <svg
      className="north"
      ref={hostRef}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      aria-hidden="true"
    >
      <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
      <g className="needle" ref={needleRef}>
        <path className="tip" d="M9 2.5 L11 9 L7 9 Z" />
        <path d="M9 15.5 L11 9 L7 9 Z" fill="none" stroke="currentColor" strokeWidth="1" />
      </g>
    </svg>
  );
}
