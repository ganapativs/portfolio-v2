"use client";
import { useEffect, useRef, useState } from "react";
import { Sparkline } from "@microcharts/react/sparkline/interactive";

const SERIES: { name: string; data: number[] }[] = [
  { name: "a good quarter", data: [3, 5, 4, 8, 6, 9] },
  { name: "a rough launch", data: [9, 7, 8, 4, 5, 2] },
  { name: "a slow recovery", data: [6, 2, 3, 3, 4, 5, 7] },
  { name: "pure chaos", data: [4, 9, 2, 8, 1, 7, 3] },
];

// The sentence shown below the chart is read from the live DOM: the actual
// aria-label the library generated for this exact data: so it cannot drift.
export function A11yDemo() {
  const [i, setI] = useState(0);
  const [sentence, setSentence] = useState("");
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const label = hostRef.current?.querySelector('[role="img"]')?.getAttribute("aria-label");
    if (label) setSentence(label);
  }, [i]);

  const current = SERIES[i];
  return (
    <section
      className="mcx-a11y"
      aria-label="Accessible-name demo: change the data, watch the generated sentence change"
    >
      <div className="mcx-a11y-stage" ref={hostRef}>
        <Sparkline
          key={current.name}
          data={current.data}
          title="Weekly revenue"
          width={220}
          height={56}
          dots="minmax"
        />
      </div>
      <blockquote key={current.name} className="mcx-a11y-sentence" aria-hidden="true">
        <span className="mcx-a11y-quote">“</span>
        {sentence || "…"}
        <span className="mcx-a11y-quote">”</span>
      </blockquote>
      <div className="mcx-a11y-controls">
        {SERIES.map((s, idx) => (
          <button
            key={s.name}
            type="button"
            className="mcx-chip"
            data-active={idx === i || undefined}
            onClick={() => setI(idx)}
          >
            {s.name}
          </button>
        ))}
      </div>
      <p className="mcx-a11y-note">
        That sentence is read from the rendered DOM: the literal <code>aria-label</code> the library
        just wrote for this data. Swap the data and it rewrites itself.
      </p>
    </section>
  );
}
