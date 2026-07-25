export const runtime = "edge";

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
