import type { Metadata } from "next";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Career } from "@/components/schematic/Career";
import { CopyEmail } from "@/components/schematic/CopyEmail";
import { Exploded } from "@/components/schematic/Exploded";
import { PartsList } from "@/components/schematic/PartsList";
import { Portrait } from "@/components/schematic/Portrait";
import { SgbFigure } from "@/components/schematic/SgbFigure";
import { Socials } from "@/components/schematic/Socials";
import { SpectrumDemo } from "@/components/schematic/SpectrumDemo";

/**
 * The three heavy figures load as their own chunks.
 *
 * Between them the specimen tray (25 static chart builds so a shuffle can pick
 * eight), the pipeline and the loupe were 60 kB gzipped in this route's chunk
 * group. Next records `next/link`'s client module against that group, so every
 * other route that renders a Link pulled the whole thing in: /resume was
 * downloading and executing all of it and rendering none of it, and a blog post
 * with no charts in it was shipping the entire chart library.
 *
 * `ssr` stays on for all three. Specimens renders a fixed first eight on the
 * server before it reshuffles, the pipeline's server markup IS its no-flash
 * guarantee (the sketch state in the markup equals the state the JS
 * initialises to), and the loupe's sentence is content.
 */
const Loupe = dynamic(() => import("@/components/schematic/Loupe").then((m) => m.Loupe));
const Pipeline = dynamic(() => import("@/components/schematic/Pipeline").then((m) => m.Pipeline));
const Specimens = dynamic(() =>
  import("@/components/schematic/Specimens").then((m) => m.Specimens),
);
import { published } from "@/lib/posts";
import { CAREER_YEARS, PUBLIC_WORK, speaking } from "@/lib/resume";
import { getStars } from "@/lib/github";
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

export default async function HomePage() {
  // The same daily-revalidated fetch the résumé makes, so the two pages cannot
  // print different counts of the same account.
  const stars = await getStars();
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
            Full-stack engineer with a design mind. {CAREER_YEARS} years in, based in Bengaluru.
          </p>
          {/* The internship was at Thinkappz in 2013. Tracxn was 2015, as a
              software engineer, and three earlier drafts of this page got that
              wrong in four places at once. */}
          <p>
            I joined Tracxn in 2015 as a software engineer and I am{" "}
            <strong>VP of Technology</strong> there now. The job is mostly the team these days,
            though most weeks still have some code in them.
          </p>
          <p>
            Right now that code is a customer-facing <span className="amber">AI assistant</span>{" "}
            over private-market data, and <span className="amber">106 word-sized chart types</span>{" "}
            built on my own time.
          </p>
          <p className="intro-ask">
            Open to talking about architecture, hiring loops and open source.
          </p>
          {/* One row. The chip and the five marks are both "how to reach me",
              and stacked they cost the introduction a whole line of height it
              was spending against the portrait beside it. */}
          <div className="intro-actions">
            <CopyEmail />
            <Socials />
          </div>
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
          <p className="meta">
            {stars.repos} public repos · {stars.total.toLocaleString("en-US")} stars ·{" "}
            {PUBLIC_WORK.npm} npm packages
          </p>
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
