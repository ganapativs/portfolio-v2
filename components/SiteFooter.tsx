import Link from "next/link";
import { Icon } from "@/components/primitives/Icon";
import { GLogo } from "@/components/primitives/GLogo";
import { KarnatakaMap } from "@/components/primitives/KarnatakaMap";
import { Reveal } from "@/components/Reveal";

const YEAR_FROM = 2013;
const YEAR_TO = new Date().getUTCFullYear();

export function SiteFooter() {
  return (
    <footer className="site-footer container-narrow">
      <Reveal>
        <div className="sf-letterhead" aria-label="Site footer">
          <div className="sf-rule" aria-hidden="true">
            <span className="sf-rule-line" />
            <span className="sf-rule-dot" />
            <span className="sf-rule-line" />
          </div>

          <div className="sf-row">
            <div className="sf-brand">
              <div className="sf-brand-row">
                <Link href="/" className="sf-seal" aria-label="meetguns home">
                  <span className="sf-seal-ring" aria-hidden="true" />
                  <span className="sf-seal-glyph">
                    <GLogo size={28} />
                  </span>
                </Link>
                <span className="sf-brand-name flourish">Ganapati V S</span>
                <svg className="sf-brand-swash" viewBox="0 0 160 22" aria-hidden="true">
                  <path
                    d="M2 14 C 24 4, 50 20, 78 12 S 130 4, 158 10"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                    strokeLinecap="round"
                  />
                  <circle cx="158" cy="10" r="1.6" fill="currentColor" />
                </svg>
              </div>
              <div className="sf-brand-kannada" lang="kn" aria-label="Ganapati V S, in Kannada">
                <span>ಗಣಪತಿ ವಿ ಎಸ್</span>
                <span className="sf-brand-karnataka" aria-hidden="true">
                  <KarnatakaMap />
                </span>
              </div>
            </div>

            <div className="sf-meta" aria-label="colophon">
              <span className="sf-meta-line sf-meta-brand">meetguns · est. {YEAR_FROM}</span>
              <span className="sf-meta-line">
                © {YEAR_FROM} — {YEAR_TO} · made in india <span aria-hidden="true">🇮🇳</span>
              </span>
              <Link className="sf-meta-link" href="/resume">
                <Icon name="arrowDown" size={11} /> /resume
              </Link>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
              <a className="sf-meta-link" href="/rss.xml" rel="noreferrer">
                <Icon name="rss" size={11} /> /rss.xml
              </a>
            </div>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
