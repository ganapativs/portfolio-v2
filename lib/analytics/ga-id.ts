// GA4 measurement ID for the meetguns.com web stream. Public by design — it
// ships in the page source of every GA-instrumented site, so it is a constant
// here rather than an env var.
export const GA_ID = "G-Y6DEM2T3N5";

/**
 * Production-only, same as the vitals beacon — keeps `pnpm dev` traffic out of
 * the real property. To smoke-test the wiring locally: `pnpm build && pnpm
 * start`. In development, track() goes to the console instead (debugAdapter).
 */
export const GA_ENABLED = process.env.NODE_ENV === "production";

/**
 * The gtag stub, inlined into <head>.
 *
 * This is ~140 bytes and no network request. Its whole job is to make `gtag()`
 * callable from the very first byte, so events fired before gtag.js has landed
 * queue on dataLayer instead of hitting `window.gtag?.()` and disappearing.
 * `send_page_view:false` because the App Router fires pageviews itself — see
 * components/Analytics.tsx.
 */
export const gaStub =
  `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}` +
  `window.gtag=gtag;gtag('js',new Date());gtag('config','${GA_ID}',{send_page_view:false});`;
