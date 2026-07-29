"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { useInk } from "@/components/providers/InkProvider";
import { useFX } from "@/components/providers/FXProvider";
import { useShortcut } from "@/components/shortcuts/useShortcut";
import { useShortcutRegistry } from "@/components/shortcuts/ShortcutProvider";
import { useMounted } from "./useMounted";
import { MODES, MODE_LABEL, type InkId, type Mode } from "@/lib/ink";

const POPOVER_ID = "ink-pop";

// The popover API surface — still missing from the TS lib in some configs.
type PopoverMethods = {
  showPopover?: () => void;
  hidePopover?: () => void;
  togglePopover?: () => void;
};

/**
 * Paper, ink and press run, in one panel above the dock.
 *
 * Theme is the only control here that goes through a view transition: the iris
 * radiates from the button you actually pressed. Ink and press run are colour-
 * token interpolations instead (340ms, in oklch), which is why they read as the
 * page re-inking rather than a new page arriving.
 */
export function InkPopover() {
  const fx = useFX();
  const reg = useShortcutRegistry();
  const { toggle } = useTheme();
  const { ink, mode, setInk, setMode, cycleMode, inks } = useInk();
  const popRef = useRef<HTMLDivElement | null>(null);
  const triggerInnerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  // Anchor the panel to the dock's centre rather than to the trigger, so it
  // opens symmetrically over the bar on wide viewports; the tail still tracks
  // the trigger so the connection between what you clicked and what appeared
  // still reads.
  //
  // Centring on the dock is only a preference, though, and it has to yield. The
  // dock is wider on the home route — it carries the Work and Off-screen jumps
  // there — and once it is wider than the panel, centring pushes the panel far
  // enough left that the trigger falls outside it entirely. The tail then clamps
  // to the panel's own edge and points at whatever happens to be under it, which
  // is how it ended up aimed at Résumé. So: centre on the dock, but only within
  // the range that keeps the trigger inside the panel, and only then clamp to
  // the viewport.
  const position = useCallback(() => {
    const trigger = triggerInnerRef.current;
    const pop = popRef.current;
    if (!trigger || !pop) return;
    const tr = trigger.getBoundingClientRect();
    const dock = trigger.closest(".dock-in") as HTMLElement | null;
    const dr = dock?.getBoundingClientRect();
    const triggerX = tr.left + tr.width / 2;
    const anchorX = dr ? dr.left + dr.width / 2 : triggerX;
    const popWidth = pop.offsetWidth || 320;
    const margin = 12;
    // The tail needs this much panel either side of it to read as a tail rather
    // than a notch in the corner — the same inset the arrow clamp uses.
    const inset = 22;
    const clamp = (lo: number, hi: number, v: number) => Math.max(lo, Math.min(hi, v));
    let left = anchorX - popWidth / 2;
    left = clamp(triggerX - popWidth + inset, triggerX - inset, left);
    left = clamp(margin, Math.max(margin, window.innerWidth - popWidth - margin), left);
    const arrowX = clamp(inset, popWidth - inset, triggerX - left);
    pop.style.setProperty("--pal-left", `${Math.round(left)}px`);
    pop.style.setProperty("--pal-arrow-x", `${Math.round(arrowX)}px`);
    if (dr)
      pop.style.setProperty("--pal-bottom", `${Math.round(window.innerHeight - dr.top + 12)}px`);
  }, []);

  // Keep React state in step with the native toggle event. While a recolor
  // view transition is running, the ::view-transition pseudo-element sits above
  // the popover in the top layer and swallows pointer events — native
  // light-dismiss reads that as an outside click and closes the panel
  // mid-transition. `beforetoggle` is non-cancelable on hide, so let the close
  // happen and immediately re-open.
  useEffect(() => {
    const el = popRef.current as (HTMLDivElement & PopoverMethods) | null;
    if (!el) return;
    const onToggle = (e: Event) => {
      const isOpen = (e as ToggleEvent).newState === "open";
      if (!isOpen && document.documentElement.classList.contains("vt-recolor")) {
        el.showPopover?.();
        return;
      }
      setOpen(isOpen);
      if (isOpen) {
        position();
        // Native popovers don't move focus; hand it to the first control so
        // keyboard users land inside the panel they just opened.
        el.querySelector<HTMLElement>("button")?.focus();
      } else if (el.contains(document.activeElement)) {
        triggerInnerRef.current?.focus();
      }
    };
    el.addEventListener("toggle", onToggle as EventListener);
    return () => el.removeEventListener("toggle", onToggle as EventListener);
  }, [position]);

  useEffect(() => {
    if (!open) return;
    const onMove = () => position();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    // The dock resizes without the window doing anything: it grows the Work and
    // Off-screen jumps on the home route and drops them elsewhere, and the
    // labels settle again when the fonts land. Both move the trigger out from
    // under the tail, so watch the bar itself rather than only the viewport.
    const dock = triggerInnerRef.current?.closest(".dock-in");
    const ro = dock ? new ResizeObserver(onMove) : null;
    if (dock && ro) ro.observe(dock);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
      ro?.disconnect();
    };
  }, [open, position]);

  useLayoutEffect(position, [position]);

  // Two top-layer overlays shouldn't fight: opening the keyboard help closes
  // this panel.
  useEffect(() => {
    if (reg.helpOpen && open) {
      (popRef.current as (HTMLDivElement & PopoverMethods) | null)?.hidePopover?.();
    }
  }, [reg.helpOpen, open]);

  const togglePanel = useCallback(() => {
    const el = popRef.current as (HTMLDivElement & PopoverMethods) | null;
    if (!el) return;
    if (typeof el.togglePopover === "function") el.togglePopover();
    else if (open) el.hidePopover?.();
    else el.showPopover?.();
  }, [open]);

  const triggerShortcut = useShortcut<HTMLButtonElement>({
    id: "ink.popover",
    // Static label — a dynamic one would re-register the shortcut (and bump
    // every registry subscriber) on each open/close.
    label: "Paper & ink",
    keys: ["c"],
    group: "Appearance",
    hint: "c",
    silent: true,
    run: () => {
      fx?.click(440, 0.05, "sine");
      fx?.haptic(6);
      togglePanel();
    },
  });

  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerInnerRef.current = node;
      triggerShortcut.current = node;
    },
    [triggerShortcut],
  );

  return (
    <>
      <button
        ref={setTriggerRef}
        type="button"
        className="dock-pal"
        popoverTarget={POPOVER_ID}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={POPOVER_ID}
        aria-label={open ? "Close paper and ink settings" : "Paper and ink settings"}
        onClick={() => {
          fx?.click(440, 0.05, "sine");
          fx?.haptic(6);
        }}
      >
        <span className="dock-pal-eye" aria-hidden="true" />
      </button>

      <div
        ref={popRef}
        id={POPOVER_ID}
        className="pal"
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- non-modal popover; a native <dialog> would trap focus and block light-dismiss
        role="dialog"
        aria-label="Paper and ink"
        popover="auto"
      >
        <PaperSeg toggle={toggle} />

        <fieldset className="pal-field">
          <legend className="pal-label">Ink</legend>
          <div className="ink-row">
            {inks.map((i, n) => (
              <InkSwatch
                key={i.id}
                id={i.id as InkId}
                label={i.label}
                n={n + 1}
                on={ink === i.id}
                pick={setInk}
              />
            ))}
          </div>
        </fieldset>

        <PressRunSeg mode={mode} setMode={setMode} cycleMode={cycleMode} />

        <p className="pal-note">
          The name on the home page is printed twice, the second pass slightly off — the way a press
          looks when the plates don&apos;t line up. Move your cursor across it to shift the offset.
        </p>
      </div>
    </>
  );
}

function PaperSeg({ toggle }: { toggle: (origin?: { x: number; y: number } | null) => void }) {
  const { theme } = useTheme();
  const fx = useFX();
  // The server can't know the theme, so hold the pressed state back for one
  // render rather than hydrating a wrong attribute React won't patch.
  const mounted = useMounted();
  const wrapRef = useShortcut<HTMLFieldSetElement>({
    id: "theme.toggle",
    keys: ["t"],
    label: "Toggle paper",
    group: "Appearance",
    hint: "t",
    run: () => {
      fx?.toggle();
      fx?.haptic(8);
      // No origin from the keyboard — the iris falls back to a plain crossfade,
      // which is the right read when nothing was pointed at.
      toggle(null);
    },
  });

  // Feed the iris the pressed button's own centre, so the wipe starts exactly
  // where the finger landed.
  const set = (next: "light" | "dark") => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (theme === next) return;
    const r = e.currentTarget.getBoundingClientRect();
    fx?.toggle();
    fx?.haptic(8);
    toggle({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
  };

  return (
    <>
      <fieldset ref={wrapRef} className="pal-field">
        <legend className="pal-label">Paper</legend>
        <div className="seg">
          <button
            type="button"
            className="seg-btn"
            aria-pressed={mounted ? theme === "light" : undefined}
            onClick={set("light")}
          >
            Day
          </button>
          <button
            type="button"
            className="seg-btn"
            aria-pressed={mounted ? theme === "dark" : undefined}
            onClick={set("dark")}
          >
            Night
          </button>
        </div>
      </fieldset>
    </>
  );
}

function InkSwatch({
  id,
  label,
  n,
  on,
  pick,
}: {
  id: InkId;
  label: string;
  n: number;
  on: boolean;
  pick: (id: InkId) => void;
}) {
  const ref = useShortcut<HTMLButtonElement>({
    id: `ink.${id}`,
    keys: [String(n)],
    label,
    group: "Appearance",
    hint: String(n),
    run: () => pick(id),
  });
  return (
    <button
      ref={ref}
      type="button"
      className="ink-btn"
      data-ink-id={id}
      aria-label={label}
      aria-pressed={on}
      onClick={() => pick(id)}
    />
  );
}

function PressRunSeg({
  mode,
  setMode,
  cycleMode,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  cycleMode: () => void;
}) {
  const wrapRef = useShortcut<HTMLFieldSetElement>({
    id: "ink.mode",
    keys: ["0"],
    label: "Cycle press run",
    group: "Appearance",
    hint: "0",
    run: cycleMode,
  });
  return (
    <>
      <fieldset ref={wrapRef} className="pal-field">
        <legend className="pal-label">Press run</legend>
        <div className="seg">
          {MODES.map((m) => (
            <button
              key={m}
              type="button"
              className="seg-btn"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {MODE_LABEL[m]}
            </button>
          ))}
        </div>
      </fieldset>
    </>
  );
}
