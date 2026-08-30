/**
 * The WebGPU experiments, and what each one is for.
 *
 * Three ways of spending the same 45 kB of runtime, each on a different figure,
 * each meant to be judged on its own. They live behind /lab so they can be
 * looked at without being shipped: the pages are `noindex`, they are not in the
 * sitemap, and nothing links to them from the drawing.
 *
 * When one of them is picked, it moves into its figure on the home page and
 * this directory goes. It is a workbench, not a section.
 */
export type Experiment = {
  slug: string;
  fig: string;
  title: string;
  claim: string;
  /** What it does that the version already shipped cannot. */
  gains: string[];
  /** What it costs, honestly. */
  costs: string[];
};

export const EXPERIMENTS: readonly Experiment[] = [
  {
    slug: "flow",
    fig: "fig. 1",
    title: "Traffic through the stack",
    claim:
      "The exploded view's subject is a question moving down through five layers, and the drawing showed none of it. This is that movement, running on the drawing's own edges.",
    gains: [
      "The router splits into three and one lane is inked. That is the layer's whole claim, shown rather than captioned.",
      "The eval gate turns some runs back. They go round again and pass, which is what a version failing its evals actually costs.",
      "Pointing at a layer stops the traffic everywhere else, so the drawing answers the question being asked of it.",
      "The marks are stateless: position is a pure function of lane, phase and the clock, so a thousand of them cost what one does.",
    ],
    costs: [
      "It is the only moving thing on the sheet that the reader did not cause, which the motion law does not currently allow.",
      "45 kB of runtime, lazily, for readers with WebGPU.",
    ],
  },
  {
    slug: "lens",
    fig: "fig. 2",
    title: "A loupe that is a lens",
    claim:
      "The loupe is a circle that stands for a lens, and the magnified word is re-rendered in a box beside it. Here the magnification happens under the glass.",
    gains: [
      "Real barrel distortion, edge compression and a little dispersion at the rim. An optical instrument that is optical.",
      "The sentence is rasterised once and sampled, so the glass magnifies whatever is under it rather than a word that was looked up.",
      "The reading is continuous: there is no jump between one word and the next, because there is nothing being selected.",
    ],
    costs: [
      "The text has to be drawn to a texture, so it is a second copy of the sentence that has to stay in step with the DOM one.",
      "The detail box below may become redundant, and it is doing real work today: the x-height and baseline rules are a teaching device.",
    ],
  },
  {
    slug: "portrait",
    fig: "the subject",
    title: "The halftone, at density",
    claim:
      "Fifty-six by fifty-six dots is what a main thread can push with physics on every one of them. This is the same duotone print at a density that is not negotiable on a CPU.",
    gains: [
      "Tens of thousands of cells instead of three thousand, so the face is a print rather than a mosaic.",
      "The same physics on every one: repel from the cursor, ripple on a poke, spring home.",
      "The same duotone rules, unchanged: ink on paper, light on graphite, and the accent only on the 0.32 to 0.52 midtone band.",
    ],
    costs: [
      "It is the most load-bearing image on the site, and there would be two of it to keep in step.",
      "The 2D version is genuinely good. This has to beat it, not match it.",
    ],
  },
] as const;
