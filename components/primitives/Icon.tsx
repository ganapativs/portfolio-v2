import {
  ArrowUpRight,
  ArrowDown,
  ArrowRight,
  House,
  User,
  FolderOpen,
  PencilLine,
  Camera,
  Mail,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  Rss,
  MapPin,
  Coffee,
  Palette,
  X as XIcon,
} from "lucide-react";
import type { LucideIcon, LucideProps } from "lucide-react";

const map: Record<string, LucideIcon> = {
  arrow: ArrowUpRight,
  arrowRight: ArrowRight,
  arrowDown: ArrowDown,
  home: House,
  user: User,
  folder: FolderOpen,
  pen: PencilLine,
  camera: Camera,
  mail: Mail,
  sun: Sun,
  moon: Moon,
  sound: Volume2,
  mute: VolumeX,
  rss: Rss,
  pin: MapPin,
  coffee: Coffee,
  palette: Palette,
  close: XIcon,
};

type BrandProps = { size?: number; className?: string } & React.SVGProps<SVGSVGElement>;

// X (formerly Twitter) — lucide ships only a generic close-mark.
function XBrand({ size = 16, className, ...rest }: BrandProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

// GitHub — current lucide builds dropped brand glyphs; inline keeps the social row visible.
function GithubBrand({ size = 16, className, ...rest }: BrandProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.1-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.69 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.38.97 0 1.95.13 2.86.38 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.06.78 2.13 0 1.54-.01 2.78-.01 3.16 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12c0-6.35-5.15-11.5-11.5-11.5z" />
    </svg>
  );
}

function LinkedinBrand({ size = 16, className, ...rest }: BrandProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.26 2.36 4.26 5.43v6.31zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zm1.78 13.02H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.55C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.21 0 22.22 0z" />
    </svg>
  );
}

// Dribbble — lucide doesn't ship brand glyphs.
function DribbbleBrand({ size = 16, className, ...rest }: BrandProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d="M12 0C5.385 0 0 5.385 0 12s5.385 12 12 12 12-5.385 12-12S18.615 0 12 0zm7.83 5.535a10.234 10.234 0 0 1 2.27 6.36c-.32-.06-3.51-.715-6.728-.31-.078-.18-.16-.36-.247-.54a37.7 37.7 0 0 0-.736-1.55c3.605-1.47 5.243-3.59 5.44-3.96zm-1.376-1.34a18.156 18.156 0 0 1-5.084 3.66c-1.413-2.6-2.973-4.71-3.207-5.025a10.04 10.04 0 0 1 8.291 1.365zM8.412 2.946c.226.31 1.756 2.43 3.18 4.97-3.99 1.06-7.51 1.04-7.89 1.04A10.057 10.057 0 0 1 8.412 2.946zM2.488 12.014v-.255c.36.012 4.493.066 8.74-1.21.246.476.474.957.687 1.44a14.41 14.41 0 0 0-.358.117c-4.388 1.418-6.717 5.288-6.91 5.616a10.014 10.014 0 0 1-2.16-5.708zM12 21.985c-2.176 0-4.193-.74-5.79-1.98.156-.318 1.92-3.726 6.728-5.397.018-.012.036-.018.054-.024 1.207 3.124 1.706 5.74 1.832 6.485A9.984 9.984 0 0 1 12 21.985zm4.7-1.06c-.082-.503-.55-3.014-1.66-6.097 3.024-.48 5.658.293 5.984.4a10.018 10.018 0 0 1-4.323 5.697z" />
    </svg>
  );
}

// npm — lucide doesn't ship brand glyphs.
function NpmBrand({ size = 16, className, ...rest }: BrandProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    >
      <path d="M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0H1.763zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113L5.13 5.323z" />
    </svg>
  );
}

// Mirrors --icon-* tokens in styles/tokens.css.
const ICON_TOKENS = { xs: 13, sm: 14, md: 16, lg: 20, xl: 24 } as const;
type IconToken = keyof typeof ICON_TOKENS;

type IconProps = {
  name: string;
  size?: number | IconToken;
  strokeWidth?: number;
  className?: string;
} & Omit<LucideProps, "ref" | "size">;

export function Icon({ name, size = "md", strokeWidth = 1.75, className, ...rest }: IconProps) {
  const px = typeof size === "number" ? size : ICON_TOKENS[size];
  const brandProps = { size: px, className, ...(rest as React.SVGProps<SVGSVGElement>) };
  if (name === "twitter" || name === "x") return <XBrand {...brandProps} />;
  if (name === "github") return <GithubBrand {...brandProps} />;
  if (name === "linkedin") return <LinkedinBrand {...brandProps} />;
  if (name === "dribbble") return <DribbbleBrand {...brandProps} />;
  if (name === "npm") return <NpmBrand {...brandProps} />;
  const C = map[name];
  if (!C) return null;
  return (
    <C
      size={px}
      strokeWidth={strokeWidth}
      aria-hidden="true"
      focusable="false"
      className={className}
      {...rest}
    />
  );
}
