import { MARK_BAR_PATH, MARK_G_PATH, MARK_VIEWBOX } from "@/lib/mark";

/**
 * The G. It inherits `currentColor` for the letter and paints the bar under it
 * in the live ink, because the bar is the one part of the identity that is
 * printed rather than drawn — see `.hd-mark .mark-bar` in chrome.css, which
 * re-inks it on hover with a single left-to-right wipe.
 *
 * Size is CSS's job. The width/height attributes only set the intrinsic ratio.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox={`0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}`}
      width={MARK_VIEWBOX.width}
      height={MARK_VIEWBOX.height}
      aria-hidden="true"
      focusable="false"
    >
      <path d={MARK_G_PATH} fill="currentColor" />
      <path className="mark-bar" d={MARK_BAR_PATH} />
    </svg>
  );
}
