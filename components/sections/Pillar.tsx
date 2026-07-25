import type { ReactNode } from "react";
import type { HueAccentId as Accent } from "@/lib/accents";

export function Pillar({
  accent,
  num,
  title,
  desc,
}: {
  accent: Accent;
  num: ReactNode;
  title: ReactNode;
  desc: ReactNode;
}) {
  return (
    <div className={`pillar stat-${accent}`}>
      <div className="pillar-num">{num}</div>
      <h3 className="pillar-title">{title}</h3>
      <p className="pillar-desc">{desc}</p>
    </div>
  );
}
