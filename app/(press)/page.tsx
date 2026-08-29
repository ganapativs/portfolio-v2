import type { Metadata } from "next";
import Link from "next/link";
import { Career } from "@/components/schematic/Career";
import { CopyEmail } from "@/components/schematic/CopyEmail";
import { Exploded } from "@/components/schematic/Exploded";
import { Loupe } from "@/components/schematic/Loupe";
import { PartsList } from "@/components/schematic/PartsList";
import { Pipeline } from "@/components/schematic/Pipeline";
import { Portrait } from "@/components/schematic/Portrait";
import { SgbFigure } from "@/components/schematic/SgbFigure";
import { Socials } from "@/components/schematic/Socials";
import { Specimens } from "@/components/schematic/Specimens";
import { SpectrumDemo } from "@/components/schematic/SpectrumDemo";
import { published } from "@/lib/posts";
import { speaking } from "@/lib/resume";
import {
  JsonLd,
  employmentSchema,
  profilePageSchema,
  projectsSchema,
  SITE_URL,
} from "@/lib/jsonld";
import { ASSISTANT, MICROCHARTS, SGB, SPECTRUM } from "./content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const DATE = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC" });

export default function HomePage() {
  return (
    <>
      {/* The home page absorbed /about and /work, so it carries the schema for
          both: who this is, where he has worked, and what he has shipped. */}
      <JsonLd
        data={[profilePageSchema(SITE_URL), projectsSchema(), employmentSchema()].filter(
          (s) => s !== null,
        )}
      />

      {/* ---- fold 1 · the subject ----------------------------------------
          Short sentences, one idea each, first person, present tense. A person
          reading this has about eight seconds and has read a hundred of these. */}
      <section className="subject" id="subject" data-sec="subject">
        <div className="intro">
          {/* The claim, at size, before anything else. This page had no h1 and
              nothing above 22px: a reader got atmosphere for three seconds and
              then had to go looking for the point. */}
          <h1>I build the interfaces people work in.</h1>
          <p className="intro-lede">
            Full-stack engineer with a design mind. Twelve years in, based in Bengaluru.
          </p>
          <p>
            I started at Tracxn as an intern. I am <strong>VP of Technology</strong> there now. I
            still write code every week.
          </p>
          <p>
            Right now that code is a customer-facing <span className="amber">AI assistant</span>{" "}
            over private-market data, and <span className="amber">106 word-sized chart types</span>{" "}
            I built on my own time.
          </p>
          <p className="intro-ask">
            Open to talking about architecture, hiring loops and open source.
          </p>
          <CopyEmail />
          <Socials />
        </div>

        <Portrait />
      </section>

      {/* ---- fold 2 · the mechanisms ------------------------------------- */}
      <section className="mechs" id="mechanisms" data-sec="figures">
        <article className="panel">
          <span className="p-fig">fig. 1 · exploded view</span>
          <h2>The assistant</h2>
          <p className="meta">{ASSISTANT.meta}</p>
          <Exploded />
          <p className="p-body">
            {ASSISTANT.body}{" "}
            <a
              href={ASSISTANT.href}
              target="_blank"
              rel="noopener"
              data-analytics="cta:project.assistant"
            >
              w.tracxn.com
            </a>
          </p>
        </article>

        <article className="panel">
          <span className="p-fig">fig. 2 · detail callout</span>
          <h2>microcharts</h2>
          <p className="meta">
            {MICROCHARTS.meta} ·{" "}
            <a
              href={MICROCHARTS.site}
              target="_blank"
              rel="noopener"
              data-analytics="cta:project.microcharts"
            >
              microcharts.dev
            </a>{" "}
            ·{" "}
            <a
              href={MICROCHARTS.href}
              target="_blank"
              rel="noopener"
              data-analytics="cta:project.microcharts-github"
            >
              github
            </a>{" "}
            ·{" "}
            <Link
              href="/blog/microcharts-word-sized-charts"
              data-analytics="nav:home.microcharts-post"
            >
              the post
            </Link>
          </p>
          <Loupe />
          <Specimens />
        </article>
      </section>

      <section className="mechs2">
        <article className="panel">
          <span className="p-fig">fig. 3 · running series</span>
          <h2>sgb</h2>
          <p className="meta">
            {SGB.meta} ·{" "}
            <a href={SGB.href} target="_blank" rel="noopener" data-analytics="cta:project.sgb">
              sgb.vercel.app
            </a>
          </p>
          <p className="p-body">{SGB.body}</p>
          <SgbFigure />
        </article>

        <article className="panel">
          <span className="p-fig">fig. 4 · generated specimen</span>
          <h2>react-spectrum</h2>
          <p className="meta">
            {SPECTRUM.meta} ·{" "}
            <a
              href={SPECTRUM.href}
              target="_blank"
              rel="noopener"
              data-analytics="cta:project.react-spectrum"
            >
              github
            </a>{" "}
            ·{" "}
            <a
              href={SPECTRUM.npm}
              target="_blank"
              rel="noopener"
              data-analytics="cta:project.react-spectrum-npm"
            >
              npm
            </a>
          </p>
          <p className="p-body">{SPECTRUM.body}</p>
          <SpectrumDemo />
        </article>
      </section>

      {/* ---- fold 3 · the records ---------------------------------------- */}
      <section className="records" id="work" data-sec="records">
        <div className="panel">
          <span className="p-fig">fig. 5 · dimension record</span>
          <h2>The career, dimensioned</h2>
          <p className="meta">2013 to now · at Tracxn since day one in 2015</p>
          <Career />
        </div>

        <div className="panel">
          <h2 className="sec-label">Parts list</h2>
          <p className="meta">55 public repos · 2,400+ stars · 15 npm packages</p>
          <PartsList />
        </div>

        <div className="panel" id="writing">
          <h2 className="sec-label">Revisions</h2>
          <p className="meta">the written record, newest first</p>
          <div className="rev">
            {published.map((p) => (
              <div className="rev-row" key={p.slug}>
                <span className="d">{DATE.format(new Date(p.date))}</span>
                <span className="t">
                  <Link href={`/blog/${p.slug}`} data-analytics={`nav:home.revision.${p.slug}`}>
                    {p.title}
                  </Link>
                </span>
                <span className="rt">{p.read}</span>
              </div>
            ))}
            {/* A talk is a revision too: same job, different room. */}
            {speaking.map((t) => (
              <div className="rev-row" key={t.event}>
                <span className="d">{t.year}</span>
                <span className="t">
                  {t.event}, {t.place}: {t.detail}
                </span>
                <span className="rt">talk</span>
              </div>
            ))}
          </div>
          <Link className="rev-all" href="/blog" data-analytics="nav:home.all-posts">
            all writing
          </Link>
        </div>
      </section>

      <Pipeline />
    </>
  );
}
