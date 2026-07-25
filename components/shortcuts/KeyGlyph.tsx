"use client";
import { type CSSProperties } from "react";

type Variant = "letter" | "mod" | "glyph";
type Size = "sm" | "md";

const SPECIAL_LABEL: Record<string, string> = {
  shift: "Shift",
  meta: "⌘",
  cmd: "⌘",
  ctrl: "⌃",
  alt: "⌥",
  enter: "↵",
  return: "↵",
  escape: "Esc",
  esc: "Esc",
  arrowup: "↑",
  arrowdown: "↓",
  arrowleft: "←",
  arrowright: "→",
  space: "Space",
  tab: "Tab",
};

// Spoken names for the symbol glyphs — a screen reader can't read "⌘" or "↵".
const SPOKEN_LABEL: Record<string, string> = {
  meta: "Command",
  cmd: "Command",
  ctrl: "Control",
  alt: "Option",
  enter: "Enter",
  return: "Enter",
  escape: "Escape",
  esc: "Escape",
  arrowup: "Arrow up",
  arrowdown: "Arrow down",
  arrowleft: "Arrow left",
  arrowright: "Arrow right",
};

export function KeyGlyph({
  k,
  variant,
  size = "sm",
  style,
  spoken = false,
}: {
  k: string;
  variant?: Variant;
  size?: Size;
  style?: CSSProperties;
  /**
   * Decorative contexts (HintLayer) keep the default aria-hidden glyph; the
   * help dialog passes `spoken` so assistive tech hears the key name.
   */
  spoken?: boolean;
}) {
  const lower = k.toLowerCase();
  const display = SPECIAL_LABEL[lower] ?? (k.length === 1 ? k.toUpperCase() : k);
  const v: Variant =
    variant ?? (SPECIAL_LABEL[lower] ? (lower === "shift" ? "mod" : "glyph") : "letter");
  const cls = `kglyph kglyph--${size} kglyph--${v}`;
  if (!spoken) {
    return (
      <kbd className={cls} style={style} aria-hidden="true">
        {display}
      </kbd>
    );
  }
  const spokenText = SPOKEN_LABEL[lower] ?? display;
  return (
    <kbd className={cls} style={style}>
      <span aria-hidden="true">{display}</span>
      <span className="sr-only">{spokenText}</span>
    </kbd>
  );
}
