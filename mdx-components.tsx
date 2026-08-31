import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/mdx/CodeBlock";
import { ZoomImage } from "@/components/mdx/ZoomImage";
import { CanIUse } from "@/components/mdx/CanIUse";
import { Iframe } from "@/components/mdx/Iframe";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    pre: CodeBlock,
    // `width`/`height` are stamped on by the remarkImageSize plugin in
    // next.config.ts, which reads the file at compile time. They arrive here as
    // ordinary props and are what stops the essay shifting as an image loads.
    // An image it could not measure passes through undefined, as before.
    img: ({ src, alt, width, height }) => {
      // Empty-string alt is intentionally valid HTML (decorative images);
      // only warn when the prop is omitted entirely.
      if (process.env.NODE_ENV !== "production" && alt === undefined) {
        console.warn(`[mdx] <img> missing alt prop: ${String(src)}`);
      }
      return (
        <ZoomImage
          src={String(src)}
          alt={alt ?? ""}
          width={Number(width) || undefined}
          height={Number(height) || undefined}
        />
      );
    },
    a: ({ href, children, ...rest }) => {
      const external = typeof href === "string" && /^https?:\/\//.test(href);
      return external ? (
        <a href={href} target="_blank" rel="noopener noreferrer nofollow" {...rest}>
          {children}
        </a>
      ) : (
        <a href={href} {...rest}>
          {children}
        </a>
      );
    },
    CanIUse,
    Iframe,
    ...components,
  };
}
