// G_PATH and BAR_PATH stay as constants so the mask <use> refs them by id
// without duplicating the geometry — keeps the glyph and its mask in sync.
const G_PATH =
  "M83.24629,105.00076l-28.79883.14941c-14.84912,0-28.34863-2.39941-40.498-13.64941C4.19941,82.35135,1.04951,69.75174.3,52.95242C1.9499,22.35281,21.44893,.4548,55.798,.00456c12.59961,1.0498,20.54883,3.75,25.79883,5.09961L64.49727,51.45242l19.499-.15039-0.75,46.94873v6.75ZM35.99824,90.15115L64.19648,12.15359C37.34834,9.00418,14.24922,22.50318,13.799,52.95242c-0.44968,17.39893,9.14993,31.19873,22.19924,37.19873Zm12.14941,3.2998c7.65039,0,18.89941-.4502,22.94922-0.4502l0.4502-32.24951H59.09688Z";
const BAR_PATH = "M0,118.215h84v12H0v-12Z";

export function GLogo({ size = 56 }: { size?: number }) {
  return (
    <svg
      className="glogo"
      viewBox="0 0 84 131.615"
      width={size}
      height={(size * 131.615) / 84}
      aria-hidden="true"
    >
      {/* Mask used for the fill-bloom: a white rect that fully covers the
          viewBox by default (so the fill is visible everywhere — the static
          state). Inside `.identity-mark` (only the hero), CSS animates the
          rect's `y` and `height` so the fill wipes downward from the top
          after the stroke finishes tracing. */}
      <defs>
        <mask id="glogo-fill-mask" maskUnits="userSpaceOnUse">
          <rect className="glogo-fill-wipe" x="0" y="0" width="84" height="131.615" fill="white" />
        </mask>
      </defs>

      <g>
        <path className="glogo-glyph glogo-glyph--trace" pathLength="100" d={G_PATH} />
        <path className="glogo-glyph glogo-glyph--fill" mask="url(#glogo-fill-mask)" d={G_PATH} />

        <path className="glogo-bar glogo-bar--trace" pathLength="100" d={BAR_PATH} />
        <path className="glogo-bar glogo-bar--fill" mask="url(#glogo-fill-mask)" d={BAR_PATH} />
      </g>
    </svg>
  );
}
