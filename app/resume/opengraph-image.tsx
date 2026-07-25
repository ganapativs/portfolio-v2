import { renderOG, OG_SIZE, OG_CONTENT_TYPE } from "@/lib/og";

export const alt = "Resume — Ganapati V S, VP Technology at Tracxn.";
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

export default async function Image() {
  return renderOG({
    eyebrow: "resume",
    title: "Engineer turned VP. Ten years one place. One page, printable.",
    accent: "rose",
  });
}
