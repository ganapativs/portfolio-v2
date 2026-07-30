// The G, carried over from the retired design's identity mark. That version
// traces itself on the hero; this one is a plain two-colour glyph, because in
// the press design the mark is chrome — it sits in the folio bar, the masthead
// line and the colophon, where an animation would be noise.
//
// It inherits currentColor, so the ink follows whatever it sits in.
//
// Size and vertical placement are CSS's job (`.mark` in styles/press/chrome.css)
// and are expressed in em, so the mark scales with the text beside it wherever
// it lands. The width/height attributes below only set the intrinsic ratio.
const G_PATH =
  "M83.24629,105.00076l-28.79883.14941c-14.84912,0-28.34863-2.39941-40.498-13.64941C4.19941,82.35135,1.04951,69.75174.3,52.95242C1.9499,22.35281,21.44893,.4548,55.798,.00456c12.59961,1.0498,20.54883,3.75,25.79883,5.09961L64.49727,51.45242l19.499-.15039-0.75,46.94873v6.75ZM35.99824,90.15115L64.19648,12.15359C37.34834,9.00418,14.24922,22.50318,13.799,52.95242c-0.44968,17.39893,9.14993,31.19873,22.19924,37.19873Zm12.14941,3.2998c7.65039,0,18.89941-.4502,22.94922-0.4502l0.4502-32.24951H59.09688Z";
const BAR_PATH = "M0,118.215h84v12H0v-12Z";

export function Mark({ className }: { className?: string }) {
  return (
    <svg
      className={`mark${className ? ` ${className}` : ""}`}
      viewBox="0 0 84 131.615"
      width="84"
      height="131.615"
      aria-hidden="true"
      focusable="false"
    >
      <path d={G_PATH} fill="currentColor" />
      {/* The underscore is the one part that carries the ink. */}
      <path className="mark-bar" d={BAR_PATH} fill="currentColor" />
    </svg>
  );
}
