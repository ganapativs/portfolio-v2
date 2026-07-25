"use client";
import { useFX } from "@/components/providers/FXProvider";
import { Icon } from "@/components/primitives/Icon";

export function PrintButton({
  label = "Print or save as PDF",
  className,
}: {
  label?: string;
  className?: string;
}) {
  const fx = useFX();
  return (
    <button
      type="button"
      className={`btn secondary print-hide print-button ${className ?? ""}`}
      onClick={() => {
        fx?.primary();
        fx?.haptic(8);
        if (typeof window !== "undefined") window.print();
      }}
      aria-label={label}
    >
      <Icon name="arrowDown" size="sm" />
      <span>Print · save PDF</span>
    </button>
  );
}
