import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/primitives/Icon";
import type { HueAccentId as Accent } from "@/lib/accents";

export function Ticket({
  accent,
  yr,
  title,
  sub,
  tag,
  href,
}: {
  accent: Accent;
  yr: ReactNode;
  title: ReactNode;
  sub: ReactNode;
  tag: ReactNode;
  href: string;
}) {
  return (
    <a className={`ticket ticket-${accent}`} href={href} target="_blank" rel="noreferrer">
      <span className="ticket-yr">{yr}</span>
      <span className="ticket-body">
        <span className="ticket-title">{title}</span>
        <span className="ticket-sub">{sub}</span>
      </span>
      <span className="ticket-tag">{tag}</span>
      <Icon name="arrow" size={16} className="ticket-arrow" />
    </a>
  );
}

export function PostCard({
  accent,
  n,
  tag,
  read,
  title,
  sub,
  href,
}: {
  accent: Accent;
  n: ReactNode;
  tag: ReactNode;
  read: ReactNode;
  title: ReactNode;
  sub: ReactNode;
  href: string;
}) {
  return (
    <Link className={`post-card post-${accent}`} href={href}>
      <div className="post-head">
        <span className="post-num">{n}</span>
        <span className="post-tag">
          {tag} · {read}
        </span>
      </div>
      <h3 className="post-title">{title}</h3>
      <p className="post-sub">{sub}</p>
      <div className="post-foot">
        <span>read essay</span>
        <Icon name="arrow" size={14} />
      </div>
    </Link>
  );
}
