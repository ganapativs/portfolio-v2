import { Fraunces, JetBrains_Mono } from "next/font/google";
import { GeistSans } from "geist/font/sans";

// Faces for the retired design, kept alive only for the /old archive. Imported
// exclusively from app/old/layout.tsx so next/font scopes the preloads to those
// routes and the live site never pays for them.

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = GeistSans;

export const legacyFontVars = [geistSans.variable, fraunces.variable, jetbrainsMono.variable].join(
  " ",
);
