"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Socials } from "./Socials";
import { identity } from "@/lib/resume";

/** Which sheet of the set this is. The title block of a drawing always says. */
function sheetName(pathname: string): string {
  if (pathname === "/") return "home";
  if (pathname === "/resume") return "résumé";
  if (pathname === "/blog") return "writing";
  if (pathname.startsWith("/blog/")) return "essay";
  return "sheet";
}

// Day one at Tracxn. The tenure cell counts from here and is the only number in
// the block that is different every time it is read.
const START = { y: 2015, m: 8 };

function tenure(now: Date): string {
  let y = now.getFullYear() - START.y;
  let m = now.getMonth() - START.m;
  if (m < 0) {
    y -= 1;
    m += 12;
  }
  // Years and months only. Days made the value long enough to wrap its cell,
  // and nobody reads a tenure to the day.
  return `${y} yrs · ${m} mo`;
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
  const [clock, setClock] = useState("");
  const [since, setSince] = useState("");

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
        <div className="tb-cell">
          <span className="tb-l">Made by</span>
          <span className="tb-v">{identity.name}</span>
        </div>
        <div className="tb-cell">
          <span className="tb-l">Location</span>
          <span className="tb-v">
            Bengaluru · <span className="mono">{clock || "--:--"}</span> IST
          </span>
        </div>
        <div className="tb-cell">
          <span className="tb-l">At Tracxn</span>
          <span className="tb-v mono">{since || "…"}</span>
        </div>
        <div className="tb-cell">
          <span className="tb-l">Sheet</span>
          <span className="tb-v mono">{sheetName(pathname)}</span>
        </div>
        <div className="tb-cell tb-contact">
          <span className="tb-contact-l">
            <span className="tb-l">Contact</span>
            <a
              className="tb-mail"
              href={`mailto:${identity.email}`}
              data-analytics="mail:title-block"
            >
              say hello
            </a>
            <span className="tb-email">{identity.email}</span>
            <span className="tb-email">· made in India</span>
          </span>
          <Socials compact />
        </div>
      </div>
      <div className="foot-pad" />
    </footer>
  );
}
