import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { HUE_HEX, type HueAccentId as Accent } from "@/lib/accents";

export const OG_SIZE = { width: 1200, height: 630 } as const;
export const OG_CONTENT_TYPE = "image/png" as const;

const BONE = "#FBF6EA";
const INK = "#231811";
const INK_SOFT = "#5e3a24";

let fraunces600: Buffer | null = null;
let fraunces400i: Buffer | null = null;

async function getFonts() {
  if (!fraunces600 || !fraunces400i) {
    const base = join(process.cwd(), "node_modules", "@fontsource", "fraunces", "files");
    const [a, b] = await Promise.all([
      readFile(join(base, "fraunces-latin-600-normal.woff")),
      readFile(join(base, "fraunces-latin-400-italic.woff")),
    ]);
    fraunces600 = a;
    fraunces400i = b;
  }
  return { fraunces600, fraunces400i };
}

type RenderArgs = {
  eyebrow: string;
  title: string;
  footer?: string;
  accent?: Accent;
};

export async function renderOG({
  eyebrow,
  title,
  footer = "meetguns.com",
  accent = "terracotta",
}: RenderArgs) {
  const fonts = await getFonts();
  const accentColor = HUE_HEX[accent];

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: BONE,
        color: INK,
        fontFamily: '"Fraunces"',
        padding: "72px 80px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 10,
          background: accentColor,
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <svg width="56" height="88" viewBox="0 0 84 131.615" xmlns="http://www.w3.org/2000/svg">
          <path
            fill={accentColor}
            d="M83.24629,105.00076l-28.79883.14941c-14.84912,0-28.34863-2.39941-40.498-13.64941C4.19941,82.35135,1.04951,69.75174.3,52.95242C1.9499,22.35281,21.44893,.4548,55.798,.00456c12.59961,1.0498,20.54883,3.75,25.79883,5.09961L64.49727,51.45242l19.499-.15039-0.75,46.94873v6.75ZM35.99824,90.15115L64.19648,12.15359C37.34834,9.00418,14.24922,22.50318,13.799,52.95242c-0.44968,17.39893,9.14993,31.19873,22.19924,37.19873Zm12.14941,3.2998c7.65039,0,18.89941-.4502,22.94922-0.4502l0.4502-32.24951H59.09688Z"
          />
          <path fill={accentColor} d="M0,118.215h84v12H0v-12Z" />
        </svg>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              fontFamily: '"Fraunces"',
              fontSize: 22,
              color: INK_SOFT,
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              fontFamily: '"Fraunces"',
              fontWeight: 400,
              fontSize: 26,
              color: INK,
              fontStyle: "italic",
              marginTop: 4,
            }}
          >
            Ganapati V S · meetguns
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flex: 1,
          alignItems: "center",
          marginTop: 24,
        }}
      >
        <div
          style={{
            fontFamily: '"Fraunces"',
            fontWeight: 600,
            fontSize: title.length > 60 ? 64 : 80,
            lineHeight: 1.05,
            color: INK,
            letterSpacing: -1,
            maxWidth: 1040,
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 20,
          paddingTop: 24,
          borderTop: `1px solid rgba(124, 70, 40, 0.18)`,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: '"Fraunces"',
            fontSize: 22,
            color: INK_SOFT,
          }}
        >
          <span
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: accentColor,
              display: "block",
            }}
          />
          <span>{footer}</span>
        </div>
        <div
          style={{
            fontFamily: '"Fraunces"',
            fontStyle: "italic",
            fontSize: 24,
            color: INK_SOFT,
          }}
        >
          engineer · in bengaluru
        </div>
      </div>
    </div>,
    {
      ...OG_SIZE,
      fonts: [
        { name: "Fraunces", data: fonts.fraunces600, style: "normal", weight: 600 },
        { name: "Fraunces", data: fonts.fraunces400i, style: "italic", weight: 400 },
      ],
    },
  );
}
