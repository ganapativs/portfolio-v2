"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { KeysHint } from "./KeysHint";
import { Socials } from "./Socials";
import { useFX } from "@/components/providers/FXProvider";
import { identity } from "@/lib/resume";

/** Which sheet of the set this is. The title block of a drawing always says. */
function sheetName(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname === "/resume") return "résumé";
  if (pathname === "/blog") return "writing";
  if (pathname.startsWith("/blog/")) return "essay";
  return "404";
}

// His first day at Tracxn, not the company's. The tenure cell counts from here
// and is the only number in the block that is different every time it is read.
const START = { y: 2015, m: 8 };

function tenure(now: Date): string {
  let y = now.getFullYear() - START.y;
  let m = now.getMonth() - START.m;
  if (m < 0) {
    y -= 1;
    m += 12;
  }
  // Years and months only. Days made the value long enough to wrap its cell,
  // and nobody reads a tenure to the day. "11 yrs · 0 mo" reads as a bug, so
  // a round year is printed as one.
  return m === 0 ? `${y} yrs` : `${y} yrs · ${m} mo`;
}

/**
 * The title block.
 *
 * Not a footer dressed as one: these are cells a real title block carries, and
 * two of them are alive. The clock is the local time where the drawing is being
 * made, and the tenure counts from the first day rather than being typed as a
 * round number.
 *
 * Four short cells and one contact row, and that is deliberate. Everything that
 * was here and is said better elsewhere has gone: the materials list belongs to
 * fig. 5, and a "scale 1:1" cell is a joke that only lands if you already know
 * it. A title block earns its place by being short, and this one has to stay
 * two rows tall at every width.
 *
 * The live cells start blank and fill in after mount. Rendering a clock on the
 * server ships a time that is already wrong, and hydrating over it is a
 * mismatch.
 */
export function TitleBlock() {
  const pathname = usePathname();
  const fx = useFX();
  const [clock, setClock] = useState("");
  const [since, setSince] = useState("");

  // No shortcut on this chip: the header carries the résumé link too now
  // (owner's final call, 2026-09-01) and `r` lives up there, with the control
  // its Shift-hold hint floats over. The registry refuses duplicate keys.

  useEffect(() => {
    // Minutes, not seconds. A ticking second hand in the corner of every page
    // is movement nobody asked for, and it re-rendered this component sixty
    // times a minute to say the same thing.
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kolkata",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    let id = 0;
    const tick = () => {
      const now = new Date();
      setClock(fmt.format(now));
      setSince(tenure(now));
    };
    const start = () => {
      window.clearInterval(id);
      tick();
      id = window.setInterval(tick, 20_000);
    };
    const onVis = () => {
      if (document.hidden) window.clearInterval(id);
      else start();
    };
    start();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <footer id="contact" data-sec="contact" className="tb-wrap">
      <div className="tblock">
        {/* The page's one request, and the first cell of the block rather than
            a slab sitting above it. A title block is where a drawing records
            who to contact, so this belongs inside it; the 1px grid gap that
            separates every other cell is the separator under it. */}
        <a className="tb-say" href={`mailto:${identity.email}`} data-analytics="mail:title-block">
          <span className="tb-say-l">Say hello</span>
          <span className="tb-say-v">{identity.email}</span>
        </a>
        <div className="tb-cell">
          <span className="tb-l">Made by</span>
          <span className="tb-v">{identity.name}</span>
        </div>
        <div className="tb-cell">
          {/* The clock alone. "Bengaluru · 19:55 IST" wrapped its cell on a
              phone, and the city is already on the contact row below. */}
          <span className="tb-l">Local time</span>
          <span className="tb-v mono">{clock || "--:--"} IST</span>
        </div>
        <div className="tb-cell">
          <span className="tb-l">At Tracxn</span>
          <span className="tb-v mono">{since || "…"}</span>
        </div>
        <div className="tb-cell">
          <span className="tb-l">Page</span>
          <span className="tb-v mono">{sheetName(pathname)}</span>
        </div>
        <div className="tb-cell tb-contact">
          <span className="tb-contact-l">
            <span className="tb-l">Made in</span>
            <span className="tb-email">
              India <span aria-hidden="true">🇮🇳</span> · Bengaluru
            </span>
          </span>
          <span className="tb-contact-r">
            <KeysHint />
            {/* The other sheet of the set. The header carries the short way
                to it too; this stays because a title block is where a drawing
                points at its related sheets, and a reader at the foot is
                exactly the reader looking for the next document. */}
            <Link
              href="/resume"
              className="tb-cv"
              aria-current={pathname === "/resume" ? "page" : undefined}
              data-analytics="nav:title-block.resume"
              onClick={() => fx?.nav()}
            >
              {/* A sheet-reference balloon, which is the mark a drawing uses
                  to send you to another sheet. A document icon said "file";
                  this says "the other sheet", which is what the link is. It
                  had a leader running from the balloon to the word, the way a
                  callout on a drawing does, and at this size it read as a
                  strikethrough rather than as a pointer. */}
              <span className="cv-balloon" aria-hidden="true">
                CV
              </span>
              résumé
            </Link>
            <Socials compact />
          </span>
        </div>
      </div>
      <div className="foot-pad" />
    </footer>
  );
}
