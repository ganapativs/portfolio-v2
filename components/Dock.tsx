"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";

import { Icon } from "@/components/primitives/Icon";
import { useShortcut } from "@/components/shortcuts/useShortcut";
import { AccentPopover } from "@/components/accent/AccentPopover";

// This dock belongs to the retired design and is mounted only by
// app/old/layout.tsx, so every destination is inside the archive. The live
// site's dock is components/press/Dock.tsx.
const items = [
  { k: "home", l: "home", i: "home", href: "/old/home", key: "h" },
  { k: "about", l: "about", i: "user", href: "/old/about", key: "a" },
  { k: "work", l: "work", i: "folder", href: "/old/work", key: "w" },
  { k: "writing", l: "writing", i: "pen", href: "/old/blog", key: "b" },
] as const;

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function Dock() {
  const pathname = usePathname();
  return (
    <nav className="dock" aria-label="Site navigation">
      {items.map((it) => (
        <DockNavItem key={it.k} item={it} active={isActive(pathname, it.href)} />
      ))}
      <div className="dock-divider" aria-hidden="true" />
      <AccentPopover />
      <SoundToggle />
    </nav>
  );
}

function DockNavItem({ item, active }: { item: (typeof items)[number]; active: boolean }) {
  const fx = useFX();
  const router = useRouter();
  const ref = useShortcut<HTMLAnchorElement>({
    id: `nav.${item.k}`,
    keys: [item.key],
    label: item.l.charAt(0).toUpperCase() + item.l.slice(1),
    group: "Navigate",
    run: () => {
      router.push(item.href);
    },
  });
  return (
    <Link
      ref={ref}
      href={item.href}
      aria-label={item.l}
      className={`dock-item ${active ? "is-active" : ""}`}
      onClick={() => {
        fx?.nav();
        fx?.haptic(6);
      }}
    >
      <Icon name={item.i} size={15} />
      <span className="label">{item.l}</span>
    </Link>
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
  // Same pattern: sound state is read from localStorage in FXProvider's useState
  // initializer, which differs from the server "true" default.
  const soundOn = mounted ? fx.soundOn : true;
  return (
    <button
      ref={ref}
      type="button"
      className="dock-item icon-only"
      onClick={() => {
        fx.toggle();
        fx.haptic(6);
        fx.toggleSound();
      }}
      aria-label={soundOn ? "Mute sound effects" : "Enable sound effects"}
      suppressHydrationWarning
    >
      <span suppressHydrationWarning>
        <Icon name={soundOn ? "sound" : "mute"} size={15} />
      </span>
    </button>
  );
}
