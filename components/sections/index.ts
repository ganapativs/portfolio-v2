export { SectionHead } from "./SectionHead";
export { StatBlock } from "./StatBlock";
export { Pillar } from "./Pillar";
export { Ticket, PostCard } from "./AccentCards";
export { accentAt, type HueAccentId as Accent } from "@/lib/accents";
export const ordinalLabel = (i: number) => String(i + 1).padStart(2, "0");
