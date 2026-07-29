import type { Metadata } from "next";
import Link from "next/link";
import { Folio } from "@/components/press/Folio";
import { Masthead } from "@/components/press/Masthead";
import { PressRun } from "@/components/press/PressRun";
import { PortraitCoin } from "@/components/press/PortraitCoin";
import { InkLibrary } from "@/components/press/InkLibrary";
import { PressFooter } from "@/components/press/PressFooter";
import { published } from "@/lib/posts";
import { identity, speaking } from "@/lib/resume";
import { JsonLd, profilePageSchema, SITE_URL } from "@/lib/jsonld";
import {
  ROLES,
  LEDGER,
  SOCIAL,
  STRIP_BARS,
  SPIKE_BARS,
  BTTN_STARS,
  STACK,
  ASSISTANT,
} from "./content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const TEASERS = published.slice(0, 3);

export default function HomePage() {
  return (
    <div className="home">
      <JsonLd data={[profilePageSchema(SITE_URL)]} />
      <Folio />

      <header className="wrap masthead">
        <div className="name-wrap">
          <Masthead name={identity.name} />
          <div className="stamp-row">
            <span className="stamp">VP, Technology</span>
            <span className="stamp-meta">Tracxn · Bengaluru · eleven years, one company</span>
          </div>
        </div>

        <div className="lede-row">
          <p className="lede">
            I&apos;ve been at Tracxn since 2015. I joined as an engineer and I run part of
            technology there now. Most weeks I&apos;m still writing code.
          </p>
          <p className="note">
            Bengaluru.
            <br />
            Public work since 2013.
            <br />
            Replies in IST: slowest in March, fastest on Sundays.
          </p>
        </div>

        <div className="kn-row">
          <div className="kn-name">
            <span className="kn-ghost" aria-hidden="true">
              ಗಣಪತಿ ವಿ ಎಸ್
            </span>
            <span className="kn-real">ಗಣಪತಿ ವಿ ಎಸ್</span>
          </div>
          <div className="made-in">Karnataka · made in India</div>
        </div>
      </header>

      <div className="wrap home-main">
        {/* ---- The long one ------------------------------------------------ */}
        <section id="work" data-section="the long one">
          <div className="sechead-open">
            <h2>The long one</h2>
            <p className="standfirst">
              Eleven years at Tracxn while the industry moved every eighteen months. Wind the press
              back and the years come off one at a time.
            </p>
          </div>

          <PressRun />

          <div className="roles">
            {ROLES.map((r) => (
              <article
                key={r.title}
                className={`role${r.now ? " role--now" : ""}${r.before ? " role--before" : ""}`}
              >
                <div className="role-era">{r.era}</div>
                <h3 className="role-title">{r.title}</h3>
                <p className="role-body">{r.body}</p>
                {r.aside && <p className="role-body role-body--live">{r.aside}</p>}
              </article>
            ))}
          </div>

          {/* What the recent work is actually built out of. Ten names, not the
              résumé's full list — that lives on /resume. */}
          <div className="stack">
            <span className="stack-label">Working with</span>
            <ul className="stack-list">
              {STACK.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ---- Things I made ----------------------------------------------- */}
        <section data-section="things I made">
          <div className="sechead">
            <h2>Things I made</h2>
            <span className="sechead-meta">55 public repos · 15 npm packages</span>
          </div>

          {/* The lead runs full measure, above the two-up. It is the only block
              on the page that argues rather than lists, so it gets the room. */}
          <article className="made-lead">
            <div className="made-head">
              <a className="made-title" href={ASSISTANT.href}>
                {ASSISTANT.name}
              </a>
              <span className="made-meta made-meta--live">{ASSISTANT.meta}</span>
            </div>
            <p className="made-body made-lead-open">{ASSISTANT.what}</p>
            <p className="made-body">{ASSISTANT.how}</p>
            <p className="made-body">{ASSISTANT.extension}</p>
            <p className="made-body made-body--quiet">{ASSISTANT.caveat}</p>
          </article>

          <div className="made">
            <article>
              <div className="made-head">
                <a className="made-title" href="https://microcharts.dev">
                  microcharts
                </a>
                <span className="made-meta made-meta--live">2026 · microcharts.dev</span>
              </div>
              <p className="made-body">
                106 word-sized chart types for React, small enough to sit inside a sentence or a
                table cell. Zero runtime dependencies, accessible by default. Entirely my own time.
              </p>
              <span className="strip" aria-hidden="true">
                {STRIP_BARS.map((h, i) => (
                  <i key={i} style={{ ["--h" as string]: `${h}%`, ["--i" as string]: i }} />
                ))}
              </span>
              <div className="made-cap">One bar per type</div>
            </article>

            <article>
              <div className="made-head">
                <a className="made-title" href="https://github.com/ganapativs/bttn.css">
                  bttn.css
                </a>
                <span className="made-meta">
                  2016 · {BTTN_STARS.toLocaleString("en-US")} stars
                  <span className="spark" aria-hidden="true">
                    {SPIKE_BARS.map((h, i) => (
                      <i key={i} style={{ ["--h" as string]: `${h}%` }} />
                    ))}
                  </span>
                </span>
              </div>
              <p className="made-body">
                A CSS button library. Product Hunt picked it up in 2016 and it&apos;s still in
                people&apos;s projects. Most of those stars came from a week I wasn&apos;t
                expecting.
              </p>
              <p className="made-body made-body--quiet">
                Ten years on, it is still the thing strangers write to me about.
              </p>
            </article>
          </div>

          <div className="ledger">
            <div className="ledger-head" aria-hidden="true">
              <span className="ledger-year">Year</span>
              <span className="ledger-name">Name</span>
              <span className="ledger-what">What it is</span>
            </div>
            {LEDGER.map((row) => (
              <div key={row.name} className="ledger-row">
                <span className="ledger-year">{row.year}</span>
                <span className="ledger-name">
                  {row.href ? <a href={row.href}>{row.name}</a> : row.name}
                </span>
                <span className="ledger-what">{row.what}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ---- Off-screen --------------------------------------------------- */}
        <section id="about" data-section="off-screen" className="offscreen">
          <figure className="plate-fig">
            <PortraitCoin />
            <figcaption className="plate-cap">A decade of public work, sampled as dots</figcaption>
          </figure>
          <div className="off-body">
            <h2>Off-screen</h2>
            <p className="off-lede">
              Travel and photography, mostly together. Soccer, badminton, the occasional video game.
              English, Hindi, Kannada.
            </p>
            <p className="off-quiet">
              I still write code most weeks. The AI tooling made it fast enough to get from an idea
              to something real that I came back to the keyboard.
            </p>
            <p className="off-edu">
              BE, Computer Science · RNSIT, Bengaluru · 2011–2014
              <br />
              College football team
            </p>
          </div>
        </section>

        {/* ---- Writing ------------------------------------------------------ */}
        <section id="writing" data-section="writing">
          <div className="sechead">
            <h2>Writing</h2>
            <Link className="sechead-meta" href="/blog">
              All posts →
            </Link>
          </div>
          <div className="teasers">
            {TEASERS.map((p) => (
              <Link key={p.slug} className="teaser" href={`/blog/${p.slug}`}>
                <span className="teaser-read">{p.read}</span>
                <span className="teaser-title">{p.title}</span>
                <span className="teaser-sub">{p.spoiler}</span>
              </Link>
            ))}
          </div>

          {/* Talks belong next to writing — same job, different room. */}
          {speaking.map((t) => (
            <p key={t.event} className="spoke">
              <span className="spoke-label">Spoke at</span> {t.event}, {t.place} ·{" "}
              <span className="spoke-year">{t.year}</span> — {t.detail}
            </p>
          ))}
        </section>

        {/* ---- Say hello ---------------------------------------------------- */}
        <section data-section="say hello" className="hello">
          <h2>Say hello.</h2>
          <p>
            Hiring, mentoring, architecture, open source. Replies in IST: slowest in March, fastest
            on Sundays.
          </p>
          <a className="hello-mail" href={`mailto:${identity.email}`}>
            {identity.email}
          </a>
          <div className="hello-links">
            {SOCIAL.map((s) => (
              <a key={s.href} href={s.href} rel="me">
                {s.label}
              </a>
            ))}
            <Link href="/resume">Résumé</Link>
            <span className="quiet">all ganapativs</span>
          </div>
        </section>

        <InkLibrary />
      </div>

      <PressFooter />
    </div>
  );
}
