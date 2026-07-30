import type { InkId, Mode } from "@/lib/ink";

/**
 * Every interaction the site reports, as a closed union.
 *
 * Ported from the microcharts docs app (apps/docs/src/lib/analytics) so both
 * properties speak the same shape. The union is deliberately small: one member
 * per *kind* of interaction, never one per control. A new dock item is a new
 * `nav` id, not a new event name — GA4 caps custom event names at 500 and a
 * per-control name burns that budget for no analytical gain.
 */
export type AnalyticsEvent =
  /** In-site navigation the reader chose: dock, footer, teaser, index entry. */
  | { name: "nav"; id: string; href: string }
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
  /** Ink pick. `via` separates the dock popover from the page's ink library. */
  | { name: "ink"; id: InkId; via: "popover" | "library" | "key" }
  /** Press run: 2 ink / spot / 1 ink. */
  | { name: "press_run"; mode: Mode }
  | { name: "sound"; on: boolean }
  /** A keyboard shortcut fired. `id` is the registry id, e.g. `nav.writing`. */
  | { name: "shortcut"; id: string }
  /** The `?` help sheet opened. */
  | { name: "help" }
  | { name: "print_cv" }
  /** An essay image was opened in the lightbox. */
  | { name: "zoom_image"; src: string }
  | { name: "copy"; kind: "code" };

export type AnalyticsAdapter = {
  track(event: AnalyticsEvent): void;
};
