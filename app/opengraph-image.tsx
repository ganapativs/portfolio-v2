import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Ganapati V S — engineer and engineering leader, in Bengaluru.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOG({
    eyebrow: "no. 01 · the masthead",
    title: "Eleven years, one company. Still writing code.",
    accent: "terracotta",
  });
}
