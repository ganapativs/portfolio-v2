import { PrintCV } from "@/components/schematic/PrintCV";
import {
  CAREER_YEARS,
  identity,
  PUBLIC_WORK,
  roles,
  flagships,
  education,
  skills,
  speaking,
  lastUpdatedISO,
} from "@/lib/resume";
import { getStars, STAR_FLOOR } from "@/lib/github";
import { JsonLd, profilePageSchema, routeBreadcrumb, SITE_URL } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/metadata";
import { ROLE_COPY, SUMMARY } from "./copy";

export const metadata = pageMetadata({
  title: "Résumé",
  path: "/resume",
  description: `Résumé of Ganapati V S. VP, Technology at Tracxn. ${CAREER_YEARS} years, four promotions. The AI assistant and docs portal, microcharts, and open source going back to 2013.`,
  ogType: "profile",
});

// Tracxn holds five of the roles; the two before it are their own short block.
const TRACXN = roles.filter((r) => r.org === "Tracxn");
const EARLIER = roles.filter((r) => r.org !== "Tracxn");
// The open-source column is a digest, not the catalogue — the four that people
// actually turn up for.
const PICKED = ["@microcharts/react", "bttn.css", "react-spectrum", "priority-browser-extension"];
const OSS = PICKED.map((n) => flagships.find((f) => f.name === n)).filter((f) => f !== undefined);
const DEGREE = education.find((e) => e.kind === "degree");

export default async function ResumePage() {
  const stars = await getStars();
  return (
    <>
      <JsonLd
        data={[profilePageSchema(`${SITE_URL}/resume`), routeBreadcrumb("Résumé", "/resume")]}
      />

      <section className="cv" id="resume" data-sec="résumé">
        <div className="cv-topline">
          <span className="cv-stamp">Résumé · one or two sheets on print</span>
          <PrintCV />
        </div>

        <header className="cv-head">
          <div>
            <h1 className="cv-name">{identity.name}</h1>
            <div className="cv-role">
              {identity.jobTitle} at {identity.worksFor.name} · {identity.location}
            </div>
          </div>
          <div className="cv-contact">
            <div>
              <a href={`mailto:${identity.email}`} data-analytics="mail:resume">
                {identity.email}
              </a>
            </div>
            <div>
              <a href={SITE_URL} data-analytics="cta:resume.site">
                meetguns.com
              </a>
            </div>
            <div>
              <a href="https://github.com/ganapativs" data-analytics="cta:resume.github">
                github.com/ganapativs
              </a>
            </div>
          </div>
        </header>

        <p className="cv-summary">{SUMMARY}</p>

        <div className="cv-cols">
          <div className="cv-main">
            <h2 className="cv-h2">Experience</h2>
            <div className="cv-block">
              <div className="cv-org">{identity.worksFor.name}</div>
              <div className="cv-orgmeta">2015 to now · Bengaluru · four promotions</div>
              {TRACXN.map((r, i) => (
                <div key={r.role} className={`cv-job${i === 0 ? " cv-job--now" : ""}`}>
                  <h3>{r.role}</h3>
                  <div className="cv-range">
                    {r.start} - {r.end}
                  </div>
                  <ul>
                    {(ROLE_COPY[r.role] ?? r.bullets).map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <h2 className="cv-h2">Earlier</h2>
            <div className="cv-block">
              {EARLIER.map((r) => (
                <div key={r.role} className="cv-job">
                  <h3>{r.role}</h3>
                  <div className="cv-range">
                    {r.org} · {r.location} · {r.start} - {r.end}
                  </div>
                  <ul>
                    {(ROLE_COPY[r.role] ?? r.bullets).map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="cv-side">
            <h2 className="cv-h2">Open source</h2>
            <div className="cv-block cv-list">
              {OSS.map((f) => {
                // Live count where GitHub gave us one, otherwise the checked
                // value. Small numbers are left off entirely.
                const n = stars.byRepo[f.repo.split("/").pop() ?? ""] ?? f.stars;
                return (
                  <div key={f.name} className="cv-item">
                    <div className="cv-item-name">
                      <a href={f.repo} data-analytics={`cta:resume.oss.${f.name}`}>
                        {f.name}
                      </a>
                      {n >= STAR_FLOOR ? ` · ${n.toLocaleString("en-US")}★` : ""}
                    </div>
                    <div className="cv-item-note">{f.blurb}</div>
                  </div>
                );
              })}
              <div className="cv-item">
                <div className="cv-item-name">
                  <a
                    href="https://github.com/ganapativs?tab=repositories"
                    data-analytics="cta:resume.all-repos"
                  >
                    and the rest
                  </a>
                </div>
                <div className="cv-item-note">
                  {stars.repos} original public repos, {PUBLIC_WORK.npm} npm packages,{" "}
                  {stars.total.toLocaleString("en-US")} stars between them.
                </div>
              </div>
            </div>

            <h2 className="cv-h2">Skills</h2>
            <div className="cv-block cv-skills">
              {skills.map((g) => (
                <div key={g.label}>
                  <div className="cv-skill-label">{g.label}</div>
                  <div className="cv-skill-items">
                    {g.items.map((it, i) => (
                      <span key={it}>
                        {i > 0 ? ", " : ""}
                        {g.strong?.includes(it) ? <b>{it}</b> : it}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {DEGREE && (
              <>
                <h2 className="cv-h2">Education</h2>
                <div className="cv-block">
                  <div className="cv-org">{DEGREE.title}</div>
                  <div className="cv-item-note">
                    {DEGREE.org} · {DEGREE.range}
                    {DEGREE.detail ? ` · ${DEGREE.detail}` : ""}
                  </div>
                </div>
              </>
            )}

            <h2 className="cv-h2">Speaking</h2>
            {speaking.map((t) => (
              <div key={t.event} className="cv-block cv-item-note">
                {t.event}, {t.place} · {t.year} · {t.detail}
              </div>
            ))}

            <h2 className="cv-h2">Languages</h2>
            <div className="cv-block cv-item-note">English, Hindi, Kannada.</div>
          </div>
        </div>

        <div className="cv-updated">Last updated {lastUpdatedISO}</div>
      </section>
    </>
  );
}
