"use client";
import { useEffect, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useAccent, type Mode } from "@/components/providers/AccentProvider";
import { Icon } from "@/components/primitives/Icon";
import { useShortcut } from "@/components/shortcuts/useShortcut";
import { ACCENTS, type AccentDef, type AccentId, type RecolorOrigin } from "@/lib/accents";

const HUES = ACCENTS.filter((a) => a.kind === "hue");

// ARIA radio-group keyboard pattern, shared by the three groups in the panel:
// arrows move focus AND select (selection follows focus), Home/End jump.
// Attached to the radiogroup container; radios carry roving tabindex.
function radioNav(e: React.KeyboardEvent<HTMLElement>) {
  const handled = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"];
  if (!handled.includes(e.key)) return;
  const radios = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="radio"]'));
  if (radios.length === 0) return;
  e.preventDefault();
  const focused = radios.indexOf(document.activeElement as HTMLElement);
  const checked = radios.findIndex((r) => r.getAttribute("aria-checked") === "true");
  const base = focused !== -1 ? focused : checked !== -1 ? checked : 0;
  let next: number;
  if (e.key === "Home") next = 0;
  else if (e.key === "End") next = radios.length - 1;
  else {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    next = (base + dir + radios.length) % radios.length;
  }
  radios[next].focus();
  radios[next].click();
}

export function AccentPanel() {
  const { accent, mode, isPure, setAccent } = useAccent();
  const active = ACCENTS.find((x) => x.id === accent) ?? ACCENTS[0];
  const hueActiveIndex = HUES.findIndex((a) => a.id === accent);
  return (
    <div
      className="accent-strip accent-strip--panel"
      data-pure-active={isPure ? "true" : "false"}
      data-mode={mode}
    >
      <ThemeSegment />
      <span className="as-divider" aria-hidden="true" />
      <span className="as-label">accent</span>
      <div
        className="as-chips"
        role="radiogroup"
        aria-label="Accent hue"
        tabIndex={-1}
        onKeyDown={radioNav}
      >
        {HUES.map((a, i) => (
          <AccentChip
            key={a.id}
            accent={a}
            shortcut={String(i + 1)}
            active={accent === a.id}
            // Roving tabindex needs exactly one tab stop; when a pure accent
            // is active none of the six hues is checked, so the first chip
            // becomes the group's entry point.
            tabbable={accent === a.id || (hueActiveIndex === -1 && i === 0)}
            dim={mode === "plain"}
            onPick={(id, origin) => setAccent(id, origin)}
          />
        ))}
      </div>
      <span className="as-divider" aria-hidden="true" />
      <ModeToggle />
      <span className="as-sr-status" aria-live="polite">
        {active.label} — {mode}
      </span>
    </div>
  );
}

function originFromEvent(e: React.MouseEvent): RecolorOrigin {
  const t = e.currentTarget as HTMLElement;
  const r = t.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function originFromElement(el: HTMLElement | null): RecolorOrigin {
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

function viewportCenter(): RecolorOrigin {
  if (typeof window === "undefined") return null;
  return { x: window.innerWidth / 2, y: window.innerHeight / 2 };
}

function ThemeSegment() {
  const { theme, toggle } = useTheme();
  const fx = useFX();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const isDark = mounted && theme === "dark";

  const wrapRef = useShortcut<HTMLDivElement>({
    id: "theme.toggle",
    keys: ["t"],
    label: "Toggle theme",
    group: "Theme",
    hint: "t",
    silent: true,
    run: () => {
      fx?.toggle();
      fx?.haptic(6);
      const next = wrapRef.current?.querySelector(
        ".as-theme-seg:not(.is-active)",
      ) as HTMLElement | null;
      const origin = originFromElement(next ?? wrapRef.current) ?? viewportCenter();
      toggle(origin);
    },
  });

  function pickClick(targetDark: boolean, e: React.MouseEvent) {
    if (targetDark === isDark) return;
    fx?.toggle();
    fx?.haptic(6);
    toggle(originFromEvent(e));
  }

  return (
    <div
      ref={wrapRef}
      className="as-theme"
      role="radiogroup"
      aria-label="Theme"
      tabIndex={-1}
      onKeyDown={radioNav}
    >
      <button
        type="button"
        className={`as-theme-seg ${!isDark ? "is-active" : ""}`}
        aria-checked={!isDark}
        tabIndex={!isDark ? 0 : -1}
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA radiogroup pattern on styled buttons (roving focus)
        role="radio"
        aria-label="Light theme"
        aria-keyshortcuts="t"
        onClick={(e) => pickClick(false, e)}
        suppressHydrationWarning
      >
        <Icon name="sun" size={13} />
      </button>
      <button
        type="button"
        className={`as-theme-seg ${isDark ? "is-active" : ""}`}
        aria-checked={isDark}
        tabIndex={isDark ? 0 : -1}
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA radiogroup pattern on styled buttons (roving focus)
        role="radio"
        aria-label="Dark theme"
        aria-keyshortcuts="t"
        onClick={(e) => pickClick(true, e)}
        suppressHydrationWarning
      >
        <Icon name="moon" size={13} />
      </button>
    </div>
  );
}

function AccentChip({
  accent,
  shortcut,
  active,
  tabbable,
  dim,
  onPick,
}: {
  accent: AccentDef;
  shortcut: string;
  active: boolean;
  tabbable: boolean;
  dim: boolean;
  onPick: (id: AccentId, origin: RecolorOrigin) => void;
}) {
  const fx = useFX();
  const ref = useShortcut<HTMLButtonElement>({
    id: `accent.${accent.id}`,
    keys: [shortcut],
    label: accent.label,
    group: "Accent",
    hint: shortcut,
    silent: true,
    run: () => {
      onPick(accent.id, originFromElement(ref.current));
      fx?.click(accent.freq, 0.05, "sine");
      fx?.haptic(6);
    },
  });
  return (
    <button
      ref={ref}
      type="button"
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA radiogroup pattern on styled buttons (roving focus)
      role="radio"
      aria-checked={active}
      tabIndex={tabbable ? 0 : -1}
      className={`as-chip ${active ? "is-active" : ""} ${dim ? "is-dim" : ""}`}
      data-color={accent.id}
      onClick={(e) => {
        onPick(accent.id, originFromEvent(e));
        fx?.click(accent.freq, 0.05, "sine");
        fx?.haptic(6);
      }}
      aria-label={accent.label}
      aria-keyshortcuts={shortcut}
      title={accent.label}
    >
      <span className="as-chip-name" aria-hidden="true">
        {accent.label}
      </span>
    </button>
  );
}

function ModeToggle() {
  const { mode, setMode, cycleMode } = useAccent();
  const fx = useFX();
  const wrapRef = useShortcut<HTMLDivElement>({
    id: "accent.mode",
    keys: ["0"],
    label: "cycle mode",
    group: "Accent",
    hint: "0",
    silent: true,
    run: () => {
      // Keyboard origin: radiate from whichever segment is "next" in the cycle.
      const seq: Mode[] = ["colorful", "mono", "plain"];
      const cur = seq.indexOf(mode);
      const nextMode = seq[(cur + 1) % seq.length];
      const nextEl = wrapRef.current?.querySelector(
        `.as-mode-seg--${nextMode}`,
      ) as HTMLElement | null;
      cycleMode(originFromElement(nextEl ?? wrapRef.current));
      fx?.click(440, 0.05, "sine");
      fx?.haptic(8);
    },
  });

  function pick(next: Mode, e: React.MouseEvent) {
    if (next === mode) return;
    setMode(next, originFromEvent(e));
    const freq = next === "plain" ? 196 : next === "mono" ? 261.63 : 523.25;
    fx?.click(freq, 0.06, "sine");
    fx?.haptic(8);
  }
  return (
    <div
      ref={wrapRef}
      className="as-mode"
      role="radiogroup"
      aria-label="Color mode"
      tabIndex={-1}
      onKeyDown={radioNav}
    >
      <ModeSeg
        kind="colorful"
        active={mode === "colorful"}
        onPick={(e) => pick("colorful", e)}
        title="six accents across the page"
        aria="colorful — six accents across the page"
      >
        <span>colorful</span>
        <span className="as-mode-icons" aria-hidden="true">
          {HUES.map((a) => (
            <i key={a.id} style={{ ["--c" as string]: a.c } as React.CSSProperties} />
          ))}
        </span>
      </ModeSeg>
      <ModeSeg
        kind="mono"
        active={mode === "mono"}
        onPick={(e) => pick("mono", e)}
        title="every accent becomes the chosen color"
        aria="mono — every accent becomes the chosen color"
      >
        <span>mono</span>
        <span className="as-mode-icons" aria-hidden="true">
          <i />
        </span>
      </ModeSeg>
      <ModeSeg
        kind="plain"
        active={mode === "plain"}
        onPick={(e) => pick("plain", e)}
        title="no accent — pure paper or ink based on theme"
        aria="plain — no accent, monochrome paper or ink"
      >
        <span>plain</span>
        <span className="as-mode-icons" aria-hidden="true">
          <i />
        </span>
      </ModeSeg>
    </div>
  );
}

function ModeSeg({
  kind,
  active,
  onPick,
  title,
  aria,
  children,
}: {
  kind: "colorful" | "mono" | "plain";
  active: boolean;
  onPick: (e: React.MouseEvent) => void;
  title: string;
  aria: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className={`as-mode-seg as-mode-seg--${kind} ${active ? "is-active" : ""}`}
      // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA radiogroup pattern on styled buttons (roving focus)
      role="radio"
      aria-checked={active}
      tabIndex={active ? 0 : -1}
      aria-label={aria}
      aria-keyshortcuts="0"
      onClick={onPick}
      title={title}
    >
      {children}
    </button>
  );
}
