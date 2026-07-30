"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { useShortcut } from "@/components/shortcuts/useShortcut";
import { track } from "@/lib/analytics";
import { InkPopover } from "./InkPopover";

const ROUTES = [
  { k: "home", label: "Home", href: "/", key: "h" },
  { k: "writing", label: "Writing", href: "/blog", key: "b" },
] as const;

// The résumé is deliberately not a dock item — it is something you go looking
// for, not somewhere the site sends you. It keeps its `r` shortcut (registered
// below, since there is no link left to hang it on), its footer link, and its
// place in the sitemap.
const HIDDEN_ROUTES = [{ k: "resume", label: "Résumé", href: "/resume", key: "r" }] as const;

// Present only on the home route, where they scroll rather than navigate.
const ANCHORS = [
  { k: "work", label: "Work", hash: "#work", key: "w" },
  { k: "about", label: "About", hash: "#about", key: "a" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function Dock() {
  const pathname = usePathname();
  const onHome = pathname === "/";
  const barRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [ready, setReady] = useState(false);

  // The ink block behind the active item is measured rather than styled per
  // link, so it can travel to any item's exact box. Nothing else in the dock
  // moves — the type stays perfectly still underneath it.
  const place = useCallback(() => {
    const bar = barRef.current;
    const el = activeRef.current;
    if (!bar) return;
    if (!el) {
      setReady(false);
      return;
    }
    const b = bar.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    // getBoundingClientRect measures the BORDER box, but an absolutely
    // positioned child is offset from the PADDING box. Without subtracting the
    // bar's 2px border the block lands 2px low and 2px right of the item it is
    // supposed to be sitting under.
    bar.style.setProperty("--x", `${Math.round(r.left - b.left - bar.clientLeft)}px`);
    bar.style.setProperty("--y", `${Math.round(r.top - b.top - bar.clientTop)}px`);
    bar.style.setProperty("--sx", `${Math.round(r.width)}`);
    bar.style.setProperty("--h", `${Math.round(r.height)}px`);
    // Flip `ready` a frame late. The block has no transition while it is false,
    // so the first placement lands instantly; enabling the transition only
    // afterwards keeps it from wiping in from zero width on load. Motion here
    // is for moving between items, not for arriving.
    requestAnimationFrame(() => setReady(true));
  }, []);

  useLayoutEffect(place, [place, pathname, onHome]);

  useEffect(() => {
    const onResize = () => place();
    window.addEventListener("resize", onResize);
    // Fonts landing changes the label widths, so re-measure once they do.
    document.fonts?.ready.then(place).catch(() => {});
    return () => window.removeEventListener("resize", onResize);
  }, [place]);

  return (
    <nav className="dock" aria-label="Site">
      <div ref={barRef} className="dock-in" data-ready={ready}>
        <span className="dock-ind" aria-hidden="true" />
        {/* Home, then the two in-page jumps it owns, then the other routes —
            reading order down the page, not routes-then-anchors. */}
        {ROUTES.map((it, i) => {
          const active = isActive(pathname, it.href);
          return (
            <Fragment key={it.k}>
              <RouteLink item={it} active={active} linkRef={active ? activeRef : undefined} />
              {i === 0 && onHome && ANCHORS.map((a) => <AnchorLink key={a.k} item={a} />)}
            </Fragment>
          );
        })}
        {HIDDEN_ROUTES.map((it) => (
          <HiddenRouteShortcut key={it.k} item={it} />
        ))}
        <span className="dock-sep" aria-hidden="true" />
        <InkPopover />
        <SoundToggle />
      </div>
    </nav>
  );
}

/**
 * A route that answers to its key but draws nothing. The hint layer floats over
 * an element and there is none here, so the key is discoverable through the `?`
 * help sheet rather than through Shift-hold.
 */
function HiddenRouteShortcut({ item }: { item: (typeof HIDDEN_ROUTES)[number] }) {
  const router = useRouter();
  useShortcut({
    id: `nav.${item.k}`,
    keys: [item.key],
    label: item.label,
    group: "Navigate",
    run: () => router.push(item.href),
  });
  return null;
}

function RouteLink({
  item,
  active,
  linkRef,
}: {
  item: (typeof ROUTES)[number];
  active: boolean;
  linkRef?: React.RefObject<HTMLAnchorElement | null>;
}) {
  const fx = useFX();
  const router = useRouter();
  const shortcutRef = useShortcut<HTMLAnchorElement>({
    id: `nav.${item.k}`,
    keys: [item.key],
    label: item.label,
    group: "Navigate",
    run: () => router.push(item.href),
  });
  return (
    <Link
      ref={(el) => {
        shortcutRef.current = el;
        if (linkRef) linkRef.current = el;
      }}
      href={item.href}
      className="dock-link"
      data-analytics={`nav:dock.${item.k}`}
      aria-current={active ? "page" : undefined}
      onClick={() => {
        fx?.nav();
        fx?.haptic(6);
      }}
    >
      {item.label}
    </Link>
  );
}

function AnchorLink({ item }: { item: (typeof ANCHORS)[number] }) {
  const fx = useFX();
  const go = useCallback(() => {
    const el = document.querySelector(item.hash);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    history.replaceState(null, "", item.hash);
  }, [item.hash]);

  const shortcutRef = useShortcut<HTMLAnchorElement>({
    id: `jump.${item.k}`,
    keys: [item.key],
    label: item.label,
    group: "Navigate",
    run: go,
  });

  return (
    <a
      ref={shortcutRef}
      href={item.hash}
      className="dock-link"
      data-anchor="true"
      data-analytics={`nav:dock.${item.k}`}
      onClick={(e) => {
        e.preventDefault();
        fx?.nav();
        fx?.haptic(6);
        go();
      }}
    >
      {item.label}
    </a>
  );
}

/**
 * The mute state used to be typed: `♪` and `♪` + U+0336 COMBINING LONG STROKE
 * OVERLAY. Android's system fonts carry the note but not that mark on it, so
 * Chrome on a phone drew a note plus a tofu box — and where the combining mark
 * *did* resolve it landed on the wrong side of the glyph. Drawn instead, so the
 * two states are the same shape under every font stack.
 *
 * The mark itself is state-independent — the mute cut is driven from the
 * button's own `aria-pressed`, in CSS, so this renders identically on the
 * server and the client and needs no hydration escape hatch.
 */
function NoteIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {/* Both stems and the beam are one unbroken stroke — drawn as three
          elements they meet at a corner the rasteriser seams at icon size.
          The 16-unit box is rendered at 16px so a unit is a pixel: the stems
          sit on x=6 and x=13, which puts a 2-wide stroke on whole pixels. */}
      <path d="M6 12V4l7-2v8" />
      {/* Each head is centred 1.8 left of its stem, not 2.3 — the stem has to
          end *inside* the disc. Landing it on the tangent leaves a hairline of
          paper between the two at 16px, which is the gap that was showing. */}
      <circle cx="4.2" cy="12.3" r="2.3" fill="currentColor" stroke="none" />
      <circle cx="11.2" cy="10.3" r="2.3" fill="currentColor" stroke="none" />
      {/* The cut is always in the DOM and retracted by `stroke-dashoffset`
          rather than mounted on demand — a stroke that is drawn on has to have
          something to draw. It is painted in the dock's own ground first, so it
          reads as a cut through the note rather than another stroke crossing
          it, and both copies carry the same dash so the gap opens ahead of the
          ink instead of appearing under it.
          `pathLength="1"` normalises the dash to the path, so the CSS is 0 and
          1 rather than a magic 15.56. */}
      <path
        className="dock-note-cut"
        d="M2.5 13.5L13.5 2.5"
        pathLength="1"
        stroke="var(--paper)"
        strokeWidth="3.2"
      />
      <path className="dock-note-cut" d="M2.5 13.5L13.5 2.5" pathLength="1" />
    </svg>
  );
}

function SoundToggle() {
  const fx = useFX();
  const [mounted, setMounted] = useState(false);
  // `ready` is deliberately a second flag rather than a reuse of `mounted`. The
  // commit that reveals a muted reader's real state is the same one that would
  // turn the transition on, so a single flag never actually suppresses
  // anything — the cut would draw itself in on every load. Enabling motion a
  // frame later is the same trick the sliding indicator above uses.
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setMounted(true);
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, []);

  const ref = useShortcut<HTMLButtonElement>({
    id: "sound.toggle",
    keys: ["m"],
    label: "Mute / unmute",
    group: "Sound",
    run: () => {
      fx?.toggle();
      fx?.haptic(6);
      fx?.toggleSound();
    },
    silent: true,
  });

  if (!fx) return null;
  // Sound state is read from localStorage in FXProvider's useState initializer,
  // which differs from the server-rendered default — hold the default until
  // mount so hydration matches.
  const soundOn = mounted ? fx.soundOn : true;
  return (
    <button
      ref={ref}
      type="button"
      className="dock-btn"
      data-ready={ready}
      aria-pressed={soundOn}
      aria-label={soundOn ? "Mute interface sounds" : "Enable interface sounds"}
      onClick={() => {
        fx.toggle();
        fx.haptic(6);
        fx.toggleSound();
        track({ name: "sound", on: !soundOn });
      }}
      suppressHydrationWarning
    >
      <NoteIcon />
    </button>
  );
}
