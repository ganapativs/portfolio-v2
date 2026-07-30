"use client";
import { useInk } from "@/components/providers/InkProvider";
import { MODE_LABEL } from "@/lib/ink";

/**
 * The ink library, laid out like a colour chart at the foot of the page. Same
 * state as the dock's popover — this is the browsable version of it, and the
 * one that names what you are looking at.
 */
export function InkLibrary() {
  const { ink, mode, setInk, inks } = useInk();
  const current = inks.find((i) => i.id === ink) ?? inks[0];

  return (
    <section className="inklib" aria-labelledby="inklib-h">
      <div className="inklib-head">
        <span id="inklib-h">Ink library · six colours named after one city · pick one</span>
        <span className="inklib-name">
          {current.label}
          {mode !== "colorful" ? ` · ${MODE_LABEL[mode]}` : ""}
        </span>
      </div>
      <div className="inklib-grid">
        {inks.map((i) => (
          <button
            key={i.id}
            type="button"
            className="swatch"
            data-ink-id={i.id}
            aria-label={i.label}
            aria-pressed={ink === i.id}
            onClick={() => setInk(i.id, "library")}
          />
        ))}
      </div>
      <div className="swatch-names" aria-hidden="true">
        {inks.map((i) => (
          <span key={i.id} data-on={ink === i.id}>
            {i.label}
          </span>
        ))}
      </div>
    </section>
  );
}
