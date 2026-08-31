import type { AnalyticsAdapter, AnalyticsEvent } from "../types";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * gtag is defined by the stub in app/layout.tsx's <head>, before gtag.js has
 * loaded — calls made in between queue on dataLayer and flush on load. So this
 * is safe to call at any point in the page's life, including the first click.
 */
function gtagEvent(name: string, params: Record<string, unknown> = {}): void {
  window.gtag?.("event", name, params);
}

/**
 * The union → GA4 mapping.
 *
 * Where GA4 has a recommended event name that genuinely fits (`click` for an
 * outbound link, `select_content` for picking one of several things, `copy`)
 * it is used, so the built-in reports populate. The rest are custom names
 * chosen to be readable in the events table without a lookup — `theme_change`,
 * not `select_content` with a content_type nobody remembers. `contact_click`
 * and `print_cv` are the two worth marking as key events in the GA4 UI.
 */
export const gaAdapter: AnalyticsAdapter = {
  track(event: AnalyticsEvent) {
    switch (event.name) {
      case "nav":
        gtagEvent("select_content", {
          content_type: "nav",
          item_id: event.id,
          // Guarded like `cta` below: the measuring edge's ticks are buttons
          // with no href, and an undefined-valued param is noise.
          ...(event.href ? { link_url: event.href } : {}),
        });
        break;
      case "cta":
        gtagEvent("select_content", {
          content_type: "cta",
          item_id: event.id,
          ...(event.href ? { link_url: event.href } : {}),
        });
        break;
      case "outbound":
        gtagEvent("click", {
          link_url: event.url,
          outbound: true,
          ...(event.label ? { link_text: event.label } : {}),
        });
        break;
      case "mail":
        gtagEvent("contact_click", { item_id: event.id, method: "email" });
        break;
      case "feed":
        gtagEvent("select_content", { content_type: "feed", item_id: event.kind });
        break;
      case "theme":
        gtagEvent("theme_change", { theme: event.to, method: event.via });
        break;
      case "ink":
        gtagEvent("ink_change", { ink: event.id, method: event.via });
        break;
      case "sound":
        gtagEvent("sound_toggle", { enabled: event.on });
        break;
      case "shortcut":
        gtagEvent("shortcut_used", { shortcut_id: event.id });
        break;
      case "help":
        gtagEvent("shortcut_help_open");
        break;
      case "print_cv":
        gtagEvent("print_cv");
        break;
      case "zoom_image":
        gtagEvent("image_zoom", { image: event.src });
        break;
      case "copy":
        gtagEvent("copy", { copy_type: event.kind });
        break;
    }
  },
};
