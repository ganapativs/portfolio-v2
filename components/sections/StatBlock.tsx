import type { ReactNode } from "react";
import type { HueAccentId as Accent } from "@/lib/accents";

export function StatBlock({
  accent,
  big,
  unit,
  cap,
  sub,
  long,
}: {
  accent: Accent;
  big: ReactNode;
  unit?: ReactNode;
  cap: ReactNode;
  sub?: ReactNode;
  long?: boolean;
}) {
  return (
    <div className={`stat-block stat-${accent}${long ? " is-long" : ""}`}>
      <div className="stat-big">
        {big}
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
      <div className="stat-cap">{cap}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}
