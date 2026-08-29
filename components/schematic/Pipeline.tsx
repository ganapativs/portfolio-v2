"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFX } from "@/components/providers/FXProvider";
import { CHART, STAGES, STAGE_NOTE } from "@/app/(press)/content";
import { identity } from "@/lib/resume";

const SNS = "http://www.w3.org/2000/svg";
const cl = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);

// The card's chart: cumulative shipped work, 2013 to 2026, in the SVG's own
// 272×64 space. Four of the points are promotions and are marked.
const CX = CHART.map((c) => c.x);
const CY = CHART.map((c) => c.y);
// The bendable anchor is 2019, the year the line jumps. It is the one point on
// the curve with a story, so it is the one you get to shape.
const AI = 6;

function ctrl(i: number): [number[], number[]] {
  const p = (k: number) => {
    const j = cl(k, 0, CX.length - 1);
    return [CX[j], CY[j]];
  };
  const a = p(i);
  const b = p(i + 1);
  const pa = p(i - 1);
  const pb = p(i + 2);
  return [
    [a[0] + (b[0] - pa[0]) / 6, a[1] + (b[1] - pa[1]) / 6],
    [b[0] - (pb[0] - a[0]) / 6, b[1] - (pb[1] - a[1]) / 6],
  ];
}
const DEF = { c1: ctrl(AI - 1)[1], c2: ctrl(AI)[0] };

const NODE_TAG: Record<string, string> = {
  card: "section.card",
  header: "header",
  chip: "span.chip",
  stats: "div.stats",
  chart: "svg.chart",
  list: "ul.list",
  li: "li",
  btn: "a.primary",
};

/**
 * Fig. 6 — the pipeline.
 *
 * One interface dragged through its own making: sketch → vectors → tokens →
 * markup → shipped. It is the closing argument of the page, and the argument is
 * that design and engineering are one continuous act rather than a handoff — so
 * the figure is one continuous morph of a single object, never five slides.
 *
 * Three things make it worth the code:
 *
 *   The card is real. It is this site's own summary: twelve years, the star
 *   count, the actual trajectory chart, the two pieces of current work, and a
 *   Say hello button that sends real mail once the scrub reaches the end.
 *
 *   What you shape in design is what ships. The vectors stage gives you two pen
 *   handles on the 2019 jump; bend them and the bend is still there in the
 *   shipped card, because there is only ever one curve.
 *
 *   It ends working. At the last stage the card is not a picture of an
 *   interface: the rows highlight, the chart answers questions, the inspector
 *   reads live computed styles off the DOM, and the button is a mailto.
 *
 * Almost nothing here is React state. The scrub runs at 60fps and writes six
 * CSS custom properties per frame; re-rendering a tree for that would be the
 * wrong tool. React owns the markup, the DOM owns the motion.
 */
export function Pipeline() {
  const figRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLSpanElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const vecRef = useRef<SVGSVGElement>(null);
  const wiresRef = useRef<SVGSVGElement>(null);
  const ancRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);
  const handlesRef = useRef<SVGGElement>(null);
  const dotRef = useRef<SVGGElement>(null);
  const btnRef = useRef<HTMLAnchorElement>(null);
  const domRef = useRef<HTMLDivElement>(null);
  const inspRef = useRef<HTMLDivElement>(null);

  const [stage, setStage] = useState(0);
  const [cap, setCap] = useState<string | null>(null);
  const [insp, setInsp] = useState<{ tag: string; rows: [string, string][]; hex?: string } | null>(
    null,
  );
  const fx = useFX();
  const fxRef = useRef(fx);
  fxRef.current = fx;

  // ---- the curve -----------------------------------------------------------
  const cur = useRef({ c1: DEF.c1.slice(), c2: DEF.c2.slice() });
  const renderCurve = useCallback(() => {
    const chart = chartRef.current;
    const hg = handlesRef.current;
    if (!chart || !hg) return;
    let d = `M${CX[0]} ${CY[0]}`;
    for (let i = 0; i < CX.length - 1; i++) {
      const c = ctrl(i);
      if (i === AI - 1) c[1] = cur.current.c1;
      if (i === AI) c[0] = cur.current.c2;
      d += ` C${c[0][0].toFixed(1)} ${c[0][1].toFixed(1)},${c[1][0].toFixed(1)} ${c[1][1].toFixed(1)},${CX[i + 1]} ${CY[i + 1]}`;
    }
    for (const sel of [".ln-grey", ".ln-ink"]) chart.querySelector(sel)?.setAttribute("d", d);
    chart
      .querySelector(".ar-ink")
      ?.setAttribute("d", `${d} L${CX[CX.length - 1]} 52 L${CX[0]} 52 Z`);
    const set = (sel: string, p: number[], kind: "line" | "pt") => {
      const el = hg.querySelector<SVGElement>(sel);
      if (!el) return;
      if (kind === "line") {
        el.setAttribute("x1", String(CX[AI]));
        el.setAttribute("y1", String(CY[AI]));
        el.setAttribute("x2", String(p[0]));
        el.setAttribute("y2", String(p[1]));
      } else {
        el.setAttribute("cx", String(p[0]));
        el.setAttribute("cy", String(p[1]));
      }
    };
    set(".h-l1", cur.current.c1, "line");
    set(".h-l2", cur.current.c2, "line");
    set(".h-c1", cur.current.c1, "pt");
    set(".h-c2", cur.current.c2, "pt");
    set(".h-g1", cur.current.c1, "pt");
    set(".h-g2", cur.current.c2, "pt");
  }, []);

  // ---- the scrub -----------------------------------------------------------
  const t = useRef(0);
  const detent = useRef(-1);
  const muted = useRef(false);
  const raf = useRef(0);
  const auto = useRef(0);
  const touched = useRef(false);
  const pulseTid = useRef(0);

  const pulse = useCallback((kind: string, ms: number) => {
    const fig = figRef.current;
    if (!fig) return;
    fig.removeAttribute("data-pulse");
    void fig.offsetWidth; // restart the one-shot animation
    fig.dataset.pulse = kind;
    window.clearTimeout(pulseTid.current);
    pulseTid.current = window.setTimeout(() => fig.removeAttribute("data-pulse"), ms);
  }, []);

  const render = useCallback(() => {
    const fig = figRef.current;
    if (!fig) return;
    const tc = cl(t.current, 0, 4);
    const s = fig.style;
    // Six weights from one position. Each is a clamped window on the scrub, so
    // stages overlap rather than cutting: the ink is already pouring in while
    // the sketch is still fading out.
    s.setProperty("--o-wire", cl(1 - tc, 0, 1).toFixed(3));
    s.setProperty("--o-ink", cl(tc - 1, 0, 1).toFixed(3));
    s.setProperty("--o-vec", (cl(tc, 0, 1) - cl(tc - 2, 0, 1)).toFixed(3));
    s.setProperty("--o-tok", (cl(tc - 1, 0, 1) - cl(tc - 2, 0, 1)).toFixed(3));
    s.setProperty("--o-dom", (cl(tc - 2, 0, 1) - cl(tc - 3, 0, 1)).toFixed(3));
    s.setProperty("--o-live", cl(tc - 3, 0, 1).toFixed(3));
    if (headRef.current) headRef.current.style.left = `${((tc / 4) * 100).toFixed(3)}%`;
    if (fillRef.current) fillRef.current.style.transform = `scaleX(${(tc / 4).toFixed(4)})`;

    const d = Math.round(tc);
    if (d === detent.current) return;
    const first = detent.current < 0;
    detent.current = d;
    fig.dataset.stage = String(d);
    setStage(d);
    if (btnRef.current) btnRef.current.tabIndex = d === 4 ? 0 : -1;
    for (const sel of [".h-g1", ".h-g2"]) {
      handlesRef.current?.querySelector(sel)?.setAttribute("tabindex", d === 1 ? "0" : "-1");
    }
    if (!first && !muted.current) fxRef.current?.tick();
    if (!first && d === 3) pulse("bm", 700);
  }, [pulse]);

  // Settle onto a detent. Time-based with a slight overshoot, so it cannot
  // stall the way a per-frame decay can when the remaining distance is tiny.
  const springTo = useCallback(
    (d: number) => {
      cancelAnimationFrame(raf.current);
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        t.current = d;
        render();
        return;
      }
      const from = t.current;
      const t0 = performance.now();
      const D = 180 + 120 * Math.abs(d - from);
      const step = (now: number) => {
        const p = Math.min((now - t0) / D, 1);
        const q = p - 1;
        const e = 1 + 2.70158 * q * q * q + 1.70158 * q * q; // ease-out-back
        t.current = from + (d - from) * e;
        if (p >= 1) t.current = d;
        render();
        if (p < 1) raf.current = requestAnimationFrame(step);
      };
      raf.current = requestAnimationFrame(step);
    },
    [render],
  );

  const grab = useCallback(() => {
    muted.current = false;
    touched.current = true;
    cancelAnimationFrame(auto.current);
    auto.current = 0;
    cancelAnimationFrame(raf.current);
  }, []);

  const moveTo = useCallback(
    (clientX: number) => {
      const r = innerRef.current?.getBoundingClientRect();
      if (!r) return;
      const raw = cl((clientX - r.left) / r.width, 0, 1) * 4;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
        t.current = Math.round(raw);
      else {
        // A soft magnet near each detent: the head is still following the hand
        // exactly, but it leans toward the stage it is nearly on.
        const n = Math.round(raw);
        const pull = Math.max(0, 1 - Math.abs(raw - n) / 0.22);
        t.current = raw + (n - raw) * pull * 0.5;
      }
      render();
    },
    [render],
  );

  // ---- measured annotations -----------------------------------------------
  // Redlines, anchors, tag chips and token wires are measured off the real DOM
  // rather than positioned by hand, so they stay attached at any width and
  // through a font swap. Cached on a signature of the boxes involved, because
  // this runs on resize and would otherwise rebuild for nothing.
  const builtSig = useRef("");
  const build = useCallback(() => {
    const stageEl = stageRef.current;
    const ui = uiRef.current;
    const vec = vecRef.current;
    const wires = wiresRef.current;
    const btn = btnRef.current;
    const chart = chartRef.current;
    if (!stageEl || !ui || !vec || !wires || !btn || !chart) return;
    const sr = stageEl.getBoundingClientRect();
    const cr = ui.getBoundingClientRect();
    const sig = [sr.width, sr.height, cr.left - sr.left, cr.top - sr.top, cr.width, cr.height]
      .map(Math.round)
      .join(",");
    if (sig === builtSig.current) return;
    builtSig.current = sig;

    for (const sv of [vec, wires]) {
      sv.setAttribute("width", String(sr.width));
      sv.setAttribute("height", String(sr.height));
      sv.innerHTML = "";
    }
    if (ancRef.current) ancRef.current.innerHTML = "";
    if (tagsRef.current) tagsRef.current.innerHTML = "";

    const m = (el: Element) => {
      const r = el.getBoundingClientRect();
      return { x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height };
    };
    const mk = (
      svg: SVGSVGElement,
      tag: string,
      at: Record<string, string | number>,
      txt?: string,
    ) => {
      const e = document.createElementNS(SNS, tag);
      for (const k in at) e.setAttribute(k, String(at[k]));
      if (tag === "line") e.setAttribute("pathLength", "1");
      if (txt) e.textContent = txt;
      svg.appendChild(e);
      return e;
    };
    const label = (x: number, y: number, s: string) => {
      const w = s.length * 5.6 + 8;
      mk(vec, "rect", { x: x - w / 2, y: y - 7, width: w, height: 13 });
      mk(vec, "text", { x, y: y + 3.5, "text-anchor": "middle" }, s);
    };
    const dimension = (horizontal: boolean, a: number, b: number, at: number, text: string) => {
      if (horizontal) {
        mk(vec, "line", { x1: a, y1: at, x2: b, y2: at });
        mk(vec, "line", { x1: a, y1: at - 4, x2: a, y2: at + 4 });
        mk(vec, "line", { x1: b, y1: at - 4, x2: b, y2: at + 4 });
        label((a + b) / 2, at, text);
      } else {
        mk(vec, "line", { x1: at, y1: a, x2: at, y2: b });
        mk(vec, "line", { x1: at - 4, y1: a, x2: at + 4, y2: a });
        mk(vec, "line", { x1: at - 4, y1: b, x2: at + 4, y2: b });
        label(at, (a + b) / 2, text);
      }
    };

    const card = m(ui);
    const btnM = m(btn);
    dimension(false, card.y, card.y + card.h, Math.max(card.x - 13, 16), ` ${Math.round(card.h)} `);
    dimension(true, card.x, card.x + card.w, Math.max(card.y - 13, 10), ` ${Math.round(card.w)} `);
    dimension(
      true,
      btnM.x,
      btnM.x + btnM.w,
      Math.min(btnM.y + btnM.h + 9, sr.height - 8),
      ` ${Math.round(btnM.w)} `,
    );

    for (const b of [card, btnM]) {
      for (const p of [
        [b.x, b.y],
        [b.x + b.w, b.y],
        [b.x, b.y + b.h],
        [b.x + b.w, b.y + b.h],
      ]) {
        const a = document.createElement("span");
        a.className = "anc";
        a.style.left = `${p[0]}px`;
        a.style.top = `${p[1]}px`;
        ancRef.current?.appendChild(a);
      }
    }

    const bar = ui.querySelector(".ui-bar");
    for (const [el, tag, dy] of [
      [bar, "header", -20],
      [chart, "svg.chart", -10],
      [btn, "a.primary", -10],
    ] as [Element | null, string, number][]) {
      if (!el) continue;
      const r = m(el);
      const c = document.createElement("span");
      c.className = "tagchip";
      const b = document.createElement("b");
      b.textContent = tag;
      c.appendChild(b);
      c.style.left = `${r.x + 4}px`;
      c.style.top = `${r.y + dy}px`;
      tagsRef.current?.appendChild(c);
    }

    // Each token chip draws a wire to whatever it paints.
    for (const row of Array.from(stageEl.querySelectorAll<HTMLElement>(".tok[data-wire]"))) {
      const rr = m(row);
      for (const k of (row.dataset.wire ?? "").split(",")) {
        const target = stageEl.querySelector(`[data-node="${k}"]`);
        if (!target) continue;
        const er = m(target);
        let x1: number;
        let y1: number;
        let x2: number;
        let y2: number;
        if (rr.y > er.y + er.h) {
          // Below 768px the panel becomes a strip under the card, so the wires
          // have to come up rather than across.
          x1 = rr.x + rr.w / 2;
          y1 = rr.y;
          x2 = er.x + er.w / 2;
          y2 = er.y + er.h + 3;
        } else {
          x1 = rr.x - 2;
          y1 = rr.y + rr.h / 2;
          x2 = er.x + er.w + 3;
          y2 = er.y + Math.min(er.h / 2, 16);
        }
        mk(wires, "line", { x1, y1, x2, y2 });
        mk(wires, "circle", { cx: x2, cy: y2, r: 2.5 });
      }
    }
  }, []);

  // ---- wiring --------------------------------------------------------------
  useEffect(() => {
    renderCurve();
    render();
    build();
    let rz = 0;
    const onResize = () => {
      clearTimeout(rz);
      rz = window.setTimeout(build, 150);
    };
    window.addEventListener("resize", onResize);
    document.fonts?.ready.then(build).catch(() => {});
    return () => {
      clearTimeout(rz);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(raf.current);
      cancelAnimationFrame(auto.current);
      window.clearTimeout(pulseTid.current);
    };
  }, [build, render, renderCurve]);

  // One slow pass through the whole making, the first time the figure is seen,
  // with the detent ticks muted. It is a demonstration of what the scrubber is
  // for, it happens once, and touching the scrubber first cancels it entirely.
  useEffect(() => {
    const fig = figRef.current;
    if (!fig) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      t.current = 4;
      render();
      return;
    }
    let seen = false;
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (!en.isIntersecting || seen) continue;
          seen = true;
          io.unobserve(fig);
          if (touched.current) return;
          muted.current = true;
          const t0 = performance.now();
          const D = 2400;
          const step = (now: number) => {
            const p = Math.min((now - t0) / D, 1);
            const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
            t.current = e * 4;
            render();
            if (p < 1) auto.current = requestAnimationFrame(step);
            else {
              auto.current = 0;
              muted.current = false;
            }
          };
          auto.current = requestAnimationFrame(step);
        }
      },
      { threshold: 0.35 },
    );
    io.observe(fig);
    return () => io.disconnect();
  }, [render]);

  // ---- markup stage: dom tree ⇆ element highlight --------------------------
  const hiNode = useCallback((n: string | null) => {
    const stageEl = stageRef.current;
    if (!stageEl) return;
    for (const r of Array.from(domRef.current?.querySelectorAll<HTMLElement>(".dn") ?? [])) {
      r.dataset.hi = String(!!n && r.dataset.node === n);
    }
    for (const el of Array.from(stageEl.querySelectorAll<HTMLElement>("[data-node]"))) {
      if (el.classList.contains("dn")) continue;
      el.classList.toggle("ui-hi", el.dataset.node === n);
    }
  }, []);

  // ---- shipped stage: live computed reads ---------------------------------
  const inspEl = useRef<HTMLElement | null>(null);
  const hexCv = useRef<HTMLCanvasElement | null>(null);
  const inspect = useCallback((el: HTMLElement | null) => {
    if (el === inspEl.current) return;
    inspEl.current?.classList.remove("insp-hi");
    inspEl.current = el;
    if (!el) {
      setInsp(null);
      return;
    }
    el.classList.add("insp-hi");
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    // Canvas parses any CSS colour, oklch included, and hands back 8-bit
    // channels — which is the shortest correct way to show a hex here.
    let hex = cs.color;
    try {
      if (!hexCv.current) {
        hexCv.current = document.createElement("canvas");
        hexCv.current.width = hexCv.current.height = 1;
      }
      const x = hexCv.current.getContext("2d", { willReadFrequently: true });
      if (x) {
        x.fillStyle = "#000";
        x.fillStyle = cs.color;
        x.fillRect(0, 0, 1, 1);
        const d = x.getImageData(0, 0, 1, 1).data;
        hex =
          `#${[d[0], d[1], d[2]].map((n) => n.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
      }
    } catch {}
    setInsp({
      tag: NODE_TAG[el.dataset.node ?? ""] ?? el.tagName.toLowerCase(),
      hex,
      rows: [
        [
          "font",
          `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily.split(",")[0].replace(/["']/g, "")}`,
        ],
        ["size", `${Math.round(r.width)}×${Math.round(r.height)}`],
        [
          "padding",
          [cs.paddingTop, cs.paddingRight, cs.paddingBottom, cs.paddingLeft]
            .map((v) => parseFloat(v))
            .join(" "),
        ],
        ["display", cs.display],
      ],
    });
    fxRef.current?.tick();
  }, []);

  useEffect(() => {
    if (stage !== 3) hiNode(null);
    if (stage !== 4) inspect(null);
  }, [stage, hiNode, inspect]);

  // ---- pen handles ---------------------------------------------------------
  const bendRaf = useRef(0);
  const toVB = (clientX: number, clientY: number) => {
    const svg = chartRef.current?.querySelector("svg");
    const r = svg?.getBoundingClientRect();
    if (!r) return [0, 0];
    return [((clientX - r.left) / r.width) * 272, ((clientY - r.top) / r.height) * 64];
  };
  const springCurve = () => {
    if (bendRaf.current) return;
    const f1 = cur.current.c1.slice();
    const f2 = cur.current.c2.slice();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      cur.current = { c1: DEF.c1.slice(), c2: DEF.c2.slice() };
      renderCurve();
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / 320, 1);
      const q = p - 1;
      const e = 1 + 2.70158 * q * q * q + 1.70158 * q * q;
      cur.current = {
        c1: [f1[0] + (DEF.c1[0] - f1[0]) * e, f1[1] + (DEF.c1[1] - f1[1]) * e],
        c2: [f2[0] + (DEF.c2[0] - f2[0]) * e, f2[1] + (DEF.c2[1] - f2[1]) * e],
      };
      renderCurve();
      if (p < 1) bendRaf.current = requestAnimationFrame(step);
      else {
        bendRaf.current = 0;
        cur.current = { c1: DEF.c1.slice(), c2: DEF.c2.slice() };
        renderCurve();
        fxRef.current?.chime();
      }
    };
    bendRaf.current = requestAnimationFrame(step);
  };

  const onHandleDown = (e: React.PointerEvent<SVGCircleElement>) => {
    const key = e.currentTarget.dataset.h as "c1" | "c2" | undefined;
    if (!key) return;
    // A grab interrupts the spring home, rather than fighting it.
    cancelAnimationFrame(bendRaf.current);
    bendRaf.current = 0;
    const el = e.currentTarget;
    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
    fx?.press();
    const move = (ev: PointerEvent) => {
      const p = toVB(ev.clientX, ev.clientY);
      cur.current[key] = [cl(p[0], 30, 262), cl(p[1], -24, 88)];
      renderCurve();
    };
    const up = () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      fx?.release();
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    e.preventDefault();
    e.stopPropagation();
  };

  const onHandleKey = (e: React.KeyboardEvent<SVGCircleElement>) => {
    const key = e.currentTarget.dataset.h as "c1" | "c2" | undefined;
    if (!key) return;
    const step = e.shiftKey ? 9 : 3;
    let dx = 0;
    let dy = 0;
    if (e.key === "ArrowLeft") dx = -step;
    else if (e.key === "ArrowRight") dx = step;
    else if (e.key === "ArrowUp") dy = -step;
    else if (e.key === "ArrowDown") dy = step;
    else return;
    e.preventDefault();
    cur.current[key] = [
      cl(cur.current[key][0] + dx, 30, 262),
      cl(cur.current[key][1] + dy, -24, 88),
    ];
    renderCurve();
    fx?.tick();
  };

  // ---- the shipped chart's year readout ------------------------------------
  const dotIdx = useRef(-1);
  const onChartMove = (e: React.PointerEvent) => {
    if (stage !== 4) return;
    const x = toVB(e.clientX, e.clientY)[0];
    let best = 0;
    let bd = 1e9;
    CX.forEach((px, i) => {
      const d = Math.abs(px - x);
      if (d < bd) {
        bd = d;
        best = i;
      }
    });
    if (best === dotIdx.current) return;
    dotIdx.current = best;
    const circle = dotRef.current?.querySelector("circle");
    circle?.setAttribute("cx", String(CX[best]));
    circle?.setAttribute("cy", String(CY[best]));
    if (dotRef.current) dotRef.current.dataset.on = "true";
    setCap(`${2013 + best} · ${CHART[best].story}`);
    fx?.tick();
  };
  const onChartLeave = () => {
    if (dotRef.current) dotRef.current.dataset.on = "false";
    dotIdx.current = -1;
    setCap(null);
  };

  const dragging = useRef(false);
  const drop = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (scrubRef.current) scrubRef.current.dataset.dragging = "false";
    fx?.release();
    springTo(Math.round(cl(t.current, 0, 4)));
  };

  return (
    <div className="pipefig" ref={figRef} data-stage="0">
      <div className="pipe-top">
        <span className="pipe-figlbl">fig. 6 · the pipeline</span>
        <span className="pipe-note">{STAGE_NOTE[stage]}</span>
      </div>

      <div className="pipe-stage" ref={stageRef}>
        <div className="pipe-mgrid" aria-hidden="true" />

        {/* The card answers the pointer only in the last two stages: in the
            markup stage it names its parts, in the shipped stage it reports
            them. The card itself is reachable only by its own edge, so moving
            over a child does not read as hovering the whole thing. */}
        <div
          className="pipe-card"
          ref={uiRef}
          data-node="card"
          onPointerOver={(e) => {
            const el = (e.target as HTMLElement).closest?.<HTMLElement>("[data-node]");
            if (stage === 3) hiNode(el?.dataset.node ?? null);
            else if (stage === 4) inspect(el && el !== uiRef.current ? el : null);
          }}
          onPointerLeave={() => {
            if (stage === 3) hiNode(null);
            else if (stage === 4) inspect(null);
          }}
        >
          <span className="skin" aria-hidden="true" />
          <span className="wf" aria-hidden="true" />

          <div className="ui-bar" data-node="header">
            <span className="wf alt" aria-hidden="true">
              <svg>
                <line x1="0" y1="0" x2="100%" y2="100%" />
                <line x1="100%" y1="0" x2="0" y2="100%" />
              </svg>
            </span>
            <span className="rule" aria-hidden="true" />
            <span className="ui-kicker tx">
              <span className="tx-r">{identity.name}</span>
              <i className="tx-b" aria-hidden="true" />
            </span>
            <span className="ui-chip" data-node="chip">
              <span className="bd" aria-hidden="true" />
              <span className="ck" aria-hidden="true" />
              <span className="tx">
                <span className="tx-r">since 2013</span>
                <i className="tx-b" aria-hidden="true" />
              </span>
            </span>
            <span className="ui-title tx">
              <span className="tx-r">Twelve years of interfaces</span>
              <i className="tx-b" aria-hidden="true" />
            </span>
            <span className="bmov" aria-hidden="true" />
          </div>

          <div className="ui-stats" data-node="stats">
            {[
              ["12", "years"],
              ["2,400+", "stars"],
            ].map(([v, l]) => (
              <div className="ui-stat" key={l}>
                <span className="wf alt" aria-hidden="true">
                  <svg>
                    <line x1="0" y1="0" x2="100%" y2="100%" />
                    <line x1="100%" y1="0" x2="0" y2="100%" />
                  </svg>
                </span>
                <b className="tx">
                  <span className="tx-r">{v}</span>
                  <i className="tx-b" aria-hidden="true" />
                </b>
                <i className="tx">
                  <span className="tx-r">{l}</span>
                  <i className="tx-b" aria-hidden="true" />
                </i>
              </div>
            ))}
          </div>

          <div
            className="ui-chart"
            ref={chartRef}
            data-node="chart"
            onPointerMove={onChartMove}
            onPointerLeave={onChartLeave}
            onDoubleClick={springCurve}
          >
            <span className="wf alt" aria-hidden="true" />
            <span className="ui-chartlbl tx">
              <span className="tx-r">{cap ?? "shipped work · four promotions"}</span>
              <i className="tx-b" aria-hidden="true" />
            </span>
            <svg
              viewBox="0 0 272 64"
              preserveAspectRatio="none"
              role="img"
              aria-label="Cumulative shipped work, 2013 to 2026, with four promotions marked on the line"
            >
              <line className="ax" x1="0" y1="52" x2="272" y2="52" />
              <g className="ax-t">
                <line x1="10" y1="49.5" x2="10" y2="52" />
                <line x1="146" y1="49.5" x2="146" y2="52" />
                <line x1="262" y1="49.5" x2="262" y2="52" />
              </g>
              <g className="ax-y">
                <text x="10" y="61">
                  2013
                </text>
                <text x="146" y="61" textAnchor="middle">
                  2020
                </text>
                <text x="262" y="61" textAnchor="end">
                  2026
                </text>
              </g>
              {/* The sketch line: the same trajectory, drawn by hand. */}
              <path
                className="ln-rough"
                d="M8 51 L30 49 50 47 68 44 88 42 108 38 126 26 146 28 166 21 186 22 204 21 224 18 243 13 264 9"
              />
              <path className="ln-grey" />
              <g className="g-ink">
                <path className="ar-ink" />
                <path className="ln-ink" pathLength="1" />
                <g className="pm">
                  {CHART.filter((c) => c.promotion).map((c) => (
                    <circle key={c.x} cx={c.x} cy={c.y} r="2.5" />
                  ))}
                </g>
                <line className="pk-t" x1="204" y1="17" x2="204" y2="11" />
              </g>
              <g className="g-h" ref={handlesRef}>
                <line className="h-l1" />
                <line className="h-l2" />
                <rect width="5" height="5" x={CX[AI] - 2.5} y={CY[AI] - 2.5} />
                <circle className="h-c1" r="3" />
                <circle className="h-c2" r="3" />
                <circle
                  className="hit h-g1"
                  r="11"
                  data-h="c1"
                  tabIndex={-1}
                  aria-label="Bend the curve into the 2019 jump"
                  onPointerDown={onHandleDown}
                  onKeyDown={onHandleKey}
                />
                <circle
                  className="hit h-g2"
                  r="11"
                  data-h="c2"
                  tabIndex={-1}
                  aria-label="Bend the curve out of the 2019 jump"
                  onPointerDown={onHandleDown}
                  onKeyDown={onHandleKey}
                />
              </g>
              <g className="g-dot" ref={dotRef}>
                <circle r="3" />
              </g>
            </svg>
            <span className="ui-peak" aria-hidden="true">
              VP
            </span>
            <span className="ui-bend" aria-hidden="true">
              the pen handles bend it
            </span>
            <span className="bmov" aria-hidden="true" />
          </div>

          <div className="ui-list" data-node="list">
            {[
              ["the assistant", "at Tracxn"],
              ["microcharts", "106 types"],
            ].map(([k, v], i) => (
              <div className="ui-row" data-node="li" key={k}>
                <span className={`wf${i ? " alt" : ""}`} aria-hidden="true" />
                <span className="rule" aria-hidden="true" />
                <span className="tx">
                  <span className="tx-r">{k}</span>
                  <i className="tx-b" aria-hidden="true" />
                </span>
                <span className="v tx">
                  <span className="tx-r">{v}</span>
                  <i className="tx-b" aria-hidden="true" />
                </span>
              </div>
            ))}
          </div>

          {/* A real destination, and deliberately not an email. Someone who has
              just dragged an interface through its own making wants to look at
              more of the work, not to write a message. */}
          <a
            className="ui-btn"
            ref={btnRef}
            data-node="btn"
            href="https://github.com/ganapativs"
            target="_blank"
            rel="noopener"
            tabIndex={-1}
            data-analytics="cta:pipeline.github"
            onClick={() => {
              if (stage === 4) pulse("chart", 800);
            }}
          >
            <span className="bd" aria-hidden="true" />
            <span className="wf" aria-hidden="true">
              <svg>
                <line x1="0" y1="0" x2="100%" y2="100%" />
                <line x1="100%" y1="0" x2="0" y2="100%" />
              </svg>
            </span>
            <i className="tx-b" aria-hidden="true" />
            <span className="fill">See the code</span>
            <span className="bmov" aria-hidden="true" />
          </a>

          <span className="ui-stamp" aria-hidden="true">
            shipped · works
          </span>
        </div>

        <div className="pipe-slot">
          <div className="pipe-side pipe-tok" aria-hidden="true">
            <span className="ps-h">tokens</span>
            <div className="tok" data-wire="btn,chart">
              <i className="sw" style={{ background: "var(--accent)" }} />
              --accent
            </div>
            <div className="tok" data-wire="header">
              <i className="sw" style={{ background: "var(--ink)" }} />
              --ink
            </div>
            <div className="tok" data-wire="card">
              <i className="sw" style={{ background: "var(--raise)" }} />
              --paper
            </div>
            <div className="tramp">
              <span className="tr t1">
                <b>Aa</b>15/1.25
              </span>
              <span className="tr t2">
                <b>Aa</b>12/1.4
              </span>
              <span className="tr t3">
                <b>Aa</b>10.5 mono
              </span>
            </div>
          </div>

          <div
            className="pipe-side pipe-dom"
            ref={domRef}
            aria-hidden="true"
            onPointerOver={(e) => {
              const r = (e.target as HTMLElement).closest?.<HTMLElement>(".dn");
              if (r) hiNode(r.dataset.node ?? null);
            }}
            onPointerLeave={() => hiNode(null)}
          >
            <span className="ps-h">dom</span>
            {[
              ["card", "section.card", ""],
              ["header", "header", "i1"],
              ["chip", "span.chip", "i2"],
              ["stats", "div.stats", "i1"],
              ["chart", "svg.chart", "i1"],
              ["list", "ul.list", "i1"],
              ["li", "li ×2", "i2"],
              ["btn", "a.primary", "i1"],
            ].map(([node, text, ind]) => (
              <span key={node} className={`dn ${ind}`} data-node={node}>
                {text}
              </span>
            ))}
          </div>

          <div className="pipe-side pipe-insp" ref={inspRef} aria-hidden="true">
            <span className="ps-h">computed</span>
            {insp ? (
              <div className="insp-body">
                <div className="insp-tag">{insp.tag}</div>
                <div>
                  {insp.rows.map(([k, v]) => (
                    <div className="ir" key={k}>
                      <s>{k}</s>
                      <b>{v}</b>
                    </div>
                  ))}
                  <div className="ir">
                    <s>color</s>
                    <b>
                      <i className="sw2" style={{ background: insp.hex }} />
                      {insp.hex}
                    </b>
                  </div>
                </div>
              </div>
            ) : (
              <div className="insp-idle">hover the card to read how it is built</div>
            )}
          </div>
        </div>

        <svg className="pipe-lay pipe-vec" ref={vecRef} aria-hidden="true" />
        <svg className="pipe-lay pipe-wires" ref={wiresRef} aria-hidden="true" />
        <div className="pipe-lay" ref={ancRef} aria-hidden="true" />
        <div className="pipe-lay" ref={tagsRef} aria-hidden="true" />
      </div>

      <div
        className="pipe-scrub"
        ref={scrubRef}
        role="slider"
        tabIndex={0}
        aria-label="The making of the interface, five stages"
        aria-valuemin={0}
        aria-valuemax={4}
        aria-valuenow={stage}
        aria-valuetext={STAGES[stage]}
        onPointerDown={(e) => {
          grab();
          try {
            e.currentTarget.setPointerCapture(e.pointerId);
          } catch {}
          dragging.current = true;
          e.currentTarget.dataset.dragging = "true";
          fx?.press();
          moveTo(e.clientX);
          e.preventDefault();
        }}
        onPointerMove={(e) => {
          if (dragging.current) moveTo(e.clientX);
        }}
        onPointerUp={drop}
        onPointerCancel={drop}
        onKeyDown={(e) => {
          let d = Math.round(cl(t.current, 0, 4));
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") d -= 1;
          else if (e.key === "ArrowRight" || e.key === "ArrowUp") d += 1;
          else if (e.key === "Home") d = 0;
          else if (e.key === "End") d = 4;
          else return;
          e.preventDefault();
          grab();
          springTo(cl(d, 0, 4));
        }}
      >
        <div className="scrub-in" ref={innerRef}>
          <span className="scrub-rail" aria-hidden="true" />
          <span className="scrub-fill" ref={fillRef} aria-hidden="true" />
          {[0, 25, 50, 75, 100].map((p) => (
            <span key={p} className="scrub-det" style={{ left: `${p}%` }} aria-hidden="true" />
          ))}
          {STAGES.map((s, i) => (
            <span
              key={s}
              className={`scrub-lbl${i === 0 ? " first" : ""}${i === 4 ? " last" : ""}`}
              style={{ left: `${i * 25}%` }}
              data-on={stage === i}
            >
              {s}
            </span>
          ))}
          <span className="scrub-head" ref={headRef} aria-hidden="true">
            <svg width="20" height="26" viewBox="0 0 20 26">
              <path className="hd-t" d="M10 15 L5.2 5.5 L14.8 5.5 Z" />
              <line className="hd-s" x1="10" y1="15" x2="10" y2="25" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}
