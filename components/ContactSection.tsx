import { Icon } from "@/components/primitives/Icon";
import { Reveal } from "@/components/Reveal";
import { RevealGroup } from "@/components/RevealGroup";

const channels = [
  {
    i: "github",
    l: "github",
    h: "@ganapativs",
    href: "https://github.com/ganapativs",
    accent: "terracotta",
  },
  {
    i: "linkedin",
    l: "linkedin",
    h: "in/ganapativs",
    href: "https://linkedin.com/in/ganapativs",
    accent: "saffron",
  },
  {
    i: "twitter",
    l: "twitter/x",
    h: "@Ganapativs",
    href: "https://x.com/ganapativs",
    accent: "sage",
  },
  {
    i: "dribbble",
    l: "dribbble",
    h: "ganapativs",
    href: "https://dribbble.com/ganapativs",
    accent: "plum",
  },
  { i: "rss", l: "rss", h: "/rss.xml", href: "/rss.xml", accent: "rose" },
  {
    i: "npm",
    l: "npm",
    h: "~ganapativs",
    href: "https://www.npmjs.com/~ganapativs",
    accent: "coffee",
  },
];

export function ContactSection() {
  return (
    <section className="contact-section mega-footer" aria-labelledby="contact-heading">
      <Reveal>
        <div className="mf-banner">
          <div className="mf-banner-left">
            <div className="mf-eyebrow">— say hello,</div>
            <h2 id="contact-heading" className="mf-title">
              Open to a good conversation.
            </h2>
            <p className="mf-sub">
              Hiring, mentoring, architecture, OSS, photography — or anything in between. Replies in
              IST: slowest in March, fastest on Sundays.
            </p>
          </div>
          <a className="mf-cta" href="mailto:vsg.inbox+meetguns@gmail.com">
            <span className="mf-cta-label">vsg.inbox@gmail.com</span>
            <span className="mf-cta-arrow">
              <Icon name="arrow" size={20} />
            </span>
          </a>
        </div>
      </Reveal>

      <RevealGroup stagger={60} className="mf-channels">
        {channels.map((c) => (
          <a
            key={c.l}
            className={`mf-channel mf-${c.accent}`}
            href={c.href}
            target="_blank"
            rel="noreferrer"
          >
            <span className="mf-channel-icon">
              <Icon name={c.i} size={16} />
            </span>
            <span className="mf-channel-text">
              <span className="mf-channel-label">{c.l}</span>
              <span className="mf-channel-handle">{c.h}</span>
            </span>
            <Icon name="arrow" size={13} className="mf-channel-arrow" />
          </a>
        ))}
      </RevealGroup>
    </section>
  );
}
