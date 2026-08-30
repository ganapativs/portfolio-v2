"use client";
import { useLayoutEffect, useRef } from "react";

/**
 * A caption slot that changes what it says without flickering.
 *
 * Every figure on the sheet names the part under the pointer in a slot beneath
 * it, and those notes are different lengths: two lines for one part, four for
 * the next. Swapped in place, the slot snaps from one height to the other and
 * everything under it jumps. A reader moving along five slabs reads that as the
 * page twitching, not as a caption changing.
 *
 * So the slot animates its own height, and the text inside crossfades.
 *
 * The height has to be measured rather than declared. `interpolate-size:
 * allow-keywords` makes `height: auto` transitionable and was tried first, but
 * it is Chrome 129 and Safari 26 and up, and this site's floor is Safari 16.4:
 * on anything older the slot snapped exactly as before, which is the one thing
 * this is for. Measuring works everywhere.
 *
 * The measurement is the whole trick, and it is why `lastH` exists. By the time
 * a layout effect runs the DOM already holds the new caption, so the old height
 * is gone. Keeping the previous render's height in a ref gives both ends: the
 * ref is where the slot was, `offsetHeight` is where it is going. Setting the
 * old value, forcing a reflow and then setting the new one gives the browser
 * two lengths to interpolate between, and because this is a layout effect none
 * of it is ever painted.
 *
 * `key` is what the caller changes when the caption changes. The first run only
 * records a height: nothing animates on mount.
 */
export function Caption({
  className,
  id,
  itemKey,
  label,
  children,
}: {
  /** `xp-cap` on the figures, `tl-cap` on the career timeline. */
  className: string;
  /**
   * The slot is not a live region. It changes on hover, and a figure with five
   * parts announced five times while a pointer crossed it. The controls that
   * drive it point at this id with `aria-describedby` instead, so the caption
   * is read once, on focus, as the description of the thing focused.
   */
  id: string;
  /** Changes when the caption changes. */
  itemKey: string;
  /** The name of the thing, set in mono and in the live ink. */
  label: string;
  children: React.ReactNode;
}) {
  const box = useRef<HTMLDivElement>(null);
  const lastH = useRef<number | null>(null);

  useLayoutEffect(() => {
    const b = box.current;
    if (!b) return;
    const to = b.offsetHeight;
    const from = lastH.current;
    lastH.current = to;
    if (from === null || from === to) return;
    b.style.height = `${from}px`;
    // Read forces the reflow, so the two heights are two separate styles rather
    // than one batched write the browser would collapse into a jump.
    void b.offsetHeight;
    b.style.height = `${to}px`;
    const clear = () => {
      b.style.height = "";
      b.removeEventListener("transitionend", clear);
    };
    b.addEventListener("transitionend", clear);
    return () => b.removeEventListener("transitionend", clear);
  }, [itemKey]);

  return (
    <div className={className} id={id} ref={box}>
      <div className="cap-in" key={itemKey}>
        <b>{label}</b>
        {children}
      </div>
    </div>
  );
}
