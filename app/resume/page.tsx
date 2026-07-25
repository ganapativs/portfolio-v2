import Link from "next/link";
import { Pill } from "@/components/primitives/Pill";
import { AmbientBlob } from "@/components/primitives/AmbientBlob";
import { Icon } from "@/components/primitives/Icon";
import { PrintButton } from "@/components/PrintButton";
import {
  identity,
  roles,
  selectedProjects,
  flagships,
  education,
  skills,
  lastUpdatedISO,
  type SocialKind,
} from "@/lib/resume";
import { JsonLd, profilePageSchema, routeBreadcrumb, SITE_URL } from "@/lib/jsonld";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Resume",
  path: "/resume",
  description:
    "Resume — Ganapati V S. Vice President, Technology at Tracxn. Ten years, four promotions. AI assistant and docs portal, microcharts, a decade of OSS.",
  ogType: "profile",
});

const SOCIAL_ICON: Record<SocialKind, string> = {
  github: "github",
  linkedin: "linkedin",
  twitter: "twitter",
  dribbble: "dribbble",
  npm: "npm",
  mail: "mail",
};

// Recruiter-facing resume — compact, 1–2 pages on print.
// Long-form portfolio depth lives on /work + /about, not here.

const SUMMARY =
  "Vice President, Technology at Tracxn — ten years, four promotions, from first-week engineer to executive scope. Architected and shipped the company's customer-facing AI assistant and the API documentation portal it lives in, end-to-end: an OpenAPI-driven docs pipeline, intent-based routing across multiple model providers, a tool and skills layer, versioned prompts behind an evaluation harness, audit-grade logging, and an OAuth-protected MCP server for AI coding clients. Author of @microcharts/react (106 word-sized React chart types, zero dependencies, accessible by default) and decade-long primary maintainer of the internal React component library every product surface depends on. Public catalogue of 55 original repos, 2,400+ stars, 15 npm packages. Partners across product, design, data and platform leadership; owns the engineering review queue and places the next technology bets.";

export default function ResumePage() {
  return (
    <div className="surface surface--resume" data-route="resume">
      <AmbientBlob />
      <JsonLd
        data={[profilePageSchema(`${SITE_URL}/resume`), routeBreadcrumb("Resume", "/resume")]}
      />
      <div className="container-narrow">
        <div className="surface-pill rs-pill-row">
          <Pill warm>resume · 1–2 pages on print</Pill>
          <PrintButton />
        </div>

        <header className="rs-header">
          <h1 className="surface-h1 rs-h1">
            <span className="rs-name">{identity.name}</span>
          </h1>
          <div className="rs-title-line">
            <span className="rs-job-title">{identity.jobTitle}</span>
            <span className="rs-sep" aria-hidden="true">
              ·
            </span>
            <a
              href={identity.worksFor.url}
              target="_blank"
              rel="noreferrer"
              className="ulink rs-employer"
            >
              {identity.worksFor.name}
            </a>
            <span className="rs-sep" aria-hidden="true">
              ·
            </span>
            <span className="rs-loc">{identity.location}</span>
          </div>
          {identity.orgTagline && <p className="rs-org-tagline">{identity.orgTagline}</p>}
          <ul className="rs-contact-row">
            {identity.social.map((s) => (
              <li key={s.kind}>
                <a
                  href={s.href}
                  target={s.kind === "mail" ? undefined : "_blank"}
                  rel="noreferrer"
                  className="rs-contact-link"
                  aria-label={`${s.kind}: ${s.label}`}
                >
                  <Icon name={SOCIAL_ICON[s.kind]} size="sm" />
                  <span>{s.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </header>

        <section className="rs-section rs-section-compact">
          <h2 className="rs-h2">Summary</h2>
          <p className="rs-summary">{SUMMARY}</p>
        </section>

        <section className="rs-section rs-section-compact">
          <h2 className="rs-h2">Experience</h2>
          <div className="rs-exp-stack">
            {roles
              .filter((r) => r.org === "Tracxn")
              .map((r) => (
                <article key={`${r.role}-${r.start}`} className="rs-exp">
                  <header className="rs-exp-head">
                    <div className="rs-exp-line1">
                      <span className="rs-exp-role">{r.role}</span>
                      <span className="rs-exp-sep" aria-hidden="true">
                        ·
                      </span>
                      <span className="rs-exp-org">{r.org}</span>
                      {r.location && (
                        <>
                          <span className="rs-exp-sep" aria-hidden="true">
                            ·
                          </span>
                          <span className="rs-exp-loc">{r.location}</span>
                        </>
                      )}
                    </div>
                    <div className="rs-exp-dates">
                      {r.start} — {r.end}
                    </div>
                  </header>
                  <ul className="rs-exp-bullets">
                    {r.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                </article>
              ))}
            <p className="rs-exp-earlier">
              <span className="rs-exp-earlier-label">Earlier:</span> UI/UX Engineer · InvenZone,
              Mumbai (2014 – 2015) · Web Frontend Intern · Thinkappz, Bengaluru (2013 – 2014).
            </p>
          </div>
        </section>

        <section className="rs-section rs-section-compact">
          <h2 className="rs-h2">Selected projects</h2>
          <p className="rs-meta-note">
            Long-form on{" "}
            <Link href="/work" className="ulink">
              /work
            </Link>
            .
          </p>
          <ul className="rs-projects">
            {selectedProjects.map((p) => (
              <li key={p.title} className="rs-project">
                <div className="rs-project-head">
                  <span className="rs-project-title">{p.title}</span>
                  <span className="rs-project-range">{p.range}</span>
                </div>
                <p className="rs-project-digest">{p.digest}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rs-section rs-section-compact">
          <h2 className="rs-h2">Open source</h2>
          <p className="rs-meta-note">
            <a
              href="https://github.com/ganapativs"
              target="_blank"
              rel="noreferrer"
              className="ulink"
            >
              github.com/ganapativs
            </a>{" "}
            · 55 original repos · 2,400+ ★ ·{" "}
            <a
              href="https://www.npmjs.com/~ganapativs"
              target="_blank"
              rel="noreferrer"
              className="ulink"
            >
              15 npm packages
            </a>
          </p>
          <ul className="rs-oss-compact">
            {flagships.slice(0, 4).map((p) => (
              <li key={p.name} className="rs-oss-compact-item">
                <a
                  href={p.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="ulink rs-oss-compact-name"
                >
                  {p.name}
                </a>
                {p.stars > 0 && (
                  <span className="rs-oss-compact-stars">{p.stars.toLocaleString()} ★</span>
                )}
                <span className="rs-oss-compact-year">{p.year}</span>
                <span className="rs-oss-compact-blurb">— {p.blurb}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rs-section rs-section-compact">
          <h2 className="rs-h2">Education</h2>
          <ul className="rs-edu-compact">
            {education
              .filter((e) => e.kind === "degree" || e.kind === "award")
              .map((e) => (
                <li key={`${e.title}-${e.org}`}>
                  <span className="rs-edu-compact-title">{e.title}</span> ·{" "}
                  <span className="rs-edu-compact-org">{e.org}</span> ·{" "}
                  <span className="rs-edu-compact-range">{e.range}</span>
                </li>
              ))}
          </ul>
        </section>

        <section className="rs-section rs-section-compact">
          <h2 className="rs-h2">Skills</h2>
          <div className="rs-skill-compact">
            {skills.map((g) => {
              const strong = g.strong ?? [];
              const rest = g.items.filter((i) => !strong.includes(i));
              return (
                <div key={g.label} className="rs-skill-compact-row">
                  <span className="rs-skill-compact-label">{g.label}:</span>{" "}
                  <span className="rs-skill-compact-items">
                    {strong.length > 0 && (
                      <span className="rs-skill-compact-strong">{strong.join(" · ")}</span>
                    )}
                    {strong.length > 0 && rest.length > 0 && " · "}
                    {rest.join(" · ")}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <footer className="rs-footer">
          <div className="rs-footer-meta">
            <Link href="/" className="ulink">
              meetguns.com
            </Link>
            <span className="rs-sep" aria-hidden="true">
              ·
            </span>
            <span>Last updated {lastUpdatedISO}</span>
          </div>
          <PrintButton className="print-hide" />
        </footer>
      </div>
    </div>
  );
}
