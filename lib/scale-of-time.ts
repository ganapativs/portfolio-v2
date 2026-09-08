/**
 * Fig. 3 — scale of time, wound into its logarithmic groove.
 *
 * The site draws 13.8 billion years as 13,800 dots on a flat field and then
 * winds that line into a spiral where one turn is a power of ten. This module
 * is the same construction at plate size, and it is drawn from the site's real
 * data rather than from a plausible-looking scatter: every mark is one of the
 * 1,040 sourced milestones, placed at its own "years ago".
 *
 * `AGO` is those 1,040 values, newest last, to four significant figures —
 * which is more than the geometry can spend, since a mark's angle is
 * log10(yearsAgo) and its position rounds to a tenth of a viewBox unit.
 * Regenerate it from the sibling repo:
 *
 *   node -e 'const d=require("../scale-of-time/data/events.json"); \
 *     console.log(d.map(e=>e.yearsAgo).filter(v=>v>0).sort((a,b)=>b-a) \
 *       .map(v=>v.toPrecision(4)/1).join(","))'
 *
 * Nothing here is a colour or a size the sheet does not already own: the module
 * emits path data and the stylesheet inks it. It is imported by a server
 * component only, so the 1,040 values never enter a client chunk — the browser
 * gets the finished paths as HTML and no script at all.
 */

/* ---- the plate ----------------------------------------------------------- */

/** A square plate, the size the other figures on this sheet are drawn at. */
export const VIEW = { w: 300, h: 300 } as const;
const CX = 150;
const CY = 150;
/** The groove runs from this radius in to this one. */
const RO = 138;
const RI = 9;
/** Turns, counted outwards. Turn 0 is 10 bn years ago; the Big Bang is just past it. */
const T0 = -0.14;
const T1 = 11.6;
const SPAN = T1 - T0;
/** Radius given up per turn. */
const K = (RO - RI) / SPAN;

/** Which turn of the groove a "years ago" value falls on. Powers of ten land on whole turns. */
const turnOf = (yearsAgo: number) =>
  10 - Math.min(T1, Math.max(-0.2, Math.log10(Math.max(yearsAgo, 1e-3))));
const radiusOf = (turn: number) => RO - K * (turn - T0);

/** A point on the groove, optionally pushed across it so marks sharing a turn stay apart. */
function polar(turn: number, offset = 0): [number, number] {
  const th = turn * 2 * Math.PI - Math.PI / 2;
  const r = radiusOf(turn) + offset;
  return [CX + r * Math.cos(th), CY + r * Math.sin(th)];
}

/**
 * The groove as cubic arcs, twelve to a turn: smooth at any zoom, and about
 * 6 kB of path rather than the 30 a polyline of the same fidelity would cost.
 */
export const GROOVE = (() => {
  const dr = -K / (2 * Math.PI); // radius per radian, for the tangents
  const at = (t: number) => {
    const th = t * 2 * Math.PI - Math.PI / 2;
    const r = radiusOf(t);
    const c = Math.cos(th);
    const s = Math.sin(th);
    return { x: CX + r * c, y: CY + r * s, dx: dr * c - r * s, dy: dr * s + r * c };
  };
  const n = Math.round(SPAN * 12);
  const dt = SPAN / n;
  const h = -((dt * 2 * Math.PI) / 3);
  let a = at(T1);
  let d = `M${a.x.toFixed(2)} ${a.y.toFixed(2)}`;
  for (let i = 1; i <= n; i++) {
    const b = at(T1 - i * dt);
    d += `C${(a.x + a.dx * h).toFixed(2)} ${(a.y + a.dy * h).toFixed(2)} ${(b.x - b.dx * h).toFixed(2)} ${(b.y - b.dy * h).toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
    a = b;
  }
  return d;
})();

/** The 1,040 milestones, oldest first. See the regeneration line above. */
const AGO: readonly number[] =
  "1.38e+10,1.38e+10,1.38e+10,1.38e+10,1.38e+10,1.38e+10,1.38e+10,1.38e+10,1.37e+10,1.365e+10,1.364e+10,1.36e+10,1.35e+10,1.34e+10,1.333e+10,1.3e+10,1.29e+10,1.285e+10,1.26e+10,1.2e+10,1.08e+10,1e+10,8e+09,6.7e+09,4.6e+09,4.58e+09,4.568e+09,4.54e+09,4.54e+09,4.5e+09,4.404e+09,4.2e+09,4.03e+09,3.9e+09,3.8e+09,3.7e+09,3.43e+09,2.46e+09,2.45e+09,2.4e+09,1.87e+09,1.8e+09,1.1e+09,1.047e+09,7.17e+08,5.75e+08,5.388e+08,5.18e+08,5.05e+08,4.45e+08,4.33e+08,4.25e+08,3.85e+08,3.75e+08,3.722e+08,3.589e+08,3.18e+08,3.05e+08,3e+08,2.519e+08,2.31e+08,2.05e+08,2.014e+08,2e+08,1.5e+08,1.25e+08,6.8e+07,6.6e+07,6.6e+07,6.6e+07,5.6e+07,5.5e+07,5e+07,4.13e+07,3.5e+07,3.39e+07,2.3e+07,2.1e+07,7e+06,5.33e+06,3.7e+06,3.3e+06,3.2e+06,3e+06,2.9e+06,2.58e+06,2.4e+06,2e+06,1.8e+06,1.76e+06,1.75e+06,1.6e+06,1e+06,6.09e+05,4.3e+05,3.15e+05,3e+05,3e+05,2.5e+05,2.33e+05,2e+05,1.7e+05,1.7e+05,1e+05,1e+05,7.4e+04,7.3e+04,6.5e+04,6.5e+04,6.4e+04,5.12e+04,5e+04,5e+04,4e+04,4e+04,4e+04,3.6e+04,3.4e+04,3e+04,2.8e+04,2.6e+04,2.3e+04,2.1e+04,2e+04,1.7e+04,1.6e+04,1.5e+04,1.45e+04,1.45e+04,1.44e+04,1.4e+04,1.3e+04,1.29e+04,1.202e+04,1.202e+04,1.17e+04,1.152e+04,1.05e+04,1.002e+04,1e+04,9525,9525,9025,9025,9025,8525,8225,8025,8000,7525,5525,5325,5275,5225,5225,5125,5125,5125,5025,5025,4675,4625,4625,4525,4525,4525,4425,4425,4359,4325,4225,4225,4125,4125,4025,3925,3825,3778,3775,3675,3625,3625,3575,3525,3525,3504,3425,3375,3348,3299,3275,3275,3275,3225,3225,3225,3225,3225,3175,3125,3071,3025,3025,3025,2936,2925,2839,2825,2801,2778,2775,2769,2750,2740,2725,2675,2625,2625,2625,2625,2624,2612,2610,2594,2576,2575,2575,2564,2555,2540,2534,2533,2525,2525,2515,2505,2497,2475,2475,2474,2472,2456,2455,2455,2425,2425,2425,2424,2412,2375,2375,2375,2351,2348,2345,2337,2325,2325,2325,2325,2325,2305,2305,2285,2275,2275,2275,2275,2275,2275,2272,2265,2246,2245,2243,2235,2234,2227,2225,2221,2175,2166,2152,2139,2125,2125,2116,2098,2074,2069,2055,2054,2052,2044,2017,1996,1976,1976,1966,1956,1956,1947,1946,1926,1926,1926,1921,1909,1904,1899,1894,1876,1876,1876,1876,1864,1861,1826,1826,1806,1802,1742,1726,1713,1704,1701,1696,1676,1676,1676,1660,1646,1626,1626,1626,1626,1616,1611,1599,1575,1556,1550,1527,1526,1526,1496,1492,1490,1489,1485,1476,1476,1474,1451,1421,1416,1408,1404,1398,1397,1397,1390,1376,1376,1346,1343,1335,1314,1276,1271,1266,1264,1256,1241,1233,1226,1226,1226,1206,1176,1176,1167,1158,1148,1076,1076,1076,1066,1062,1026,1026,1016,1016,1016,1015,1002,1001,1001,986,982,976,972,972,963,960,938,938,932,931,927,926,882,876,876,876,866,836,827,826,824,820,820,820,817,811,806,791,776,776,776,768,756,755,755,753,736,727,726,726,721,705,702,701,690,679,672,658,649,640,639,626,621,606,597,590,589,588,580,576,576,573,571,557,544,536,534,534,533,532,528,525,523,522,518,509,507,506,505,500,494,490,486,483,483,481,471,470,470,454,452,438,426,424,423,422,421,419,418,417,416,415,412,406,403,398,394,389,389,384,382,378,376,372,370,364,361,352,350,349,342,339,337,337,327,326,323,314,292,291,291,287,279,271,270,269,268,264,262,257,250,250,246,245,245,243,242,240,238,238,237,237,234,233,231,230,226,222,222,222,219,219,218,213,211,211,209,206,202,202,201,199,197,195,195,195,193,191,189,188,187,187,183,182,182,181,180,180,179,178,178,178,176,174,173,173,173,172,172,172,170,169,168,167,167,167,165,165,164,164,163,163,161,161,161,160,160,159,159,159,158,158,157,157,157,157,155,154,152,152,152,150,149,149,149,147,144,143,143,142,141,141,140,138,138,137,137,133,133,132,131,131,131,131,130,130,129,129,129,128,126,125,125,125,123,123,122,121,120,119,118,118,117,116,115,115,115,114,114,113,113,113,113,113,113,113,112,112,112,111,111,110,109,109,108,108,107,107,106,106,106,105,104,103,102,102,102,101,101,100.5,100,98.53,98.19,97.98,97.81,97.19,96.86,96.56,96.49,96.15,95.19,95.19,95.04,94.56,93.61,93.39,91.56,91.53,91.4,90.93,90.19,90,89.19,88.73,87.83,87.73,87.19,87.03,85.35,84.75,84.08,83.77,83.6,83.19,83.19,82.89,82.59,82.25,82.22,81.61,81.19,81.14,81.08,80.87,80.8,80.56,79.06,78.71,78.61,78.42,78.32,78.28,78.19,78.19,77.74,77.43,77.19,76.94,76.62,76.2,76.04,73.37,73.28,72.37,72.2,71.41,71.39,71.19,70.37,70.19,69.9,69.86,69.45,69.39,69.19,68.93,68.85,68.6,68.48,68.19,67.99,67.89,67.49,67.19,66.98,66.92,66.31,66.29,66.21,66.19,65.41,65.07,64.55,63.95,63.91,63.89,63.73,63.69,63.23,63.19,63.03,62.19,62.19,61.94,61.47,61.19,61.15,60.6,60.31,59.31,59.26,59.19,58.78,58.76,58.43,58.19,57.75,57.7,57.19,57.19,57.13,56.86,56.39,56.37,56.19,55.82,55.73,55.39,54.94,54.81,54.73,54.19,53.43,53.07,52.88,52.76,51.65,51.39,51.35,51.2,51.14,51.06,50.13,49.29,49.23,49.06,48.12,47.57,46.7,46.33,46.3,45.41,45.26,45.07,44.12,43.77,43.69,43.19,42.62,42.43,41.85,41.76,41.31,40.98,40.61,40.55,40.37,39.54,38.98,38.19,37.26,37.19,37.04,36.83,36.57,36.37,35.23,35.19,35.12,34.97,34.7,34.38,34.26,33.62,33.21,32.42,32.36,32.14,31.66,31.26,31.14,30.92,30.75,30.72,30.17,29.31,29.2,29.18,29.18,28.32,28.18,28.01,27.8,25.65,25.13,24.99,23.81,23.6,23.47,23.4,22.9,22.59,22.18,21.7,21.65,21.38,21.02,20.18,20.04,19.48,19.19,17.99,17.98,17.96,17.88,17.68,16.23,15.98,15.72,15.49,14.8,14.23,14.21,14.18,14.09,13.94,13.56,13.48,12.73,11.96,11.82,11.15,10.98,10.74,10.71,10.48,10.41,10.21,9.562,9.238,9.058,8.886,7.679,7.41,7.289,6.875,6.58,6.491,6.286,6.278,6.272,5.895,5.749,5.727,5.555,5.386,5.358,5.145,5.063,4.703,4.668,4.647,4.539,4.321,4.044,4.036,3.999,3.95,3.813,3.811,3.772,3.757,3.588,3.488,3.483,3.474,3.383,3.346,3.341,3.185,3.171,3.041,3.016,2.955,2.932,2.918,2.902,2.824,2.811,2.478,2.477,2.203,2.066,1.994,1.902,1.749,1.705,1.66,1.644,1.633,1.633,1.516,1.418,1.332,1.313,1.222,1.208,1.203,1.185,1.105,0.679,0.611,0.591,0.528,0.41,0.308,0.244,0.241,0.071,0.052,0.022"
    .split(",")
    .map(Number);

/**
 * Every milestone as one mark.
 *
 * One path of zero-length subpaths rather than 1,040 `<circle>` elements: with
 * a round line cap a subpath of no length paints as a dot, which is 12 bytes a
 * mark instead of 40 and one styled node instead of a thousand. The stroke
 * width in the stylesheet is the dot's diameter.
 */
export const DOTS = AGO.map((ago, i) => {
  // A little scatter across the groove, so milestones sharing a turn read as
  // separate marks rather than as one thick arc.
  const [x, y] = polar(turnOf(ago), (((i * 29) % 23) / 23 - 0.5) * 1.7);
  return `M${x.toFixed(1)} ${y.toFixed(1)}z`;
}).join("");

export const COUNT = AGO.length;

/* ---- the ruling ---------------------------------------------------------- */

/** Every other decade is named, up the axis from the centre. */
export const RULING = [
  { name: "10 BN", y: CY - radiusOf(0) },
  { name: "100 M", y: CY - radiusOf(2) },
  { name: "1 M", y: CY - radiusOf(4) },
  { name: "10,000", y: CY - radiusOf(6) },
  { name: "100", y: CY - radiusOf(8) },
  { name: "1 YEAR", y: CY - radiusOf(10) },
] as const;

export const AXIS = { x: CX, y1: CY - radiusOf(0), y2: CY };
export const NOW = { x: CX, y: CY };

/* ---- the callouts -------------------------------------------------------- */

/**
 * Seven of the 1,040, named.
 *
 * They are the milestones a reader already knows, spread so that no two rings
 * on the groove touch. Nothing is written on the drawing: the note slot under
 * it names whichever one is under the pointer, the same way fig. 4's three
 * parts work. Every date is the dataset's own.
 */
type Mark = {
  /** The short key this file uses: `data-mk` on the drawing, `data-n` on the note. */
  id: string;
  /**
   * The milestone's id in the sibling repo's data, which is a different string
   * and has to be. The link is `?e=<eid>` and the live site resolves it with
   * `events.find((x) => x.id === e)`, so a short key here opens the site on
   * nothing at all — silently, since it lands on a valid page. The seven were
   * checked against `https://scale-of-time.vercel.app/extra?id=<eid>`, which
   * answers 404 for an id that does not exist.
   */
  eid: string;
  label: string;
  sub: string;
  note: string;
  ago: number;
};

const MARKS_IN: readonly Mark[] = [
  {
    id: "bang",
    eid: "big-bang-nucleosynthesis",
    label: "the Big Bang",
    sub: "13.8 bn years ago",
    note: "The outermost mark, and where the groove starts. Eight more milestones sit inside the first dot of the flat field, on a ruler of their own running from Planck time to recombination.",
    ago: 13.8e9,
  },
  {
    id: "earth",
    eid: "earth-accretion",
    label: "Earth forms",
    sub: "4.54 bn years ago",
    note: "Half a turn from the Big Bang, and that half turn is nine billion years. The same half turn beside the centre is about three weeks.",
    ago: 4.54e9,
  },
  {
    id: "snowball",
    eid: "snowball-earth",
    label: "Snowball Earth",
    sub: "c. 717 m years ago",
    note: "A turn and a bit in. Only 85 of the 1,040 milestones fall in the first section at all, which is why the outer turns are the empty ones.",
    ago: 717e6,
  },
  {
    id: "chicxulub",
    eid: "chicxulub-impact",
    label: "the Chicxulub impact",
    sub: "66 m years ago",
    note: "66 million years is the last half a per cent of a linear timeline. Here it is a fifth of the way in, because every power of ten is given the same width of paper.",
    ago: 66e6,
  },
  {
    id: "africa",
    eid: "out-of-africa",
    label: "out of Africa",
    sub: "c. 65,000 years ago",
    note: "Five turns in, and the marks start to crowd. 258 of the milestones fall in the last ten thousand years, which is the last four turns.",
    ago: 65000,
  },
  {
    id: "wheel",
    eid: "ljubljana-wheel",
    label: "the oldest wheel",
    sub: "c. 3200 BCE",
    note: "The Ljubljana Marsh wheel, six turns in. Written history begins about here, and 312 of the 1,040 milestones fall in the last thousand years alone.",
    ago: 5225,
  },
  {
    id: "web",
    eid: "world-wide-web",
    label: "the World Wide Web",
    sub: "1989",
    note: "Eight and a half turns in. 330 of the 1,040 milestones fall in the last hundred years, which is the innermost two turns, and they are still legible there.",
    ago: 37.185,
  },
] as const;

/**
 * Where each named mark lands on the groove.
 *
 * `HIT` is the transparent circle over it. 12 units of a 300-unit box is 32px
 * across on a 400px plate, so the ring clears WCAG 2.5.8, and the closest pair
 * on the groove (Snowball Earth and Chicxulub) is 28.9 units apart, so the
 * targets do not overlap either. Move a mark and re-check both.
 */
export const HIT = 12;

export const MARKS = MARKS_IN.map((m) => {
  const [x, y] = polar(turnOf(m.ago));
  return { ...m, x, y };
});
