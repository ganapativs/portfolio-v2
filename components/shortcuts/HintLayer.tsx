"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useShortcutList, useShortcutRegistry } from "./ShortcutProvider";
import { KeyGlyph } from "./KeyGlyph";

type PopoverEl = HTMLDivElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

const HOLD_DELAY_MS = 120;

type Pos = { id: string; hint: string; top: number; left: number; index: number };

function isElementVisuallyVisible(el: HTMLElement) {
  // Cheap visibility gate that respects RevealController's .in-view fade.
  const cs = getComputedStyle(el);
  if (cs.visibility === "hidden" || cs.display === "none") return false;
  if (parseFloat(cs.opacity || "1") < 0.1) return false;
  const rect = el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return false;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  if (rect.bottom < 0 || rect.top > vh) return false;
  if (rect.right < 0 || rect.left > vw) return false;
  return true;
}

export function HintLayer() {
  const reg = useShortcutRegistry();
  const list = useShortcutList();
  const [mounted, setMounted] = useState(false);
  const [shown, setShown] = useState(false);
  const [positions, setPositions] = useState<Pos[]>([]);

  const holdTimerRef = useRef<number | null>(null);
  const shiftDownRef = useRef(false);
  const aloneRef = useRef(true);
  const rafRef = useRef<number | null>(null);

  useEffect(() => setMounted(true), []);

  // Skip while a modal scope is active — no need to flash hints under the dialog.
  const measure = () => {
    if (reg.activeScope !== "global") {
      // PERF: bail-out keeps reference identity when already empty — avoids
      // a wasted render every rAF tick while a modal scope is up.
      setPositions((prev) => (prev.length === 0 ? prev : []));
      return;
    }
    const out: Pos[] = [];
    let i = 0;
    for (const s of list) {
      if ((s.scope ?? "global") !== "global") continue;
      const el = s.elementRef?.current;
      if (!el) continue;
      if (!isElementVisuallyVisible(el)) continue;
      const rect = el.getBoundingClientRect();
      const hint = s.hint ?? (s.keys[0] ? s.keys[0] : "?");
      const top = Math.round(rect.top - 8);
      const left = Math.round(rect.right - 6);
      out.push({ id: s.id, hint, top, left, index: i++ });
    }
    // PERF: skip setState when contents are identical to the previous frame —
    // rAF tick re-measures every frame while shift is held, but most frames
    // produce the same layout. Bailing keeps positions ref stable so the
    // portal subtree (KeyGlyph children) doesn't re-render.
    setPositions((prev) => {
      if (prev.length !== out.length) return out;
      for (let j = 0; j < out.length; j++) {
        const a = prev[j];
        const b = out[j];
        if (
          a.id !== b.id ||
          a.top !== b.top ||
          a.left !== b.left ||
          a.hint !== b.hint ||
          a.index !== b.index
        ) {
          return out;
        }
      }
      return prev;
    });
  };

  // Event-driven re-measure while shown. `measure` runs getComputedStyle +
  // getBoundingClientRect per shortcut, so a per-frame rAF loop is forced
  // sync layout at 60fps for hints that mostly don't move. Instead: measure
  // on show, on scroll/resize (rAF-coalesced), and on a slow safety interval
  // that catches reveal fades finishing under the held Shift.
  useEffect(() => {
    if (!shown) return;
    measure();
    const schedule = () => {
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        measure();
      });
    };
    const interval = window.setInterval(schedule, 200);
    window.addEventListener("scroll", schedule, { passive: true, capture: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("scroll", schedule, { capture: true });
      window.removeEventListener("resize", schedule);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
    // measure() reads `list` and `reg.activeScope` via closure — re-run when they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown, list, reg.activeScope]);

  useEffect(() => {
    const cancelTimer = () => {
      if (holdTimerRef.current !== null) {
        window.clearTimeout(holdTimerRef.current);
        holdTimerRef.current = null;
      }
    };

    const onDown = (e: KeyboardEvent) => {
      if (e.key === "Shift" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (shiftDownRef.current) return;
        shiftDownRef.current = true;
        aloneRef.current = true;
        cancelTimer();
        holdTimerRef.current = window.setTimeout(() => {
          if (shiftDownRef.current && aloneRef.current) setShown(true);
        }, HOLD_DELAY_MS);
        return;
      }
      // Any other key while Shift is held disqualifies the reveal: it's a real shortcut, not a hint request.
      if (shiftDownRef.current) {
        aloneRef.current = false;
        cancelTimer();
        if (shown) setShown(false);
      }
    };

    const onUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        shiftDownRef.current = false;
        aloneRef.current = true;
        cancelTimer();
        if (shown) setShown(false);
      }
    };

    const onBlur = () => {
      shiftDownRef.current = false;
      aloneRef.current = true;
      cancelTimer();
      if (shown) setShown(false);
    };

    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    window.addEventListener("blur", onBlur);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      window.removeEventListener("blur", onBlur);
      cancelTimer();
    };
  }, [shown]);

  const layerRef = useRef<HTMLDivElement | null>(null);
  const visible = shown && positions.length > 0;

  useLayoutEffect(() => {
    const el = layerRef.current as PopoverEl | null;
    if (!el) return;
    if (visible) el.showPopover?.();
    else el.hidePopover?.();
  }, [visible]);

  if (!mounted) return null;

  return createPortal(
    <div ref={layerRef} className="khint-layer" popover="manual" aria-hidden="true">
      {visible &&
        positions.map((p) => (
          <span
            key={p.id}
            className="khint"
            style={{
              top: `${p.top}px`,
              left: `${p.left}px`,
              ["--i" as string]: p.index,
            }}
          >
            <KeyGlyph k={p.hint} size="sm" />
          </span>
        ))}
    </div>,
    document.body,
  );
}
