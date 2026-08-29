import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Ganapati V S, full-stack engineer with a design mind, in Bengaluru.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOG({
    eyebrow: "no. 01 · the masthead",
    title: "Twelve years of shipping. Still writing code.",
    accent: "amber",
  });
}
