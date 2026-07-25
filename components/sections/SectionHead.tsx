import type { ReactNode } from "react";

type SectionHeadSize = "lg" | "md" | "sm";
type SectionHeadVariant = "borderless" | "centered";

export function SectionHead({
  children,
  meta,
  size = "md",
  variant,
}: {
  children: ReactNode;
  meta?: ReactNode;
  size?: SectionHeadSize;
  variant?: SectionHeadVariant;
}) {
  const parts = ["section-head"];
  if (size !== "md") parts.push(`section-head--${size}`);
  if (variant) parts.push(`section-head--${variant}`);
  return (
    <div className={parts.join(" ")}>
      <h2>{children}</h2>
      {meta && <span className="meta">{meta}</span>}
    </div>
  );
}
