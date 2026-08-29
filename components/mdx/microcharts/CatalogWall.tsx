"use client";
import { useEffect, useRef } from "react";
import { Sparkline } from "@microcharts/react/sparkline/interactive";
import { SparkBar } from "@microcharts/react/sparkbar/interactive";
import { Seismogram } from "@microcharts/react/seismogram/interactive";
import { WinProbWorm } from "@microcharts/react/win-prob-worm/interactive";
import { Delta } from "@microcharts/react/delta/interactive";
import { Bullet } from "@microcharts/react/bullet/interactive";
import { StatusDot } from "@microcharts/react/status-dot/interactive";
import { ActivityGrid } from "@microcharts/react/activity-grid/interactive";
import { HeatStrip } from "@microcharts/react/heat-strip/interactive";
import { Slope } from "@microcharts/react/slope/interactive";
import { Dumbbell } from "@microcharts/react/dumbbell/interactive";
import { Waterfall } from "@microcharts/react/waterfall/interactive";
import { MiniBar } from "@microcharts/react/mini-bar/interactive";
import { SegmentedBar } from "@microcharts/react/segmented-bar/interactive";
import { MicroDonut } from "@microcharts/react/micro-donut/interactive";
import { CitySkyline } from "@microcharts/react/city-skyline/interactive";
import { Waveform } from "@microcharts/react/waveform/interactive";
import { Ohlc } from "@microcharts/react/ohlc/interactive";
import { ProgressRing } from "@microcharts/react/progress-ring/interactive";
import { TallyMarks } from "@microcharts/react/tally-marks/interactive";

// One believable dataset per tile: the wall demos the real components,
// not screenshots, so it re-themes with the site accent and stays crisp.
const wave = Array.from({ length: 48 }, (_, i) => Math.sin(i / 2.4) * (1 - i / 96) + 0.2);

const TILES: { label: string; chart: React.ReactNode; hint?: string }[] = [
  {
    label: "sparkline",
    chart: (
      <Sparkline data={[3, 5, 4, 7, 6, 9, 8, 11]} title="Weekly revenue" width={120} height={28} />
    ),
  },
  {
    label: "sparkbar",
    chart: (
      <SparkBar data={[4, 6, 2, 8, 5, 9, 3, 7]} title="Deploys per day" width={120} height={28} />
    ),
  },
  { label: "delta", chart: <Delta value={0.124} title="MoM growth" /> },
  {
    label: "bullet",
    chart: <Bullet value={72} target={80} title="Quota" width={120} height={16} />,
  },
  { label: "status-dot", chart: <StatusDot status="busy" pulse title="API status" /> },
  {
    label: "activity-grid",
    chart: (
      <ActivityGrid
        data={[0, 2, 1, 4, 0, 3, 5, 1, 0, 2, 6, 3, 1, 4, 2, 0, 5, 3, 2, 1, 4, 6, 2, 3, 1, 0, 2, 4]}
        title="Four weeks of commits"
        cell={9}
        gap={3}
      />
    ),
  },
  {
    label: "seismogram",
    chart: (
      <Seismogram
        data={[1, 2, 1, 3, 2, 6, 2, 1, 0, 2, 1, 4, 9, 3, 1, 2]}
        title="Error bursts"
        width={120}
        height={28}
      />
    ),
  },
  {
    label: "heat-strip",
    chart: (
      <HeatStrip data={[2, 4, 3, 6, 8, 7, 9, 5, 3, 2, 4, 6]} title="Load by hour" width={120} />
    ),
  },
  {
    label: "slope",
    chart: (
      <Slope
        data={[
          { label: "web", from: 61, to: 74 },
          { label: "mobile", from: 48, to: 52 },
          { label: "api", from: 70, to: 66 },
        ]}
        title="Conversion, Q1 to Q2"
        width={120}
      />
    ),
  },
  {
    label: "dumbbell",
    chart: (
      <Dumbbell
        data={[
          { label: "p50", from: 180, to: 110 },
          { label: "p95", from: 340, to: 205 },
        ]}
        title="Latency before and after"
        width={120}
      />
    ),
  },
  {
    label: "waterfall",
    chart: (
      <Waterfall
        data={[
          { label: "new", value: 42 },
          { label: "churn", value: -11 },
          { label: "upsell", value: 17 },
          { label: "downgrade", value: -6 },
        ]}
        title="Net revenue movement"
        width={120}
      />
    ),
  },
  {
    label: "mini-bar",
    chart: (
      <MiniBar
        data={[
          { label: "docs", value: 41 },
          { label: "blog", value: 26 },
          { label: "home", value: 19 },
        ]}
        title="Traffic by page"
        width={120}
        height={40}
      />
    ),
  },
  {
    label: "segmented-bar",
    chart: (
      <SegmentedBar
        data={[
          { label: "organic", value: 58 },
          { label: "referral", value: 27 },
          { label: "paid", value: 15 },
        ]}
        title="Traffic mix"
        width={120}
      />
    ),
  },
  {
    label: "micro-donut",
    chart: (
      <MicroDonut
        data={[
          { label: "used", value: 68 },
          { label: "free", value: 32 },
        ]}
        title="Storage"
        style={{ width: 40, height: 40 }}
      />
    ),
  },
  {
    label: "win-prob-worm",
    chart: (
      <WinProbWorm
        data={[50, 54, 48, 61, 58, 70, 66, 79, 74, 86, 90]}
        title="Win probability"
        width={120}
        height={28}
      />
    ),
  },
  {
    label: "city-skyline",
    chart: (
      <CitySkyline
        data={[
          { label: "mon", value: 8, lit: 5 },
          { label: "tue", value: 12, lit: 9 },
          { label: "wed", value: 7, lit: 7 },
          { label: "thu", value: 14, lit: 8 },
          { label: "fri", value: 10, lit: 4 },
        ]}
        title="Rooms booked vs occupied"
      />
    ),
  },
  { label: "waveform", chart: <Waveform data={wave} title="Voice note" width={120} height={28} /> },
  {
    label: "ohlc",
    chart: (
      <Ohlc
        data={[
          { open: 12, high: 15, low: 11, close: 14 },
          { open: 14, high: 16, low: 13, close: 13 },
          { open: 13, high: 17, low: 12, close: 16 },
          { open: 16, high: 19, low: 15, close: 18 },
        ]}
        title="Weekly range"
        width={120}
        height={28}
      />
    ),
  },
  {
    label: "progress-ring",
    chart: (
      <ProgressRing value={68} max={100} title="Migration" style={{ width: 40, height: 40 }} />
    ),
  },
  { label: "tally-marks", chart: <TallyMarks value={13} title="Incidents this quarter" /> },
];

export function CatalogWall() {
  const gridRef = useRef<HTMLDivElement>(null);

  // Stagger the tiles in when the wall first scrolls into view: the wall is
  // the post's first big moment, so it earns an entrance. Reduced-motion users
  // get the static grid (CSS gates the transition).
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          grid.dataset.in = "";
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(grid);
    return () => io.disconnect();
  }, []);

  return (
    <figure
      className="mcx-wall"
      aria-label="A sampler of 20 microcharts chart types, rendered live"
    >
      <div className="mcx-wall-grid" ref={gridRef}>
        {TILES.map((t, i) => (
          <div key={t.label} className="mcx-tile" style={{ ["--tile-i" as string]: i }}>
            <div className="mcx-tile-chart">{t.chart}</div>
            <div className="mcx-tile-label">
              {t.label}
              {t.hint && <span className="mcx-tile-hint"> · {t.hint}</span>}
            </div>
          </div>
        ))}
        <a
          className="mcx-tile mcx-tile--more"
          href="https://microcharts.dev/charts"
          target="_blank"
          rel="noreferrer"
        >
          <span className="mcx-tile-more-figure">+86</span>
          <span className="mcx-tile-label">the other 86 →</span>
        </a>
      </div>
      <figcaption className="mcx-wall-caption">
        20 of the 106 types: the shipped components, drawn in this site's palette, not screenshots.
        All interactive: hover or arrow keys to activate a unit, click or Enter to pin its readout,
        Escape to clear.
      </figcaption>
    </figure>
  );
}
