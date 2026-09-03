import { DitherField } from "./DitherField";
import { SchematicHeader } from "./Header";
import { PageFX } from "./PageFX";
import { Ruler } from "./Ruler";
import { TitleBlock } from "./TitleBlock";

/**
 * The sheet: the ground, the frame, the header and the title block.
 *
 * Used by the (press) layout for every real page, and directly by the error and
 * not-found pages, which live outside that route group and would otherwise have
 * no chrome at all. A 404 on a drawing is still a drawing.
 */
export function Sheet({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* First in source, so it is the first Tab stop on a cold load. It sat
          below the ruler for a while, and the first Tab landed on a measuring
          edge tick instead of the one control a keyboard reader needs first. */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <DitherField />
      <Ruler />

      <div className="sheet">
        {/* Registration ticks, outside the trim, the way a printer's marks are. */}
        <span className="tick-c tc-tl" aria-hidden="true" />
        <span className="tick-c tc-tr" aria-hidden="true" />
        <span className="tick-c tc-bl" aria-hidden="true" />
        <span className="tick-c tc-br" aria-hidden="true" />
        <div className="wrap">
          <SchematicHeader />
          {children}
          <TitleBlock />
        </div>
      </div>

      <PageFX />
    </>
  );
}
