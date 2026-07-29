"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { useShortcut } from "@/components/shortcuts/useShortcut";
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

function SoundToggle() {
  const fx = useFX();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
      aria-pressed={soundOn}
      aria-label={soundOn ? "Mute interface sounds" : "Enable interface sounds"}
      onClick={() => {
        fx.toggle();
        fx.haptic(6);
        fx.toggleSound();
      }}
      suppressHydrationWarning
    >
      <span aria-hidden="true" suppressHydrationWarning>
        {soundOn ? "♪" : "♪̶"}
      </span>
    </button>
  );
}
