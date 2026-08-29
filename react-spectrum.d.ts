// react-spectrum's ESM build is imported by its file path (see the note in
// components/schematic/SpectrumDemo.tsx for why), which the package's own
// `types` entry does not cover. This maps that path onto the shipped types.
declare module "react-spectrum/dist/react-spectrum.es.js" {
  import type { ComponentType } from "react";

  type SpectrumProps = {
    width?: number;
    colors?: string[];
    wordWidths?: number[];
    wordDistances?: number[];
    wordHeight?: number;
    wordRadius?: number;
    lineDistance?: number;
    linesPerParagraph?: number;
    paragraphs?: number;
    paragraphDistance?: number;
    truncateLastLine?: boolean;
  };

  const Spectrum: ComponentType<SpectrumProps>;
  export default Spectrum;
}
