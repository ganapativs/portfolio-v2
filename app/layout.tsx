import type { Metadata, Viewport } from "next";
import { pressFontVars } from "@/lib/fonts";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { FXProvider } from "@/components/providers/FXProvider";
import { InkProvider } from "@/components/providers/InkProvider";
import { ShortcutProvider } from "@/components/shortcuts/ShortcutProvider";
import { HintLayer } from "@/components/shortcuts/HintLayer";
import { ShortcutHelp } from "@/components/shortcuts/ShortcutHelp";
import { WebVitals } from "@/components/WebVitals";
import { Analytics } from "@/components/Analytics";
import { JsonLd, personSchema, websiteSchema, SITE_URL } from "@/lib/jsonld";
import { GA_ENABLED, gaStub } from "@/lib/analytics/ga-id";
import { identity } from "@/lib/resume";
// eslint-disable-next-line import/no-unassigned-import
import "@/styles/press.css";

const SITE_DESC =
  "Full-stack engineer with a design mind, twelve years in, based in Bengaluru. Intern to VP of Technology at Tracxn, still shipping code.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Ganapati V S · meetguns", template: "%s · meetguns" },
  description: SITE_DESC,
  applicationName: "meetguns",
  keywords: [
    "Ganapati V S",
    "meetguns",
    "engineering leader",
    "Bengaluru",
    "React",
    "Next.js",
    "TypeScript",
    "frontend",
    "Tracxn",
    "AI assistant",
    "API documentation portal",
    "MCP",
    "LLM",
    "microcharts",
    "dataviz",
    "open source",
  ],
  authors: [{ name: "Ganapati V S", url: SITE_URL }],
  creator: "Ganapati V S",
  publisher: "Ganapati V S",
  category: "technology",
  formatDetection: { telephone: false, email: false, address: false },
  manifest: "/manifest.webmanifest",
  // No `canonical` here — a layout-level canonical is inherited by every
  // segment that doesn't override it (including the 404 page, which would
  // then canonicalise to the homepage). Each page sets its own.
  alternates: {
    types: {
      "application/rss+xml": [{ url: "/rss.xml", title: "meetguns blog" }],
      // The curated plain-text map, advertised the same way the feed is, so an
      // agent that reads <head> finds it without guessing the path.
      "text/plain": [{ url: "/llms.txt", title: "meetguns for LLMs" }],
    },
  },
  // Declared explicitly rather than left to the file conventions: the moment
  // an `icons` object exists, Next stops emitting the automatic <link> tags
  // for app/icon.tsx, app/apple-icon.tsx and app/favicon.ico, so everything
  // has to be listed here. Order is preference order — Safari and older
  // crawlers take the .ico, everything current takes the SVG, and Google's
  // SERP favicon wants a raster that is a multiple of 48 (the 192).
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48 32x32 16x16", type: "image/x-icon" },
      { url: "/icon", type: "image/svg+xml", sizes: "any" },
      { url: "/icon-192", sizes: "192x192", type: "image/png" },
      { url: "/icon-512", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: { capable: true, title: "meetguns", statusBarStyle: "default" },
  openGraph: {
    title: "Ganapati V S · meetguns",
    description: SITE_DESC,
    url: SITE_URL,
    siteName: "meetguns",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@Ganapativs",
    site: "@Ganapativs",
    title: "Ganapati V S · meetguns",
    description: SITE_DESC,
  },
  // Carried over from meetguns.com v1 — keeps Search Console ownership intact
  verification: { google: "SjjIT31sWEJ5ZN2ADsgkGuVZCCJSS0KyvBODf6g0Ijw" },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large",
    "max-snippet": -1,
    "max-video-preview": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#131417" },
  ],
};

// The whole palette lives in styles/press/tokens.css keyed on two data
// attributes, so preventing a flash is a matter of stamping them before first
// paint. The only values duplicated here are the two ground hexes, which have
// to be inline because they paint the canvas before any stylesheet has been
// parsed — everything else the CSS derives on its own.
//
// The ink regex has to list every id in lib/ink.ts. A miss is silent: it falls
// back to the default rather than throwing, so a renamed ink looks like a
// forgetful browser rather than a bug.
const noFlash = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('mg_theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}d.dataset.theme=t;d.style.colorScheme=t;d.style.backgroundColor=t==='dark'?'#131417':'#f5f3ec';var i=localStorage.getItem('mg_ink');if(!/^(amber|bottle|oxblood|dustblue|aubergine|slate)$/.test(i||''))i='amber';d.dataset.ink=i;}catch(e){}})();`;

const consoleSig = `(function(){var a=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#8f5c0c';console.log('%cmeetguns · built with care in Bengaluru · vsg.inbox@gmail.com','font-family:ui-monospace,monospace;font-size:13px;letter-spacing:.08em;color:'+a+';line-height:1.8;');})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // `data-scroll-behavior="smooth"` acknowledges the `scroll-behavior: smooth`
    // in styles/press/base.css. Without it Next warns, because a router
    // navigation would otherwise animate the jump back to the top of the next
    // page — the attribute is what lets it suppress that while leaving in-page
    // anchor jumps (the ruler's section links) gliding as designed.
    <html
      lang="en"
      className={pressFontVars}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <script dangerouslySetInnerHTML={{ __html: consoleSig }} />
        {/* The gtag queue, ahead of gtag.js. See lib/analytics/ga-id.ts —
            this exists so a click in the first second is still counted. */}
        {GA_ENABLED && <script dangerouslySetInnerHTML={{ __html: gaStub }} />}
        <JsonLd data={[personSchema, websiteSchema]} />
        <link rel="author" href="/humans.txt" />
        {identity.social
          .filter((s) => s.kind !== "mail")
          .map((s) => (
            <link key={s.href} rel="me" href={s.href} />
          ))}
      </head>
      <body>
        <ThemeProvider>
          <FXProvider>
            <ShortcutProvider>
              <InkProvider>
                {children}
                <HintLayer />
                <ShortcutHelp />
              </InkProvider>
            </ShortcutProvider>
          </FXProvider>
        </ThemeProvider>
        <WebVitals />
        <Analytics />
      </body>
    </html>
  );
}
