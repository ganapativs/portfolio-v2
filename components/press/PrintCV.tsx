"use client";
import { useFX } from "@/components/providers/FXProvider";

export function PrintCV() {
  const fx = useFX();
  return (
    <button
      type="button"
      className="cv-print"
      onClick={() => {
        fx?.primary();
        fx?.haptic(8);
        window.print();
      }}
    >
      <span aria-hidden="true">↓</span> Print · save PDF
    </button>
  );
}
