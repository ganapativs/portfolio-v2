"use client";
import { useLayoutEffect, useRef } from "react";

/**
 * A caption slot that changes what it says without flickering.
 *
 * A figure that names the part under the pointer in a slot beneath it has
 * notes of different lengths, two lines for one part and four for the next.
 * Swapped in place, the slot snaps from one height to the other and everything
 * under it jumps. A reader moving along the parts reads that as the page
 * twitching, not as a caption changing.
 *
 * Where the copy is yours to write, the better answer is to write the strings
 * to the same length and let the slot be a fixed box: figs. 1 and 3 do that,
 * see `.xp-note`. This is for the slot whose entries are dates and ranges that
 * cannot be evened out, which is fig. 5.
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
  /** `tl-cap` on the career timeline, the only slot left that resizes. */
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

    // Where the slot is right now. If a previous change is still travelling
    // its height is pinned to an inline pixel value, and that value is the
    // honest starting point; otherwise the box has already reflowed to the new
    // content and the only record of where it was is the ref.
    const pinned = b.style.height !== "";
    const from = pinned ? b.getBoundingClientRect().height : lastH.current;

    // Clear before measuring, always. Reading `offsetHeight` while the height
    // is pinned returns the pinned value, so a reader who moved on before the
    // last change had finished measured the *old* height as the new target:
    // the slot animated to where it already was and stayed expanded, and
    // moving the pointer off the figure never brought it back down.
    b.style.height = "";
    const to = b.offsetHeight;
    lastH.current = to;
    if (from === null || Math.abs(from - to) < 0.5) return;

    b.style.height = `${from}px`;
    // Read forces the reflow, so the two heights are two separate styles rather
    // than one batched write the browser would collapse into a jump.
    void b.offsetHeight;
    b.style.height = `${to}px`;

    const done = (e: TransitionEvent) => {
      // Only this element's own height. Transitions bubble, and the label
      // inside carries `color: var(--accent)`, so an ink change fired a
      // `transitionend` through here and released the height mid-travel.
      if (e.target !== b || e.propertyName !== "height") return;
      b.style.height = "";
      b.removeEventListener("transitionend", done);
      b.removeEventListener("transitioncancel", done);
    };
    b.addEventListener("transitionend", done);
    b.addEventListener("transitioncancel", done);
    return () => {
      b.removeEventListener("transitionend", done);
      b.removeEventListener("transitioncancel", done);
    };
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
