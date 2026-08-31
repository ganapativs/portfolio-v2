import type { InkId } from "@/lib/ink";

/**
 * Every interaction the site reports, as a closed union.
 *
 * Ported from the microcharts docs app (apps/docs/src/lib/analytics) so both
 * properties speak the same shape. The union is deliberately small: one member
 * per *kind* of interaction, never one per control. A new header link is a new
 * `nav` id, not a new event name — GA4 caps custom event names at 500 and a
 * per-control name burns that budget for no analytical gain.
 */
export type AnalyticsEvent =
  /** In-site navigation the reader chose: dock, footer, teaser, index entry. */
  /**
   * `href` is optional because not every navigation is an anchor. The measuring
   * edge's section ticks are buttons that scroll, so they have no href to read,
   * and a required field meant every tick reported `link_url: ""`.
   */
  | { name: "nav"; id: string; href?: string }
  /** A content link that matters enough to be named — a project, a repo, a CV. */
  | { name: "cta"; id: string; href?: string }
  /** Any link that leaves the origin. Captured automatically. */
  | { name: "outbound"; url: string; label?: string }
  /** mailto:, captured automatically; `id` says which one was clicked. */
  | { name: "mail"; id: string }
  /** Machine-readable surfaces — the feeds people actually take. */
  | { name: "feed"; kind: "rss" | "llms" | "markdown" }
  /** Paper flip. `via` separates the panel from the keyboard. */
  | { name: "theme"; to: "light" | "dark"; via: "pointer" | "key" }
  /** Ink pick. `via` separates the header tray from the number keys. */
  | { name: "ink"; id: InkId; via: "tray" | "key" }
  | { name: "sound"; on: boolean }
  /** A keyboard shortcut fired. `id` is the registry id, e.g. `nav.writing`. */
  | { name: "shortcut"; id: string }
  /** The `?` help sheet opened. */
  | { name: "help" }
  | { name: "print_cv" }
  /** An essay image was opened in the lightbox. */
  | { name: "zoom_image"; src: string }
  /** Something was copied to the clipboard: a code block, or the email. */
  | { name: "copy"; kind: "code" | "email" };

export type AnalyticsAdapter = {
  track(event: AnalyticsEvent): void;
};
