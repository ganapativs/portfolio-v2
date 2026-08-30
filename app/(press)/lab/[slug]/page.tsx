import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { EXPERIMENTS } from "../content";
import { LabStage } from "./LabStage";

export const dynamicParams = false;

export function generateStaticParams() {
  return EXPERIMENTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const e = EXPERIMENTS.find((x) => x.slug === slug);
  return { title: e ? `Lab · ${e.title}` : "Lab", robots: { index: false, follow: false } };
}

/**
 * One experiment, at size, with what it does and what it costs written beside
 * it. The figure is the real component, wired the way it would ship.
 */
export default async function LabDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = EXPERIMENTS.find((x) => x.slug === slug);
  if (!e) notFound();

  return (
    <section className="lab" id="lab" data-sec="lab">
      <div className="cv-topline">
        <span className="cv-stamp">
          <Link href="/lab">← lab</Link> · {e.fig}
        </span>
      </div>

      <h1 className="cv-name">{e.title}</h1>
      <p className="cv-summary">{e.claim}</p>

      <div className="lab-stage">
        <LabStage slug={e.slug} />
      </div>

      <div className="lab-cols">
        <div>
          <h2 className="cv-h2">What it adds</h2>
          <ul className="lab-list">
            {e.gains.map((g) => (
              <li key={g}>{g}</li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="cv-h2">What it costs</h2>
          <ul className="lab-list">
            {e.costs.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
