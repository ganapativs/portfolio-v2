"use client";
import { useFX } from "@/components/providers/FXProvider";
import { track } from "@/lib/analytics";

export function PrintCV() {
  const fx = useFX();
  return (
    <button
      type="button"
      className="cv-print"
      onClick={() => {
        fx?.primary();
        fx?.haptic(8);
        track({ name: "print_cv" });
        window.print();
      }}
    >
      Print · save PDF
    </button>
  );
}
