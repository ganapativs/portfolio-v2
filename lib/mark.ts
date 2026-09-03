/**
 * The G, as raw path data.
 *
 * One copy, because it is drawn by four renderers that cannot share a
 * component: the inline mark in the header (components/schematic/Mark.tsx,
 * which paints the bar in the live ink), the SVG favicon (app/icon.tsx, a
 * string of markup), the PNG icon family (lib/icon-png.tsx, through satori),
 * and the share card (lib/og.tsx, also satori). A React component, a
 * hand-built SVG string and satori have nothing in common except the `d`
 * attribute, so that is what lives here.
 */
export const MARK_VIEWBOX = { width: 84, height: 131.615 } as const;

export const MARK_G_PATH =
  "M83.24629,105.00076l-28.79883.14941c-14.84912,0-28.34863-2.39941-40.498-13.64941C4.19941,82.35135,1.04951,69.75174.3,52.95242C1.9499,22.35281,21.44893,.4548,55.798,.00456c12.59961,1.0498,20.54883,3.75,25.79883,5.09961L64.49727,51.45242l19.499-.15039-0.75,46.94873v6.75ZM35.99824,90.15115L64.19648,12.15359C37.34834,9.00418,14.24922,22.50318,13.799,52.95242c-0.44968,17.39893,9.14993,31.19873,22.19924,37.19873Zm12.14941,3.2998c7.65039,0,18.89941-.4502,22.94922-0.4502l0.4502-32.24951H59.09688Z";

/** The underscore under the G — the part that carries the ink. */
export const MARK_BAR_PATH = "M0,118.215h84v12H0v-12Z";

/** The mark as a standalone SVG document, filled with one colour. */
export function markSvg(fill: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${MARK_VIEWBOX.width} ${MARK_VIEWBOX.height}" fill="${fill}">` +
    `<path d="${MARK_G_PATH}"/><path d="${MARK_BAR_PATH}"/></svg>`
  );
}
