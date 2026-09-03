"use client";
import { useState } from "react";
import { Sparkline } from "@microcharts/react/sparkline/interactive";

const REVENUE = [38.2, 41.5, 40.1, 44.8, 43.2, 47.9, 46.4, 51.3, 54.8, 53.1, 58.6, 62.4];
const LATEST = `$${REVENUE[REVENUE.length - 1].toFixed(1)}k`;

// `readout={false}` + `onActive`: the chart's readout chip moves into the KPI
// figure, so scrubbing the sparkline drives the headline number.
export function KpiDemo() {
  const [figure, setFigure] = useState(LATEST);
  const [month, setMonth] = useState("December");
  return (
    <section
      className="mcx-kpi"
      aria-label="Live KPI card demo: scrub the sparkline and the number follows"
    >
      <div className="mcx-kpi-copy">
        <div className="mcx-kpi-label">Monthly recurring revenue</div>
        <div className="mcx-kpi-figure" aria-live="off">
          {figure}
        </div>
        <div className="mcx-kpi-sub">{month}</div>
      </div>
      <div className="mcx-kpi-chart">
        <Sparkline
          data={REVENUE}
          title="Monthly recurring revenue"
          readout={false}
          width={150}
          height={40}
          style={{ width: 150 }}
          fill
          onActive={(d) => {
            if (d && d.value != null) {
              setFigure(`$${d.value.toFixed(1)}k`);
              setMonth(
                [
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ][d.index] ?? "",
              );
            } else {
              setFigure(LATEST);
              setMonth("December");
            }
          }}
        />
        <div className="mcx-kpi-hint">hover or arrow-key the line: the number follows</div>
      </div>
    </section>
  );
}
