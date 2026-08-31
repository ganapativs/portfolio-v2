"use client";
import "@microcharts/react/styles.css";
import { useEffect, useMemo, useState } from "react";
import { PUBLIC_WORK } from "@/lib/resume";
import type { ReactNode } from "react";
import { ActivityGrid } from "@microcharts/react/activity-grid";
import { Bullet } from "@microcharts/react/bullet";
import { BumpStrip } from "@microcharts/react/bump-strip";
import { CalendarStrip } from "@microcharts/react/calendar-strip";
import { ChangePoint } from "@microcharts/react/change-point";
import { CitySkyline } from "@microcharts/react/city-skyline";
import { ControlStrip } from "@microcharts/react/control-strip";
import { DicePips } from "@microcharts/react/dice-pips";
import { DotPlot } from "@microcharts/react/dot-plot";
import { Dumbbell } from "@microcharts/react/dumbbell";
import { HistogramStrip } from "@microcharts/react/histogram-strip";
import { Horizon } from "@microcharts/react/horizon";
import { IconArray } from "@microcharts/react/icon-array";
import { MicroBox } from "@microcharts/react/micro-box";
import { MicroDonut } from "@microcharts/react/micro-donut";
import { ParetoStrip } from "@microcharts/react/pareto-strip";
import { PercentileLadder } from "@microcharts/react/percentile-ladder";
import { QuantileDots } from "@microcharts/react/quantile-dots";
import { Seismogram } from "@microcharts/react/seismogram";
import { Slope } from "@microcharts/react/slope";
import { SparkBar } from "@microcharts/react/sparkbar";
import { Sparkline } from "@microcharts/react/sparkline";
import { StackedArea } from "@microcharts/react/stacked-area";
import { TallyMarks } from "@microcharts/react/tally-marks";
import { Waveform } from "@microcharts/react/waveform";
import { CHART } from "@/app/(press)/content";
import { useFX } from "@/components/providers/FXProvider";

/**
 * Eight of the 106, drawn from a pool of twenty-five, re-drawn every load.
 *
 * These are not pictures of charts. Every one is the shipped component from
 * `@microcharts/react`, taking the drawing's ink through the `--mc-*` bridge in
 * tokens.css. A hand-drawn approximation would have quietly argued against the
 * panel it sits in.
 *
 * The STATIC entry points, not the interactive ones, and that is deliberate. A
 * specimen tray shows what a component looks like; it is not a data display,
 * and eight tooltips firing over one another as the pointer crosses the grid
 * was noise on top of a figure whose own job is to be read at a glance. The
 * interactive build is one import away and is what the essay uses, where the
 * data is the point. Each specimen still carries its own `summary`, so the tray
 * reads as twenty-five sentences rather than as decoration.
 *
 * The whole tray is a client component and the pool therefore ships to the
 * browser, which is the price of the shuffle: the eight cannot be chosen on the
 * server (the server's roll and the client's roll differ, and React calls that
 * a hydration mismatch) and choosing them on the client means every candidate
 * has to be there to choose from. The static builds are small and none of them
 * registers a listener.
 *
 * Honesty rule for the data: every series is either one of the site's own
 * numbers, or plainly generic shape data whose summary says so. Nothing here
 * invents a statistic that looks specific.
 */

/** The cumulative shipped-work curve fig. 6 is built from. */
const SHIPPED = CHART.map((c) => 52 - c.y);

/** One right-skewed specimen sample, shared by the four distribution types. */
const SAMPLE = [2, 3, 3, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 8, 9, 11, 14];
const RISING = [4, 7, 5, 9, 6, 11, 8, 13, 10, 14, 12, 16];
const SIGNED = [0, 2, -1, 0, 5, -4, 1, 0, -2, 7, -6, 2, 0, 1, -1, 3, -8, 4, 0, 1];
const AMPLITUDE = [0.18, 0.42, 0.76, 0.55, 0.9, 1, 0.68, 0.35, 0.6, 0.28, 0.5, 0.82, 0.4, 0.2];
const PROCESS = [12, 12.4, 11.8, 12.2, 12.1, 12.9, 11.6, 12.3, 14.2, 12, 11.9, 12.5, 12.2, 11.7];
const REGIME = [5, 6, 5, 6, 5, 6, 12, 13, 12, 14, 13, 12, 13, 14];
const RANKS = [5, 4, 4, 2, 3, 1, 1, 2];

/** CalendarStrip defaults `end` to today, which is a hydration mismatch waiting
 *  to happen and a chart that silently changes shape overnight. Pin it. */
const CAL_END = "2026-06-27";
const CAL_DAYS = Array.from({ length: 56 }, (_, i) => ({
  date: new Date(Date.UTC(2026, 5, 27) - (55 - i) * 86_400_000).toISOString().slice(0, 10),
  value: SAMPLE[(i * 7) % SAMPLE.length] as number,
}));

const GRID_DAYS = Array.from({ length: 70 }, (_, i) => SAMPLE[(i * 3) % SAMPLE.length] as number);

const W = 84;
const H = 26;

/** Visual family, not chart taxonomy. The draw takes one from each before it
 *  takes a second from any, which is what stops four hairlines in a row. */
type Family = "line" | "bar" | "dot" | "grid" | "glyph" | "composite";
type Specimen = { readonly id: string; readonly family: Family; readonly node: ReactNode };

const POOL: readonly Specimen[] = [
  {
    id: "sparkline",
    family: "line",
    node: <Sparkline data={SHIPPED} width={W} height={H} summary="Public work shipped, by year" />,
  },
  {
    id: "change point",
    family: "line",
    node: (
      <ChangePoint
        data={REGIME}
        label="none"
        width={W}
        height={H}
        summary="Change point specimen, generic shape data"
      />
    ),
  },
  {
    id: "control strip",
    family: "line",
    node: (
      <ControlStrip
        data={PROCESS}
        width={W}
        height={H}
        summary="Control strip specimen, generic shape data"
      />
    ),
  },
  {
    id: "horizon",
    family: "line",
    node: (
      <Horizon
        data={SIGNED}
        folds={2}
        baseline={0}
        width={W}
        height={H}
        summary="Horizon specimen, generic shape data"
      />
    ),
  },
  {
    id: "bump strip",
    family: "line",
    node: (
      <BumpStrip
        data={RANKS}
        label="none"
        width={W}
        height={H}
        summary="Bump strip specimen, generic rank data"
      />
    ),
  },

  {
    id: "sparkbar",
    family: "bar",
    node: <SparkBar data={SHIPPED.slice(-8)} width={W} height={H} summary="The last eight years" />,
  },
  {
    id: "seismogram",
    family: "bar",
    node: (
      <Seismogram
        data={SIGNED}
        width={W}
        height={H}
        summary="Seismogram specimen, generic shape data"
      />
    ),
  },
  {
    id: "waveform",
    family: "bar",
    node: (
      <Waveform
        data={AMPLITUDE}
        width={W}
        height={H}
        summary="Waveform specimen, generic shape data"
      />
    ),
  },
  {
    id: "histogram strip",
    family: "bar",
    node: (
      <HistogramStrip
        data={SAMPLE}
        width={W}
        height={H}
        summary="Histogram specimen, generic sample"
      />
    ),
  },
  {
    id: "city skyline",
    family: "bar",
    node: (
      // No `width`: the skyline is sized by its bars, so the row width falls
      // out of bw + gap. Eight buildings at 7 + 3 land on 77.
      <CitySkyline
        data={RISING.slice(0, 8).map((v, i) => ({
          label: String.fromCharCode(65 + i),
          value: v,
          lit: (i % 4) / 4,
        }))}
        bw={7}
        gap={3}
        height={H}
        summary="City skyline specimen, generic shape data"
      />
    ),
  },

  {
    id: "dot plot",
    family: "dot",
    node: (
      <DotPlot
        data={[
          { label: "A", value: 3 },
          { label: "B", value: 5 },
          { label: "C", value: 8 },
          { label: "D", value: 6 },
        ]}
        width={W}
        height={H}
        summary="Dot plot specimen, generic shape data"
      />
    ),
  },
  {
    id: "quantile dots",
    family: "dot",
    node: (
      <QuantileDots
        data={SAMPLE}
        label="none"
        width={W}
        height={H}
        summary="Quantile dots specimen, generic sample"
      />
    ),
  },
  {
    id: "dumbbell",
    family: "dot",
    node: (
      <Dumbbell
        data={[
          { label: "A", from: 3, to: 8 },
          { label: "B", from: 5, to: 6 },
          { label: "C", from: 9, to: 4 },
        ]}
        width={W}
        height={H}
        summary="Dumbbell specimen, generic shape data"
      />
    ),
  },
  {
    id: "micro box",
    family: "dot",
    node: (
      <MicroBox data={SAMPLE} width={W} height={20} summary="Box plot specimen, generic sample" />
    ),
  },
  {
    id: "percentile ladder",
    family: "dot",
    node: (
      <PercentileLadder
        data={SAMPLE}
        width={W}
        height={H}
        summary="Percentile ladder specimen, generic sample"
      />
    ),
  },

  {
    id: "activity grid",
    family: "grid",
    node: (
      <ActivityGrid
        data={GRID_DAYS}
        cell={3}
        gap={1}
        summary="Activity grid specimen, generic shape data"
      />
    ),
  },
  {
    id: "calendar strip",
    family: "grid",
    node: (
      <CalendarStrip
        data={CAL_DAYS}
        end={CAL_END}
        weeks={8}
        cell={3}
        gap={1}
        summary="Calendar strip specimen, generic shape data"
      />
    ),
  },
  {
    id: "icon array",
    family: "grid",
    node: (
      // `value` is a RATE, not a count, and `total` is the grid size (10, 20 or
      // 100 only). Fifteen of fifty-five repos is the rate; twenty cells is the
      // resolution it is drawn at.
      <IconArray
        value={PUBLIC_WORK.npm / PUBLIC_WORK.repos}
        total={20}
        label="none"
        width={60}
        height={H}
        summary={`${PUBLIC_WORK.npm} of ${PUBLIC_WORK.repos} original public repositories ship to npm`}
      />
    ),
  },

  {
    id: "tally marks",
    family: "glyph",
    node: (
      <TallyMarks
        value={PUBLIC_WORK.npm}
        total={20}
        height={24}
        summary={`${PUBLIC_WORK.npm} packages published to npm`}
      />
    ),
  },
  {
    id: "dice pips",
    family: "glyph",
    node: <DicePips value={6} size={26} summary="Six inks in this drawing's palette" />,
  },
  {
    id: "micro donut",
    family: "glyph",
    node: (
      // Two wedges in the drawing's own ink rather than the library's
      // categorical hues. Those are tuned to be equiluminant so no series
      // shouts over another, which is right for a chart and wrong for a
      // specimen sitting inside a one-ink drawing.
      <MicroDonut
        data={[
          { label: "on npm", value: PUBLIC_WORK.npm },
          { label: "the rest", value: PUBLIC_WORK.repos - PUBLIC_WORK.npm },
        ]}
        size={30}
        colors={["var(--accent)", "var(--ink-3)"]}
        summary={`${PUBLIC_WORK.npm} of ${PUBLIC_WORK.repos} original public repositories ship to npm`}
      />
    ),
  },

  {
    id: "bullet",
    family: "composite",
    node: (
      <Bullet
        value={PUBLIC_WORK.stars}
        target={2052}
        domain={[0, 3500]}
        width={W}
        summary="Stars across every repo, against bttn.css alone"
      />
    ),
  },
  {
    id: "slope",
    family: "composite",
    node: (
      <Slope
        data={[{ label: "shipped", from: SHIPPED[0] as number, to: SHIPPED.at(-1) as number }]}
        width={60}
        height={H}
        summary="Public work shipped, first year against now"
      />
    ),
  },
  {
    id: "pareto strip",
    family: "composite",
    node: (
      <ParetoStrip
        data={[
          { label: "A", value: 42 },
          { label: "B", value: 26 },
          { label: "C", value: 15 },
          { label: "D", value: 9 },
          { label: "E", value: 8 },
        ]}
        label="none"
        width={W}
        height={H}
        summary="Pareto specimen, generic composition"
      />
    ),
  },
  {
    id: "stacked area",
    family: "composite",
    node: (
      // Same reason as the donut: three of the drawing's own tones instead of
      // three categorical hues that would be the only colour on the sheet.
      <StackedArea
        data={[
          { label: "A", values: RISING },
          { label: "B", values: RISING.toReversed() },
          { label: "C", values: RISING.map((v) => 18 - v) },
        ]}
        label="none"
        colors={["var(--accent)", "var(--ink-3)", "var(--rule-2)"]}
        width={W}
        height={H}
        summary="Stacked area specimen, generic shape data"
      />
    ),
  },
];

const FAMILIES: readonly Family[] = ["line", "bar", "dot", "grid", "glyph", "composite"];
const COUNT = 8;

function shuffled<T>(xs: readonly T[], rnd: () => number): T[] {
  const a = xs.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j] as T, a[i] as T];
  }
  return a;
}

/** Round-robin across the shuffled families, so eight picks can never be more
 *  than two of any one visual family. */
function draw(rnd: () => number): Specimen[] {
  const lanes = shuffled(FAMILIES, rnd).map((f) =>
    shuffled(
      POOL.filter((s) => s.family === f),
      rnd,
    ),
  );
  const out: Specimen[] = [];
  for (let round = 0; round < POOL.length && out.length < COUNT; round++) {
    for (const lane of lanes) {
      if (out.length === COUNT) break;
      const pick = lane[round];
      if (pick) out.push(pick);
    }
  }
  return out;
}

export function Specimens() {
  // Seed 0 is the server's draw and the client's first render, so the two agree;
  // the mount bumps it, and every bump after that is the reader re-rolling.
  // Math.random() during the render the server also performs is a hydration
  // mismatch, which is why this is a state bump rather than a call in place.
  const [seed, setSeed] = useState(0);
  const fx = useFX();
  const picks = useMemo(() => draw(seed === 0 ? () => 0 : Math.random), [seed]);

  useEffect(() => setSeed(1), []);

  return (
    <div className="specimens" role="group" aria-label="Chart specimens">
      {/* Keyed on the draw. The server renders a fixed eight and the mount
          re-rolls them, which is the point — a different eight each load — but
          as a hard swap it read as the page failing to settle. The tray fades
          the new set in over one frame's worth of animation instead. */}
      {picks.map((s) => (
        <span className="spec" key={`${seed}-${s.id}`}>
          <span className="spec-chart">{s.node}</span>
          <span className="lbl">{s.id}</span>
        </span>
      ))}

      <span className="specs-foot">
        <span className="specs-note">
          8 of the 106, a different eight each load · the real components, not screenshots
        </span>
        <button
          type="button"
          className="chip"
          data-analytics="cta:demo.microcharts-specimens"
          onClick={() => {
            setSeed((s) => s + 1);
            fx?.pluck(620);
          }}
        >
          draw another eight
        </button>
      </span>
    </div>
  );
}
