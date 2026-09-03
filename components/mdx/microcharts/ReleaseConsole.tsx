"use client";
import { Sparkline } from "@microcharts/react/sparkline/interactive";
import { Funnel } from "@microcharts/react/funnel/interactive";
import { RetentionCurve } from "@microcharts/react/retention-curve/interactive";
import { ForecastCone } from "@microcharts/react/forecast-cone/interactive";
import { ABStrips } from "@microcharts/react/ab-strips/interactive";
import { StackedArea } from "@microcharts/react/stacked-area/interactive";
import { StreakSpark } from "@microcharts/react/streak-spark/interactive";
import { ErrorBudget } from "@microcharts/react/error-budget/interactive";
import { EventTimeline } from "@microcharts/react/event-timeline/interactive";
import { Delta } from "@microcharts/react/delta";
import { StatusDot } from "@microcharts/react/status-dot";

// One coherent story: the week checkout-v2 shipped. Ten chart types, each
// answering the question a release owner actually asks, at the size the
// answer deserves. Every panel is its own ~2-7 kB import.
const MRR = [38.2, 41.5, 40.1, 44.8, 43.2, 47.9, 46.4, 51.3, 54.8, 53.1, 58.6, 62.4];

const T0 = Date.UTC(2026, 6, 20);
const H = 3600_000;

export function ReleaseConsole() {
  return (
    <section
      className="mcx-console"
      aria-label="Live demo: a release-week product console composed from ten microcharts types"
    >
      <div className="mcx-console-head">
        <span className="mcx-console-title">
          <StatusDot status="busy" pulse title="Rollout status" /> checkout-v2 · release week
        </span>
        <span className="mcx-console-range">staged rollout · 50% of traffic</span>
      </div>

      <div className="mcx-console-grid">
        <div className="mcx-panel">
          <span className="mcx-panel-top">
            <span className="mcx-panel-label">mrr, 12 months</span>
            <span className="mcx-panel-mode">interactive</span>
          </span>
          <Sparkline
            data={MRR}
            title="Monthly recurring revenue, 12 months"
            width={200}
            height={34}
            style={{ width: "100%" }}
            fill
            format={(n) => `$${n.toFixed(1)}k`}
          />
          <span className="mcx-panel-read">
            $62.4k <Delta value={0.19} title="MRR year over year" summary={false} /> YoY
          </span>
        </div>

        <div className="mcx-panel">
          <span className="mcx-panel-top">
            <span className="mcx-panel-label">signup funnel</span>
            <span className="mcx-panel-mode">interactive</span>
          </span>
          <Funnel
            data={[
              { label: "Visitors", value: 12400 },
              { label: "Signups", value: 5704 },
              { label: "Activated", value: 2730 },
              { label: "Paid", value: 1116 },
            ]}
            title="Signup funnel, this week"
            width={200}
            height={52}
            style={{ width: "100%" }}
          />
          <span className="mcx-panel-read">9% visitor → paid: the leak is activation</span>
        </div>

        <div className="mcx-panel">
          <span className="mcx-panel-top">
            <span className="mcx-panel-label">w12 cohort retention</span>
            <span className="mcx-panel-mode">interactive</span>
          </span>
          <RetentionCurve
            data={[1, 0.72, 0.55, 0.47, 0.42, 0.4, 0.39, 0.385, 0.382, 0.38, 0.379, 0.378]}
            unit="week"
            label="last"
            title="Week-12 cohort retention"
            width={200}
            height={34}
            style={{ width: "100%" }}
          />
          <span className="mcx-panel-read">plateaus at 38%: healthy for self-serve</span>
        </div>

        <div className="mcx-panel">
          <span className="mcx-panel-top">
            <span className="mcx-panel-label">quarter forecast</span>
            <span className="mcx-panel-mode">interactive</span>
          </span>
          <ForecastCone
            data={[30, 32, 31, 34, 36, 35, 38]}
            forecast={{
              mid: [39, 40, 41, 42],
              p80: [
                [36, 42],
                [35, 45],
                [34, 50],
                [33, 55],
              ],
              p50: [
                [37, 41],
                [37, 43],
                [36, 46],
                [35, 49],
              ],
            }}
            target={45}
            label="landing"
            title="Quarterly revenue forecast against target"
            width={200}
            height={34}
            style={{ width: "100%" }}
          />
          <span className="mcx-panel-read">$45k target inside the 80% band</span>
        </div>

        <div className="mcx-panel">
          <span className="mcx-panel-top">
            <span className="mcx-panel-label">checkout latency · a/b</span>
            <span className="mcx-panel-mode">interactive</span>
          </span>
          <ABStrips
            data={{
              a: Array.from({ length: 80 }, (_, i) => 130 + ((i * 13) % 44) - 22),
              b: Array.from({ length: 80 }, (_, i) => 116 + ((i * 13) % 44) - 22),
            }}
            seriesLabels={["v1", "v2"]}
            positive="down"
            format={{
              style: "unit",
              unit: "millisecond",
              unitDisplay: "short",
              maximumFractionDigits: 0,
            }}
            title="Checkout latency, v1 versus v2"
            width={200}
            height={30}
            style={{ width: "100%" }}
          />
          <span className="mcx-panel-read">v2 ~14 ms faster at the median</span>
        </div>

        <div className="mcx-panel">
          <span className="mcx-panel-top">
            <span className="mcx-panel-label">traffic mix, 12 weeks</span>
            <span className="mcx-panel-mode">interactive</span>
          </span>
          <StackedArea
            data={[
              { label: "Mobile", values: [30, 34, 36, 40, 44, 47, 52, 56, 58, 60, 63, 66] },
              { label: "Web", values: [50, 48, 47, 45, 42, 41, 38, 36, 35, 33, 32, 30] },
              { label: "API", values: [20, 18, 17, 15, 14, 12, 10, 8, 7, 7, 5, 4] },
            ]}
            title="Traffic mix by platform, 12 weeks"
            width={200}
            height={34}
            style={{ width: "100%" }}
          />
          <span className="mcx-panel-read">mobile crossed web in May</span>
        </div>

        <div className="mcx-panel">
          <span className="mcx-panel-top">
            <span className="mcx-panel-label">deploys, last 19</span>
            <span className="mcx-panel-mode">interactive</span>
          </span>
          <StreakSpark
            data={[1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 1]}
            label="both"
            title="Deploy success streak"
            width={200}
            height={36}
            style={{ width: "100%" }}
          />
          <span className="mcx-panel-read">two reds Thursday: both rolled back clean</span>
        </div>

        <div className="mcx-panel">
          <span className="mcx-panel-top">
            <span className="mcx-panel-label">checkout slo · 30d budget</span>
            <span className="mcx-panel-mode">interactive</span>
          </span>
          <ErrorBudget
            data={[1, 0.96, 0.93, 0.9, 0.86, 0.83, 0.79, 0.75, 0.71, 0.67, 0.64, 0.62]}
            window={30}
            unit="day"
            label="remaining"
            title="Checkout SLO error budget, 30-day window"
            width={200}
            height={34}
            style={{ width: "100%" }}
          />
          <span className="mcx-panel-read">62% left: spend it on the next migration</span>
        </div>

        <div className="mcx-panel">
          <span className="mcx-panel-top">
            <span className="mcx-panel-label">release day</span>
            <span className="mcx-panel-mode">interactive</span>
          </span>
          <EventTimeline
            data={[
              { start: T0 + 1 * H, end: T0 + 5 * H, label: "Freeze", kind: "accent" },
              { start: T0 + 6 * H, end: T0 + 15 * H, label: "Canary", kind: "positive" },
              { start: T0 + 11 * H, label: "Alert", kind: "negative" },
              { start: T0 + 16 * H, end: T0 + 18 * H, label: "Hold", kind: "negative" },
              { start: T0 + 20 * H, label: "50%" },
            ]}
            domain={[T0, T0 + 24 * H]}
            title="Release day timeline"
            width={200}
            height={34}
            style={{ width: "100%" }}
          />
          <span className="mcx-panel-read">one alert, held two hours, resumed</span>
        </div>
      </div>

      <p className="mcx-console-note">
        Ten chart types, one story, no dashboard framework: a CSS grid where every cell answers one
        question. Every panel here is the interactive build: hover or arrow keys to read values,
        click to pin. Each type also ships a static twin that renders the same geometry with zero
        client JavaScript.
      </p>
    </section>
  );
}
