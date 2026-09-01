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
  // Mirrors the 640px breakpoint at which the CSS collapses the tray to the
  // active swatch. Below it that swatch is a disclosure, and a disclosure
  // needs to say so (aria-expanded, and a name that names the action) —
  // above it the attribute would be a lie on a plain toggle.
  const [narrowTray, setNarrowTray] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setNarrowTray(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
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
  // The résumé, in the strip and in the title block both — the owner settled
  // it that way (2026-09-01) after trying header-only and footer-only: the
  // short way for the reader hunting a CV, the sheet-reference balloon for the
  // reader who reached the foot. `r` lives here, with the control its
  // Shift-hold hint floats over; the registry refuses duplicate keys, so the
  // title-block chip carries no shortcut.
  const resumeRef = useShortcut<HTMLAnchorElement>({
    id: "nav.resume",
    keys: ["r"],
    label: "Résumé",
    group: "Navigate",
    run: () => router.push("/resume"),
  });
  // The iris opens from the control. A key has no pointer, so the circle
  // starts at the viewport centre rather than pretending a press landed.
  const themeRef = useShortcut<HTMLButtonElement>({
    id: "theme.toggle",
    keys: ["t"],
    label: "Switch the paper",
    group: "Theme",
    // Clacks, the same as a press on the control. Without this the two paths
    // to one action sounded different: a clack from the pointer, the registry's
    // generic tick from the key.
    silent: true,
    run: () => {
      fx?.clack();
      toggle();
    },
  });
  const soundRef = useShortcut<HTMLButtonElement>({
    id: "sound.toggle",
    keys: ["m"],
    label: fx?.soundOn ? "Mute" : "Unmute",
    group: "Sound",
    // `toggleSound` confirms itself when it turns sound on. The generic tick
    // landed on top of that confirmation.
    silent: true,
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
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setStuck(!e.isIntersecting), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /**
   * A route change resets the scroll, and the un-stick has to be a snap, not
   * a performance. Navigating home from the foot of the résumé used to play
   * the whole 260ms condense in reverse on arrival: the observer fires a beat
   * after Next has already scrolled to the top, so the new page painted with
   * the condensed strip over its hero, then the title grew back in front of
   * the reader. The reader didn't scroll; nothing should appear to answer a
   * scroll. `data-instant` suppresses the strip's transitions while the state
   * is synced from the sentinel's real position, and comes off two frames
   * later so the next real scroll condenses normally.
   */
  useEffect(() => {
    const h = headerRef.current;
    const el = sentinel.current;
    if (!h || !el) return;
    h.dataset.instant = "";
    const sync = () => setStuck(el.getBoundingClientRect().top < 0);
    sync();
    // Once more after Next's scroll restoration has actually run — it lands
    // after the commit this effect belongs to.
    const t1 = window.setTimeout(sync, 50);
    const t2 = window.setTimeout(() => {
      delete h.dataset.instant;
    }, 300);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      delete h.dataset.instant;
    };
  }, [pathname]);

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
   * (headerRef itself is declared beside the stuck state above, which also
   * needs it for the route-change snap.)
   */
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
        {/* Row and rule are one strip: the ground and the blur belong to both,
            or the rule sits below the blurred band with unblurred content
            passing through the gap between them. */}
        <div className="hd-strip">
          <div className="hd-row">
            <Link
              href="/"
              className="hd-brand"
              ref={homeRef}
              // The brand is in every viewport on every route, and its
              // prefetch pulled the home page's whole chunk group (~100 kB gz
              // of charts and figures) onto the résumé and every essay a
              // second after load — quietly undoing the route-size work the
              // bundle-shape notes in AGENTS.md describe. The home page is
              // static; fetching it on the click is imperceptible.
              prefetch={false}
              data-analytics="nav:header.home"
              aria-label="Home"
              // No onPointerEnter tick here. PageFX ticks every link and button
              // on the page already, and a second one from the control itself
              // only survived because `tick` is throttled to 80ms.
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
                      discloses={narrowTray && ink === i.id ? trayOpen : undefined}
                    />
                  ))}
                </span>

                <button
                  type="button"
                  className="ctl"
                  ref={themeRef}
                  // Clacks. See the rule in PageFX.
                  data-cue="self"
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
                    // A switch thrown, which `clack` already is: two notes, 40ms
                    // apart. The chime 80ms behind it made four tones for one
                    // press, where the sound toggle beside it plays one.
                    fx?.clack();
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
                    <circle
                      cx="7"
                      cy="7"
                      r="5.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                    />
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
              {/* No name here: the brand block 40px up already sets it twice
                  (Latin and Kannada), and the title block at the foot signs
                  the sheet. The drawing's own line carries what the header
                  does not: the title and the year. */}
              <span className="hd-title-full"> · 2026</span>
            </span>
            <NorthArrow />
          </div>
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
  discloses,
}: {
  id: InkId;
  label: string;
  n: number;
  on: boolean;
  pick: (id: InkId, origin?: { x: number; y: number } | null, via?: "tray" | "key") => void;
  /** Lets the header open its collapsed tray on the active swatch and close it
   *  again on any other. */
  onPicked: () => void;
  /** Set only on the active swatch below 640px, where pressing it opens the
   *  tray: the swatch is a disclosure there and announces itself as one. */
  discloses?: boolean;
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
      // InkProvider plucks this ink's own pitch. See the rule in PageFX.
      data-cue="self"
      style={{ color: `var(--sw-${id})` }}
      aria-pressed={on}
      aria-expanded={discloses}
      aria-label={discloses === false ? `Change the ink, ${label}` : `${label} ink`}
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
      // `toggleSound` confirms itself when it turns sound on, and when it turns
      // sound off there is nothing left to hear. See the rule in PageFX.
      data-cue="self"
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
    // The compass's own box, cached. This was measured on every pointermove,
    // which is a forced layout per mouse event for a box that only moves when
    // the page scrolls or the window resizes.
    let box: DOMRect | null = null;
    const forget = () => {
      box = null;
    };
    const onMove = (e: PointerEvent) => {
      const r = (box ??= el.getBoundingClientRect());
      target = Math.atan2(e.clientX - (r.left + 9), -(e.clientY - (r.top + 9)));
      // Reduced motion means the needle does not travel. It does not mean the
      // needle stops working: it was dead under the preference, pointing north
      // whatever the pointer did, because nothing ever started the loop and the
      // loop bailed anyway. It snaps to the bearing instead, which is the same
      // thing Ruler.tsx does with its active tick.
      if (reduced.current) {
        ang = target;
        g.style.transform = `rotate(${ang}rad)`;
        return;
      }
      if (!raf && !document.hidden) raf = requestAnimationFrame(frame);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", forget, { passive: true });
    window.addEventListener("resize", forget);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", forget);
      window.removeEventListener("resize", forget);
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
      {/* The dial, behind the ring and on the ring's own centre line, so the
          stroke lands exactly on its edge. Transparent until the strip sticks,
          where it takes the strip's ground: the compass straddles the strip's
          bottom edge on purpose, and with nothing behind it the page's own
          prose ran straight through the glass. */}
      <circle className="dial" cx="9" cy="9" r="8" />
      <circle cx="9" cy="9" r="8" fill="none" stroke="currentColor" strokeWidth="1" />
      {/* North on the sheet, which does not move. The needle swings against it,
          which is the whole of what a compass is: a fixed mark and a moving
          one. Without it the ring held a needle that pointed at the reader's
          hand and at nothing else, and there was no north in the north arrow. */}
      <path className="cardinal" d="M9 1.3 L9 2.9" />
      {/* Both halves are filled, and that is the fix rather than a preference.
          
          They have always been the same path mirrored about y=9, but the north
          half was filled and the south half was stroked. A stroke straddles the
          path, so the south half sat half a pixel wider on each side, and at an
          apex this sharp — half-angle about 17 degrees — the miter join runs
          0.5 / sin(17°), call it 1.7px, past the vertex. On an 18px glyph that
          is a needle whose two halves are visibly different lengths, and the
          needle turns to follow the pointer, so the overhang swings around
          where it cannot be missed. Two fills of one geometry are symmetric by
          construction. Weight is carried by the fill instead: the accent on
          north, the same ink as the ring held back on south.
          
          Each half is a kite rather than a triangle, and that is the shape of
          the thing. Both halves used to put their widest edge on the pivot, so
          the needle was fattest in the middle and came to nothing at the ends:
          an hourglass, not a needle. A compass needle is widest about a third
          of the way out and tapers to a point, so the widest edge is at y=7 and
          y=11, four fifths of the way to each tip, and both tips are sharp. The
          halves stay exact mirrors about y=9.
          
          The pivot is outside the needle group. It does not rotate, being on
          the axis, and it caps the seam where the two halves meet. */}
      <g className="needle" ref={needleRef}>
        <path className="tip" d="M9 3.4 L10.85 7 L9 9 L7.15 7 Z" />
        <path className="tail" d="M9 14.6 L10.85 11 L9 9 L7.15 11 Z" />
      </g>
      <circle className="pivot" cx="9" cy="9" r="1" />
    </svg>
  );
}
