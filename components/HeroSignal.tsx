import { Sparkline } from "@microcharts/react/sparkline";
import { Sparkline as SparklineLive } from "@microcharts/react/sparkline/interactive";
import { SparkBar } from "@microcharts/react/sparkbar";
import { Seismogram } from "@microcharts/react/seismogram";
import { HeatStrip } from "@microcharts/react/heat-strip";
import { Waveform } from "@microcharts/react/waveform";
import { WinProbWorm } from "@microcharts/react/win-prob-worm";
import { MiniBar } from "@microcharts/react/mini-bar";
import { SegmentedBar } from "@microcharts/react/segmented-bar";
import { StatusDot } from "@microcharts/react/status-dot";
import { Delta } from "@microcharts/react/delta";
import { ParticlePortrait } from "./ParticlePortrait";

// Public GitHub contributions per year, 2015 → 2026 (2026 partial) — fetched
// from the GitHub contributions API. Real data; refresh it now and then.
const CONTRIBUTIONS = [1601, 3280, 2777, 2104, 2733, 1418, 1233, 885, 449, 546, 507, 840];
const STARS = [
  { label: "bttn.css", value: 2051 },
  { label: "react-spectrum", value: 318 },
  { label: "53 more", value: 130 },
];
const wave = Array.from({ length: 40 }, (_, i) => Math.sin(i / 2.2) * (1 - i / 80) + 0.2);

// The wall tiles are the static, RSC-safe builds — zero client JS. Only the
// portrait canvas and the chip sparkline hydrate.
const WALL_TILES = [
  <Sparkline key="s" data={CONTRIBUTIONS} title="Commits" width={110} height={26} fill />,
  <SparkBar key="b" data={[4, 6, 2, 8, 5, 9, 3, 7]} title="Deploys" width={110} height={26} />,
  <Waveform key="w" data={wave} title="Waveform" width={110} height={26} />,
  <WinProbWorm
    key="p"
    data={[50, 54, 48, 61, 58, 70, 79, 86, 90]}
    title="Win probability"
    width={110}
    height={26}
  />,
  <HeatStrip key="h" data={[2, 4, 3, 6, 8, 7, 9, 5, 3, 2]} title="Load" width={110} height={16} />,
  <Seismogram
    key="q"
    data={[1, 2, 1, 3, 2, 6, 2, 1, 4, 9, 3, 1]}
    title="Bursts"
    width={110}
    height={26}
  />,
  <MiniBar key="m" data={STARS} title="Stars" width={110} height={32} />,
  <SegmentedBar
    key="g"
    data={[
      { label: "core", value: 34 },
      { label: "decision", value: 26 },
      { label: "expressive", value: 23 },
      { label: "frontier", value: 23 },
    ]}
    title="106 chart types by tier"
    width={110}
    height={14}
  />,
];

function WallColumn({ reverse }: { reverse?: boolean }) {
  return (
    <div className={reverse ? "hero-wall-col hero-wall-col--rev" : "hero-wall-col"}>
      <div className="hero-wall-track">
        {[0, 1].map((dup) => (
          <div className="hero-wall-set" key={dup} aria-hidden={dup === 1 || undefined}>
            {WALL_TILES.map((t, i) => (
              <div className="hero-wall-tile" key={i}>
                {t}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// The hero's right stage: a wall of word-sized charts drifting behind the
// particle-portrait coin, with two floating data chips. All numbers real.
export function HeroSignal() {
  return (
    <div className="hero-stage">
      <div className="hero-wall" aria-hidden="true">
        <WallColumn />
        <WallColumn reverse />
      </div>
      <div className="hero-medallion">
        <span className="hero-halo hero-halo--1" aria-hidden="true" />
        <span className="hero-halo hero-halo--2" aria-hidden="true" />
        <span className="hero-coin">
          <ParticlePortrait width={280} shape="circle" mode="print" />
        </span>
        <span className="hero-chip hero-chip--1">
          <StatusDot status="busy" pulse title="Currently shipping" /> shipping weekly
        </span>
        <span className="hero-chip hero-chip--2">
          <SparklineLive
            data={CONTRIBUTIONS}
            title="Public GitHub contributions per year, 2015 to 2026"
            width={84}
            height={20}
            style={{ width: 84 }}
          />
          <Delta value={0.66} title="2026 commits versus 2025" summary={false} /> commits
        </span>
      </div>
      <span className="hero-caption">a decade of public work, sampled as dots</span>
    </div>
  );
}
