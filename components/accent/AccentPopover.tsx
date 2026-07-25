"use client";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Icon } from "@/components/primitives/Icon";
import { useFX } from "@/components/providers/FXProvider";
import { useShortcut } from "@/components/shortcuts/useShortcut";
import { useShortcutRegistry } from "@/components/shortcuts/ShortcutProvider";
import { AccentPanel } from "@/components/accent/AccentPanel";

const POPOVER_ID = "accent-pop";

// Augment the popover API surface (TS lib still missing it in some configs).
type PopoverMethods = {
  showPopover?: () => void;
  hidePopover?: () => void;
  togglePopover?: () => void;
};

export function AccentPopover() {
  const fx = useFX();
  const reg = useShortcutRegistry();
  const popRef = useRef<HTMLDivElement | null>(null);
  const triggerInnerRef = useRef<HTMLButtonElement | null>(null);
  const [open, setOpen] = useState(false);

  // Anchor the popover horizontally to the dock's centre so it opens
  // symmetrically over the navbar — much steadier visual than chasing the
  // rightmost trigger button (which made the panel hang off-center on wide
  // viewports). The arrow still tracks the trigger so the connection between
  // click target and panel reads correctly. Falls back to the trigger's own
  // centroid if the dock isn't found.
  const positionToTrigger = useCallback(() => {
    const trigger = triggerInnerRef.current;
    const pop = popRef.current;
    if (!trigger || !pop) return;
    const triggerRect = trigger.getBoundingClientRect();
    const dockEl = trigger.closest(".dock") as HTMLElement | null;
    const dockRect = dockEl?.getBoundingClientRect();
    const anchorCenterX = dockRect
      ? dockRect.left + dockRect.width / 2
      : triggerRect.left + triggerRect.width / 2;
    const triggerCenterX = triggerRect.left + triggerRect.width / 2;
    const vw = window.innerWidth;
    const popWidth = pop.offsetWidth || 360;
    const margin = 12;
    // Centre the popover over the dock, then clamp so it never bleeds past
    // either viewport edge.
    const idealLeft = anchorCenterX - popWidth / 2;
    const maxLeft = vw - popWidth - margin;
    const leftPx = Math.max(margin, Math.min(maxLeft, idealLeft));
    // Arrow points at the trigger button's centroid relative to the popover's
    // (possibly clamped) left edge, kept inside the rounded corners.
    const arrowX = Math.max(20, Math.min(popWidth - 20, triggerCenterX - leftPx));
    pop.style.setProperty("--accent-pop-left", `${leftPx}px`);
    pop.style.setProperty("--accent-pop-arrow-x", `${arrowX}px`);
  }, []);

  // Keep React state in sync with the native popover toggle event so the
  // trigger button can show its `aria-expanded` state. While a recolor view
  // transition is in flight, the ::view-transition pseudo-element sits above
  // the popover in the top layer and swallows pointer events; native
  // light-dismiss reads that as an outside click and closes the popover. The
  // beforetoggle event is non-cancelable on hide, so we let the close happen
  // and immediately re-open via showPopover().
  useEffect(() => {
    const el = popRef.current as (HTMLDivElement & PopoverMethods) | null;
    if (!el) return;
    const onToggle = (e: Event) => {
      const ev = e as ToggleEvent;
      const isOpen = ev.newState === "open";
      if (!isOpen && document.documentElement.classList.contains("vt-recolor")) {
        el.showPopover?.();
        return;
      }
      setOpen(isOpen);
      if (isOpen) {
        positionToTrigger();
        // Move focus to the panel's current tab stop so keyboard users land
        // inside the dialog they just opened (native popovers don't do this).
        // Synchronous on purpose — the toggle event fires after the popover
        // is open, and a rAF here would stall in background tabs.
        el.querySelector<HTMLElement>('[role="radio"][tabindex="0"]')?.focus();
      } else if (el.contains(document.activeElement)) {
        // Closing (Esc / light-dismiss / toggle) with focus inside the panel:
        // hand focus back to the trigger instead of dropping it to <body>.
        triggerInnerRef.current?.focus();
      }
    };
    el.addEventListener("toggle", onToggle as EventListener);
    return () => el.removeEventListener("toggle", onToggle as EventListener);
  }, [positionToTrigger]);

  // Reposition on viewport changes while open.
  useEffect(() => {
    if (!open) return;
    const onResize = () => positionToTrigger();
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, positionToTrigger]);

  // Initial measurement after first paint so the arrow is correct on first open.
  useLayoutEffect(() => {
    positionToTrigger();
  }, [positionToTrigger]);

  // When the keyboard help dialog opens (Shift+? or `?`), close this popover
  // so the two top-layer overlays don't fight for attention.
  useEffect(() => {
    if (reg.helpOpen && open) {
      const el = popRef.current as (HTMLDivElement & PopoverMethods) | null;
      el?.hidePopover?.();
    }
  }, [reg.helpOpen, open]);

  function toggle() {
    const el = popRef.current as (HTMLDivElement & PopoverMethods) | null;
    if (!el) return;
    if (typeof el.togglePopover === "function") {
      el.togglePopover();
    } else if (open) {
      el.hidePopover?.();
    } else {
      el.showPopover?.();
    }
  }

  const triggerRef = useShortcut<HTMLButtonElement>({
    id: "accent.popover",
    // Static label — a dynamic one re-registers the shortcut (and bumps every
    // registry subscriber) on each open/close toggle.
    label: "Appearance panel",
    keys: ["c"],
    group: "Accent",
    hint: "c",
    silent: true,
    run: () => {
      fx?.click(440, 0.05, "sine");
      fx?.haptic(6);
      toggle();
    },
  });

  // Compose refs: pass through to both the shortcut registry (for hint floats)
  // and our local one (for measuring position).
  const setTriggerRef = useCallback(
    (node: HTMLButtonElement | null) => {
      triggerInnerRef.current = node;
      triggerRef.current = node;
    },
    [triggerRef],
  );

  return (
    <>
      <button
        ref={setTriggerRef}
        type="button"
        className={`dock-item icon-only accent-pop-trigger ${open ? "is-open" : ""}`}
        // popoverTarget gives us free toggling on click; the React handler just
        // adds the chime + haptic. Native popover handles ESC + outside-click.
        popoverTarget={POPOVER_ID}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={POPOVER_ID}
        aria-label={open ? "Close appearance panel" : "Appearance settings"}
        onClick={() => {
          fx?.click(440, 0.05, "sine");
          fx?.haptic(6);
        }}
      >
        <Icon name="palette" size={15} />
      </button>

      <div
        ref={popRef}
        id={POPOVER_ID}
        className="accent-pop"
        // eslint-disable-next-line jsx-a11y/prefer-tag-over-role -- non-modal popover; native <dialog> would trap focus and block light-dismiss
        role="dialog"
        aria-label="Appearance"
        // popover="auto" enables ESC dismissal + light-dismiss on outside click.
        popover="auto"
        // Opt out of the global recolor transition baseline — the popover needs
        // its own `transition: ... display allow-discrete, overlay allow-discrete`
        // shorthand intact for @starting-style to drive the jelly entry animation.
        data-no-recolor
      >
        <div className="accent-pop-frame">
          <AccentPanel />
        </div>
      </div>
    </>
  );
}
