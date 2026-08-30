/**
 * The web-vitals beacon sink.
 *
 * `export const runtime = "edge"` used to be the first line. It is gone
 * because the site runs on Cloudflare Workers now, where every request is
 * already on the edge, and because @opennextjs/cloudflare refuses to build a
 * route that declares it: an edge-runtime function has to be bundled
 * separately, which is exactly the split this route does not need.
 *
 * The handler is unchanged. Beacons are best-effort, the body is read only so
 * a malformed one cannot hang the request, and the reply is always 204 so
 * `sendBeacon` never retries.
 */
export async function POST(req: Request) {
  try {
    const data = await req.json();
    if (process.env.NODE_ENV !== "production") {
      console.debug("[vitals]", data);
    }
  } catch {
    // beacons are best-effort
  }
  return new Response(null, { status: 204 });
}
