import Link from "next/link";
import type { Metadata } from "next";
import { EXPERIMENTS } from "./content";

export const metadata: Metadata = {
  title: "Lab",
  robots: { index: false, follow: false },
};

/**
 * The index of the WebGPU experiments.
 *
 * Not part of the drawing and not in the sitemap. Three things are being
 * compared and the only fair way to compare them is one at a time, at size,
 * with what each costs written next to it.
 */
export default function LabPage() {
  return (
    <section className="cv" id="lab" data-sec="lab">
      <div className="cv-topline">
        <span className="cv-stamp">Lab · not part of the sheet</span>
      </div>
      <h1 className="cv-name">Three ways to spend a GPU</h1>
      <p className="cv-summary">
        Each of these puts the same 45 kB of WebGPU runtime into a different figure. They are here
        to be judged one at a time. Nothing links here from the drawing and none of it is indexed.
      </p>
      <div className="rev">
        {EXPERIMENTS.map((e) => (
          <div className="rev-row" key={e.slug}>
            <span className="d">{e.fig}</span>
            <span className="t">
              <Link href={`/lab/${e.slug}`}>{e.title}</Link>
            </span>
            <span className="rt">open</span>
          </div>
        ))}
      </div>
    </section>
  );
}
