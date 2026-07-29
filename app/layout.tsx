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
import { identity } from "@/lib/resume";
// eslint-disable-next-line import/no-unassigned-import
import "@/styles/press.css";

const SITE_DESC =
  "Engineer and engineering leader in Bengaluru. Eleven years at Tracxn, from first-week engineer to VP — still writing code most weeks.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Ganapati V S — meetguns", template: "%s · meetguns" },
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
    },
  },
  appleWebApp: { capable: true, title: "meetguns", statusBarStyle: "default" },
  openGraph: {
    title: "Ganapati V S — meetguns",
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
    title: "Ganapati V S — meetguns",
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
    { media: "(prefers-color-scheme: light)", color: "#f5ecda" },
    { media: "(prefers-color-scheme: dark)", color: "#1a120c" },
  ],
};

// The whole palette lives in styles/press/tokens.css keyed on these three data
// attributes, so preventing a flash is just a matter of stamping them before
// first paint. The only values duplicated here are the two paper hexes, which
// have to be inline because they paint the canvas before any stylesheet has
// been parsed — everything else the CSS derives on its own.
const noFlash = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('mg_theme');if(t!=='light'&&t!=='dark'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}d.dataset.theme=t;d.style.colorScheme=t;d.style.backgroundColor=t==='dark'?'#1a120c':'#f5ecda';var i=localStorage.getItem('mg_ink');if(!/^(terracotta|saffron|sage|rose|plum|coffee)$/.test(i||''))i='terracotta';d.dataset.ink=i;var m=localStorage.getItem('mg_mode');if(m!=='mono'&&m!=='plain')m='colorful';d.dataset.mode=m;}catch(e){}})();`;

const consoleSig = `(function(){var a=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#ae532d';console.log('%cmeetguns press · set by hand · vsg.inbox@gmail.com','font-family:Georgia,serif;font-style:italic;font-size:18px;color:'+a+';line-height:1.6;');})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={pressFontVars} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: noFlash }} />
        <script dangerouslySetInnerHTML={{ __html: consoleSig }} />
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
