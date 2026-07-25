#!/usr/bin/env node
/**
 * Notify search engines after deploy. Fetches live sitemap.xml, verifies IndexNow key,
 * POSTs URL list to api.indexnow.org (Bing, Yandex, Seznam, Naver, etc.).
 *
 * Google deprecated sitemap ping — submit https://meetguns.com/sitemap.xml in Search Console
 * (site verification meta is already in app/layout.tsx).
 *
 * Usage:
 *   pnpm index:submit
 *   SITE_URL=https://meetguns.com pnpm index:submit
 *   pnpm index:submit -- --dry-run
 */

const INDEXNOW_KEY = "mgindexnow7k2p9xq4m8n1w5e3r6t";
const DEFAULT_SITE = "https://meetguns.com";
const INDEXNOW_API = "https://api.indexnow.org/indexnow";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function siteUrl() {
  const raw = (process.env.SITE_URL ?? DEFAULT_SITE).replace(/\/+$/, "");
  return raw.startsWith("http") ? raw : `https://${raw}`;
}

function hostFromUrl(url) {
  return new URL(url).host;
}

async function fetchText(url, label) {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) {
    throw new Error(`${label} ${url} → HTTP ${res.status}`);
  }
  return res.text();
}

function urlsFromSitemapXml(xml) {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
}

async function verifyIndexNowKey(base) {
  const keyLocation = `${base}/${INDEXNOW_KEY}.txt`;
  const body = (await fetchText(keyLocation, "IndexNow key")).trim();
  if (body !== INDEXNOW_KEY) {
    throw new Error(
      `IndexNow key mismatch at ${keyLocation} (expected exact key text, got ${body.length} chars)`,
    );
  }
  return keyLocation;
}

async function verifyRobots(base) {
  const robots = await fetchText(`${base}/robots.txt`, "robots.txt");
  const sitemapLine = `${base}/sitemap.xml`;
  if (
    !robots.includes("sitemap.xml") &&
    !robots.toLowerCase().includes(sitemapLine.toLowerCase())
  ) {
    console.warn("warn: robots.txt may not reference sitemap.xml — check app/robots.ts");
  }
}

async function submitIndexNow({ host, keyLocation, urlList }) {
  const payload = {
    host,
    key: INDEXNOW_KEY,
    keyLocation,
    urlList,
  };
  if (dryRun) {
    console.log(
      "[dry-run] IndexNow payload:",
      JSON.stringify({ ...payload, urlList: `[${urlList.length} urls]` }),
    );
    return;
  }
  const res = await fetch(INDEXNOW_API, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  if (res.status !== 200 && res.status !== 202) {
    const text = await res.text().catch(() => "");
    throw new Error(`IndexNow API → HTTP ${res.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
  }
  console.log(`IndexNow: submitted ${urlList.length} URL(s) (HTTP ${res.status})`);
}

async function main() {
  const base = siteUrl();
  const host = hostFromUrl(base);
  console.log(`Site: ${base}${dryRun ? " (dry-run)" : ""}`);

  await verifyRobots(base);
  const keyLocation = await verifyIndexNowKey(base);
  console.log(`IndexNow key OK: ${keyLocation}`);

  const sitemapXml = await fetchText(`${base}/sitemap.xml`, "sitemap");
  const urlList = urlsFromSitemapXml(sitemapXml);
  if (urlList.length === 0) {
    throw new Error("No <loc> entries in sitemap.xml");
  }
  console.log(`Sitemap: ${urlList.length} URL(s)`);

  await submitIndexNow({ host, keyLocation, urlList });

  console.log(`
Google: sitemap ping is retired. In Search Console → Sitemaps, submit:
  ${base}/sitemap.xml
(Ownership: google-site-verification meta in app/layout.tsx)

Bing: IndexNow feeds Bing Webmaster Tools when the key is verified on first successful submit.
`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
