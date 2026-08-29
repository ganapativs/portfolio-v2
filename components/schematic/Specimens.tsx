"use client";
import "@microcharts/react/styles.css";
import { Sparkline } from "@microcharts/react/sparkline/interactive";
import { SparkBar } from "@microcharts/react/sparkbar/interactive";
import { Delta } from "@microcharts/react/delta/interactive";
import { Bullet } from "@microcharts/react/bullet/interactive";
import { MicroDonut } from "@microcharts/react/micro-donut/interactive";
import { DotPlot } from "@microcharts/react/dot-plot/interactive";
import { ActivityGrid } from "@microcharts/react/activity-grid/interactive";
import { Slope } from "@microcharts/react/slope/interactive";
import { CHART } from "@/app/(press)/content";

/**
 * Eight of the 106, rendered by the library itself.
 *
 * These are not pictures of charts. Every one is the shipped component from
 * `@microcharts/react`, at the size it is meant to be read at, taking the
 * drawing's ink through the `--mc-*` bridge in tokens.css. Hover one and it
 * does what it does anywhere else, because it is the same code. A hand-drawn
 * approximation would have quietly argued against the panel it sits in.
 *
 * The series are the site's own numbers wherever the site has them: the
 * sparkline and the slope are the shipped-work curve fig. 6 is built from, and
 * the bullet is the star count against the round number people quote.
 */
const SHIPPED = CHART.map((c) => 52 - c.y);

export function Specimens() {
  return (
    <div className="specimens" aria-label="Chart specimens">
      <Spec label="sparkline">
        <Sparkline data={SHIPPED} width={72} height={20} title="Public work shipped by year" />
      </Spec>

      <Spec label="sparkbar">
        <SparkBar data={SHIPPED.slice(-8)} width={72} height={20} title="The last eight years" />
      </Spec>

      <Spec label="delta">
        <Delta value={2052} from={1900} title="bttn.css stars since the Product Hunt week" />
      </Spec>

      <Spec label="bullet">
        <Bullet
          value={2400}
          target={2052}
          domain={[0, 3000]}
          width={72}
          title="Stars across every repo against bttn.css alone"
        />
      </Spec>

      <Spec label="dot plot">
        <DotPlot
          data={[
            { label: "sparkline", value: 1.2 },
            { label: "delta", value: 1.6 },
            { label: "bullet", value: 3.1 },
            { label: "activity grid", value: 4.4 },
            { label: "seismogram", value: 6.8 },
          ]}
          width={72}
          height={20}
          title="Gzipped kilobytes per chart type"
        />
      </Spec>

      <Spec label="micro donut">
        <MicroDonut
          data={[
            { label: "at work", value: 7 },
            { label: "own time", value: 5 },
          ]}
          size={20}
          title="Twelve years, split between the day job and my own time"
        />
      </Spec>

      <Spec label="slope">
        <Slope
          data={[{ label: "repos", from: 12, to: 55 }]}
          width={72}
          height={20}
          title="Public repositories, first year to now"
        />
      </Spec>

      <Spec label="activity grid">
        <ActivityGrid
          data={SHIPPED.flatMap((v) => [v, Math.round(v * 0.6), Math.round(v * 0.3)])}
          cell={4}
          gap={1}
          title="Shipping cadence"
        />
      </Spec>

      <span className="specs-note">8 of the 106, rendered by the library itself · hover one</span>
    </div>
  );
}

function Spec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <span className="spec">
      <span className="spec-chart">{children}</span>
      <span className="lbl">{label}</span>
    </span>
  );
}
