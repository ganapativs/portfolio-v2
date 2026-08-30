"use client";
import { useShortcutRegistry } from "@/components/shortcuts/ShortcutProvider";
import { useCoarsePointer } from "./useCoarsePointer";

/**
 * The one line that tells a reader the keyboard map exists.
 *
 * Nine shortcuts, a Shift-hold hint layer that floats a key glyph over every
 * control that owns one, and a help sheet, and until this line nothing on the
 * page said any of it was there. A power user, who is the reader this site is
 * written for, would arrive, skim, and leave having pressed nothing.
 *
 * It sits in the title block rather than the header because the header is
 * already carrying the identity, the navigation, the tray and two toggles, and
 * because the title block is where a drawing records how it is meant to be
 * read.
 *
 * Hidden on a coarse pointer. A list of keys is not an offer you can take up
 * with a thumb.
 */
export function KeysHint() {
  const { openHelp } = useShortcutRegistry();
  const coarse = useCoarsePointer();
  if (coarse) return null;
  return (
    <button type="button" className="chip tb-keys" onClick={openHelp} data-analytics="cta:tb.keys">
      press <kbd>?</kbd> for keys
    </button>
  );
}
