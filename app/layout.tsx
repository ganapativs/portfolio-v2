import type { Metadata, Viewport } from "next";
import { ViewTransition } from "react";
import { fraunces, jetbrainsMono, geistSans } from "@/lib/fonts";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { FXProvider } from "@/components/providers/FXProvider";
import { AccentProvider } from "@/components/providers/AccentProvider";
import { Dock } from "@/components/Dock";
import { SiteFooter } from "@/components/SiteFooter";
import { RevealController } from "@/components/RevealController";
import { ShortcutProvider } from "@/components/shortcuts/ShortcutProvider";
import { HintLayer } from "@/components/shortcuts/HintLayer";
import { ShortcutHelp } from "@/components/shortcuts/ShortcutHelp";
import { WebVitals } from "@/components/WebVitals";
import { Analytics } from "@/components/Analytics";
import { JsonLd, personSchema, websiteSchema, SITE_URL } from "@/lib/jsonld";
import { identity } from "@/lib/resume";
// eslint-disable-next-line import/no-unassigned-import
import "./globals.css";

const SITE_DESC =
  "Engineer and engineering leader, in Bengaluru. Ten years in one place — building product, growing the team, still writing code.";

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
    { media: "(prefers-color-scheme: light)", color: "#FBF6EA" },
    { media: "(prefers-color-scheme: dark)", color: "#1A1411" },
  ],
};

const noFlash = `(function(){try{var d=document.documentElement;d.dataset.js='true';var t=localStorage.getItem('mg_theme');if(!t){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}d.dataset.theme=t;d.style.colorScheme=t;d.style.backgroundColor=t==='dark'?'#1A1411':'#FBF6EA';var A={terracotta:['#D88762','rgba(216,135,98,0.14)','hue'],saffron:['#E8B86B','rgba(232,184,107,0.16)','hue'],sage:['#8FA37A','rgba(143,163,122,0.16)','hue'],rose:['#C97B7B','rgba(201,123,123,0.16)','hue'],plum:['#6E5167','rgba(110,81,103,0.18)','hue'],coffee:['#7C4628','rgba(124,70,40,0.14)','hue'],paper:['#000000','rgba(0,0,0,0.06)','pure','light'],ink:['#FFFFFF','rgba(255,255,255,0.08)','pure','dark']};var id=localStorage.getItem('mg_accent');var a=A[id]||A.terracotta;d.style.setProperty('--accent',a[0]);d.style.setProperty('--accent-soft',a[1]);d.style.setProperty('--accent-hover',a[2]==='hue'?'color-mix(in oklab, '+a[0]+' 78%, black)':a[0]);d.style.setProperty('--link',a[0]);d.style.setProperty('--link-hover',a[0]);d.style.setProperty('--highlight',a[0]);d.style.setProperty('--accent-live',a[0]);d.style.setProperty('--accent-live-soft',a[1]);if(a[2]==='pure'){d.dataset.pure=id;d.dataset.purePolarity=a[3];d.style.backgroundColor=a[3]==='dark'?'#000000':'#FFFFFF';}if(localStorage.getItem('mg_mono')==='true')d.dataset.mono='true';}catch(e){}})();`;

const consoleSig = `(function(){var a=getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()||'#D88762';console.log('%cBuilt by hand · vsg.inbox@gmail.com','font-family:Fraunces,Georgia,serif;font-style:italic;font-size:20px;color:'+a+';line-height:1.6;');})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${fraunces.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
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
              <AccentProvider>
                <RevealController>
                  <div className="app-shell">
                    <a href="#main-content" className="skip-link">
                      Skip to content
                    </a>
                    <main id="main-content">
                      <ViewTransition name="route">{children}</ViewTransition>
                    </main>
                    <SiteFooter />
                    <Dock />
                  </div>
                  <HintLayer />
                  <ShortcutHelp />
                </RevealController>
              </AccentProvider>
            </ShortcutProvider>
          </FXProvider>
        </ThemeProvider>
        <WebVitals />
        <Analytics />
      </body>
    </html>
  );
}
