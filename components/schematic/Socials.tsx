import { identity } from "@/lib/resume";

/**
 * The social marks, drawn from each service's own brand path rather than from a
 * generic icon set, because a wrong GitHub cat is more obviously wrong than no
 * icon at all.
 *
 * LinkedIn included: the standard boxed "in" mark, at the same 24-unit grid as
 * the rest, so the row is five marks of one weight rather than four marks and a
 * word.
 */
const PATHS: Record<string, { d: string; size: number }> = {
  github: {
    size: 15,
    d: "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  },
  twitter: {
    size: 13,
    d: "M14.234 10.162 22.977 0h-2.072l-7.591 8.824L7.251 0H.258l9.168 13.343L.258 24H2.33l8.016-9.318L16.749 24h6.993zm-2.837 3.299-.929-1.329L3.076 1.56h3.182l5.965 8.532.929 1.329 7.754 11.09h-3.182z",
  },
  dribbble: {
    size: 15,
    d: "M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.814zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702-1.81-1.61-4.19-2.586-6.795-2.586-.825 0-1.63.1-2.4.285zm10.335 3.483c-.218.29-1.935 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z",
  },
  npm: {
    size: 15,
    d: "M1.763 0C.786 0 0 .786 0 1.763v20.474C0 23.214.786 24 1.763 24h20.474c.977 0 1.763-.786 1.763-1.763V1.763C24 .786 23.214 0 22.237 0zM5.13 5.323l13.837.019-.009 13.836h-3.464l.01-10.382h-3.456L12.04 19.17H5.113z",
  },
  linkedin: {
    size: 14,
    d: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z",
  },
};

const LABEL: Record<string, string> = {
  github: "GitHub",
  twitter: "X",
  dribbble: "Dribbble",
  npm: "npm",
  linkedin: "LinkedIn",
};

// identity.social is the source of truth for the hrefs, but Dribbble is not on
// the résumé's list (it is a portfolio, not a professional reference) so it is
// added here where the page, not the CV, is doing the talking.
const DRIBBBLE = "https://dribbble.com/ganapativs";

const by = (kind: string) => identity.social.find((s) => s.kind === kind);

export function Socials({ compact = false }: { compact?: boolean }) {
  const order: { kind: string; href: string }[] = [
    { kind: "github", href: by("github")?.href ?? "" },
    { kind: "linkedin", href: by("linkedin")?.href ?? "" },
    { kind: "twitter", href: by("twitter")?.href ?? "" },
    // Dribbble is a portfolio rather than a professional reference, so it is
    // not on the résumé's list and it drops out of the compact row.
    ...(compact ? [] : [{ kind: "dribbble", href: DRIBBBLE }]),
    { kind: "npm", href: by("npm")?.href ?? "" },
  ].filter((s) => s.href);

  return (
    <div className="socials">
      {order.map(({ kind, href }) => {
        const icon = PATHS[kind];
        const size = compact ? icon.size - 2 : icon.size;
        return (
          <a
            key={kind}
            className="soc"
            href={href}
            aria-label={LABEL[kind]}
            rel="me noopener"
            target="_blank"
            data-analytics={`cta:social.${LABEL[kind]}`}
          >
            <svg
              width={size}
              height={size}
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d={icon.d} />
            </svg>
          </a>
        );
      })}
    </div>
  );
}
