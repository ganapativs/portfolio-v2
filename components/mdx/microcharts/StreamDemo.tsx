"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Sparkline } from "@microcharts/react/sparkline/interactive";
import { Delta } from "@microcharts/react/delta";
import { StatusDot } from "@microcharts/react/status-dot";
import { MiniBar } from "@microcharts/react/mini-bar";

// A model "reply" that uses the microcharts stream grammar — one backtick run
// per inline chart, one fenced block for the standalone chart.
const REPLY = [
  "Deploys look healthy this week. Frequency held steady ",
  "`microchart sparkline 12 14 13 17 16 19 22`",
  " while change-failure rate came down ",
  "`microchart delta -0.08`",
  ", and the API has been ",
  "`microchart status-dot ok`",
  " since Tuesday's rollback.\n\n",
  "```microchart mini-bar Slowest builds (minutes)\nweb 14\napi 9\nmobile 21\ndocs 4\n```",
  "\n\nMobile is the outlier — the cache pass we skipped in March is due.",
].join("");

const STATUSES = new Set(["ok", "warn", "error", "off", "busy"]);

type Seg = { at: number } & (
  | { kind: "text"; text: string }
  | { kind: "raw"; raw: string; inflight: boolean; fence: boolean }
  | { kind: "chart"; node: React.ReactNode; block: boolean }
);

function parseNums(tokens: string[], min: number): number[] | null {
  const nums = tokens.map((t) => Number(t.replace(/[,%$]/g, "")));
  if (nums.length < min || nums.some((n) => !Number.isFinite(n))) return null;
  return nums;
}

function inlineChart(body: string): React.ReactNode | null {
  const tokens = body.trim().split(/\s+/);
  if (tokens[0] !== "microchart" || tokens.length < 3) return null;
  const type = tokens[1];
  const args = tokens.slice(2);
  if (type === "sparkline") {
    const nums = parseNums(args, 3);
    if (!nums) return null;
    return (
      <span className="mc-inline">
        <Sparkline data={nums} summary={false} width={72} height={16} style={{ width: 72 }} />
      </span>
    );
  }
  if (type === "delta") {
    let v = Number(args[0]);
    if (!Number.isFinite(v)) return null;
    if (Math.abs(v) > 1.5) v = v / 100;
    return <Delta value={v} summary={false} />;
  }
  if (type === "status-dot" && STATUSES.has(args[0])) {
    return (
      <span className="mc-inline">
        <StatusDot status={args[0]} summary={false} />
      </span>
    );
  }
  return null;
}

function blockChart(head: string, body: string): React.ReactNode | null {
  const tokens = head.trim().split(/\s+/);
  if (tokens[0] !== "microchart" || tokens[1] !== "mini-bar") return null;
  const title = tokens.slice(2).join(" ") || undefined;
  const data: { label: string; value: number }[] = [];
  for (const line of body.split("\n")) {
    const m = line.trim().match(/^(.+?)\s+(-?[\d.]+)$/);
    if (m) data.push({ label: m[1].slice(0, 16), value: Number(m[2]) });
  }
  if (data.length < 2) return null;
  return (
    <span className="mcx-stream-block">
      <MiniBar data={data} title={title} width={200} height={56} />
      {title && <span className="mcx-stream-chartcap">{title}</span>}
    </span>
  );
}

// Re-parse the full visible prefix on every frame — in-flight grammar renders
// as literal code; the chart appears only the instant its fence closes.
function parse(text: string): Seg[] {
  const segs: Seg[] = [];
  let i = 0;
  while (i < text.length) {
    const fence = text.indexOf("```microchart", i);
    const tick = text.indexOf("`microchart", i);
    const next = [fence, tick].filter((n) => n !== -1).toSorted((a, b) => a - b)[0] ?? -1;
    if (next === -1) {
      segs.push({ at: i, kind: "text", text: text.slice(i) });
      break;
    }
    if (next > i) segs.push({ at: i, kind: "text", text: text.slice(i, next) });
    if (next === fence) {
      const close = text.indexOf("\n```", fence + 3);
      if (close === -1) {
        segs.push({ at: fence, kind: "raw", raw: text.slice(fence), inflight: true, fence: true });
        break;
      }
      const inner = text.slice(fence + 3, close);
      const nl = inner.indexOf("\n");
      const head = nl === -1 ? inner : inner.slice(0, nl);
      const body = nl === -1 ? "" : inner.slice(nl + 1);
      const node = blockChart(head, body);
      if (node) segs.push({ at: fence, kind: "chart", node, block: true });
      else
        segs.push({
          at: fence,
          kind: "raw",
          raw: text.slice(fence, close + 4),
          inflight: false,
          fence: true,
        });
      i = close + 4;
    } else {
      const close = text.indexOf("`", tick + 1);
      if (close === -1) {
        segs.push({ at: tick, kind: "raw", raw: text.slice(tick), inflight: true, fence: false });
        break;
      }
      const node = inlineChart(text.slice(tick + 1, close));
      if (node) segs.push({ at: tick, kind: "chart", node, block: false });
      else
        segs.push({
          at: tick,
          kind: "raw",
          raw: text.slice(tick, close + 1),
          inflight: false,
          fence: false,
        });
      i = close + 1;
    }
  }
  // Block charts own their spacing — swallow the blank lines around them so the
  // reply doesn't render dead vertical gaps (same rule as the real grammar).
  for (let s = 0; s < segs.length; s++) {
    const seg = segs[s];
    if ((seg.kind === "chart" && seg.block) || (seg.kind === "raw" && seg.fence)) {
      const prev = segs[s - 1];
      const nxt = segs[s + 1];
      if (prev?.kind === "text") prev.text = prev.text.replace(/\n+$/, "");
      if (nxt?.kind === "text") nxt.text = nxt.text.replace(/^\n+/, "");
    }
  }
  return segs;
}

export function StreamDemo() {
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const reduced = useRef(false);

  const start = useCallback((slowMo: boolean) => {
    if (reduced.current) {
      setShown(REPLY.length);
      setPlaying(false);
      return;
    }
    setShown(0);
    setSlow(slowMo);
    setPlaying(true);
  }, []);

  // Auto-play once, when the demo scrolls into view.
  useEffect(() => {
    reduced.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const host = hostRef.current;
    if (!host) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !started.current) {
          started.current = true;
          start(false);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(host);
    return () => io.disconnect();
  }, [start]);

  useEffect(() => {
    if (!playing) return;
    const tick = slow ? 64 : 18;
    const id = setInterval(() => {
      setShown((n) => {
        const step = 1 + ((n * 7) % 3); // 1–3 chars, deterministic jitter
        const nxt = Math.min(REPLY.length, n + step);
        if (nxt === REPLY.length) setPlaying(false);
        return nxt;
      });
    }, tick);
    return () => clearInterval(id);
  }, [playing, slow]);

  const done = shown >= REPLY.length;
  const segs = parse(REPLY.slice(0, shown));

  return (
    <div className="mcx-stream" ref={hostRef}>
      <div className="mcx-stream-bar">
        <span className="mcx-stream-title">
          assistant {done ? "· replied" : playing ? "· streaming" : ""}
        </span>
        <span className="mcx-stream-actions">
          <button type="button" className="mcx-chip" onClick={() => start(false)}>
            replay
          </button>
          <button type="button" className="mcx-chip" onClick={() => start(true)}>
            slow motion
          </button>
        </span>
      </div>
      <div className="mcx-stream-body" aria-live="off">
        {segs.map((s) =>
          s.kind === "text" ? (
            <span key={s.at}>{s.text}</span>
          ) : s.kind === "raw" ? (
            // span, not <code> — the article's inline-code chip styling (background,
            // border) must not apply; raw grammar reads as plain dim mono text.
            <span
              key={s.at}
              className={s.fence ? "mcx-stream-raw mcx-stream-raw--fence" : "mcx-stream-raw"}
              data-inflight={s.inflight || undefined}
            >
              {s.raw}
            </span>
          ) : (
            <span key={s.at}>{s.node}</span>
          ),
        )}
        {!done && <span className="mcx-caret" aria-hidden="true" />}
      </div>
      <p className="mcx-stream-note">
        Hit slow motion to watch the parser work a character at a time.
      </p>
    </div>
  );
}
