"use client";
import { useState } from "react";
import { Sparkline } from "@microcharts/react/sparkline/interactive";
import { Delta } from "@microcharts/react/delta";
import { Bullet } from "@microcharts/react/bullet";
import { StatusDot } from "@microcharts/react/status-dot";
import { Threshold, Marker } from "@microcharts/react/annotations";

type Service = {
  name: string;
  status: "ok" | "warn" | "busy";
  p95: number[]; // 30 days of p95 latency, ms
  delta: number; // week over week
  budget: number; // error budget consumed, %
  slo: number; // p95 SLO, ms
  incident?: { day: number; label: string };
};

const SERVICES: Service[] = [
  {
    name: "api",
    status: "ok",
    p95: [
      182, 175, 190, 171, 168, 177, 165, 172, 160, 158, 166, 154, 149, 158, 152, 147, 151, 143, 148,
      139, 145, 137, 133, 140, 131, 128, 134, 126, 129, 122,
    ],
    delta: -0.09,
    budget: 31,
    slo: 200,
  },
  {
    name: "web",
    status: "ok",
    p95: [
      95, 92, 99, 90, 94, 88, 91, 86, 93, 89, 84, 90, 87, 82, 88, 85, 80, 86, 83, 78, 84, 81, 77,
      83, 79, 76, 81, 78, 74, 77,
    ],
    delta: -0.04,
    budget: 12,
    slo: 120,
  },
  {
    name: "workers",
    status: "warn",
    p95: [
      310, 305, 318, 300, 312, 296, 308, 302, 290, 297, 305, 312, 328, 345, 502, 470, 391, 362, 344,
      351, 338, 346, 330, 342, 336, 348, 341, 352, 347, 358,
    ],
    delta: 0.06,
    budget: 78,
    slo: 400,
    incident: { day: 14, label: "queue backup" },
  },
  {
    name: "search",
    status: "busy",
    p95: [
      210, 204, 214, 199, 208, 195, 203, 198, 190, 196, 188, 194, 186, 191, 184, 189, 181, 187, 180,
      185, 178, 183, 176, 181, 175, 179, 173, 177, 172, 175,
    ],
    delta: -0.02,
    budget: 44,
    slo: 250,
  },
];

const fmt = (n: number) => `${Math.round(n)} ms`;

// Charts where the data already lives: a status dot, a 30-day trend and an
// error-budget bullet per table row, plus an annotated detail chart below.
// One import per chart type; the interaction contract is identical across all.
export function OpsBoard() {
  const [selected, setSelected] = useState(2); // start on the interesting row
  const [scrub, setScrub] = useState<Record<string, string>>({});
  const svc = SERVICES[selected];

  return (
    <section
      className="mcx-ops"
      aria-label="Live demo: a service health board composed from microcharts"
    >
      <div className="mcx-ops-head">
        <span className="mcx-ops-title">service health</span>
        <span className="mcx-ops-range">p95 latency · last 30 days</span>
      </div>
      <table className="mcx-ops-table">
        <thead>
          <tr>
            <th scope="col">service</th>
            <th scope="col">p95 trend</th>
            <th scope="col">now</th>
            <th scope="col">wow</th>
            <th scope="col">error budget</th>
          </tr>
        </thead>
        <tbody>
          {SERVICES.map((s, i) => (
            <tr key={s.name} data-active={i === selected || undefined}>
              <td>
                <button
                  type="button"
                  className="mcx-ops-svc"
                  aria-pressed={i === selected}
                  onClick={() => setSelected(i)}
                >
                  <StatusDot
                    status={s.status}
                    pulse={s.status !== "ok"}
                    title={`${s.name} status`}
                  />
                  <span>{s.name}</span>
                </button>
              </td>
              <td>
                <Sparkline
                  data={s.p95}
                  title={`${s.name} p95 latency, 30 days`}
                  width={110}
                  height={24}
                  style={{ width: 110 }}
                  readout={false}
                  format={fmt}
                  onActive={(d) =>
                    setScrub((m) => ({
                      ...m,
                      [s.name]: d && d.value != null ? (d.formatted ?? fmt(d.value)) : "",
                    }))
                  }
                />
              </td>
              <td className="mcx-ops-now">{scrub[s.name] || fmt(s.p95[s.p95.length - 1])}</td>
              <td>
                <Delta value={s.delta} positive="down" title={`${s.name} week over week`} />
              </td>
              <td>
                <Bullet
                  value={s.budget}
                  target={100}
                  bands={[50, 80]}
                  width={92}
                  height={14}
                  title={`${s.name} error budget consumed`}
                  format={(n) => `${Math.round(n)}%`}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mcx-ops-detail">
        <div className="mcx-ops-detail-head">
          <span className="mcx-ops-title">{svc.name} · detail</span>
          <span className="mcx-ops-range">
            SLO {svc.slo} ms
            {svc.incident ? ` · day ${svc.incident.day + 1}: ${svc.incident.label}` : ""}
          </span>
        </div>
        <Sparkline
          key={svc.name}
          data={svc.p95}
          title={`${svc.name} p95 latency with SLO threshold`}
          width={520}
          height={88}
          fill
          dots="minmax"
          format={fmt}
          style={{ width: "100%", height: "auto" }}
        >
          <Threshold y={svc.slo} label={`SLO ${svc.slo} ms`} />
          {svc.incident && <Marker x={svc.incident.day} />}
        </Sparkline>
      </div>
      <p className="mcx-ops-note">
        Five chart types, one table. The row sparklines pipe their readout into the "now" column via
        <code> readout=&#123;false&#125; + onActive</code>; click a service name for its annotated
        detail — a <code>Threshold</code> and a <code>Marker</code> passed as children, in data
        space. Every piece is a separate ~2–7 kB import; there is no "dashboard framework" here.
      </p>
    </section>
  );
}
