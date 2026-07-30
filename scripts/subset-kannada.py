#!/usr/bin/env python3
"""Cut Anek Kannada down to the eleven characters this site actually sets.

Google's Kannada subset is 114 kB — the largest single asset the site can
request, and it loads at font priority on *every* page, because the colophon
carries the name in Kannada. It exists to set one string:

    ಗಣಪತಿ ವಿ ಎಸ್

Subsetting to exactly that string takes it to a few kB. Kannada is a complex
script, so this keeps the full shaping feature set (conjuncts, reordering,
above/below-base forms) and lets fontTools close over every glyph those
substitutions can reach — subsetting on codepoints alone would drop the
ligated forms and render the name wrong.

The variable weight axis is preserved: `.kn-name` sets 600 and the colophon
sets 500.

    pnpm gen:kannada-subset

Output is committed to fonts/ and loaded via next/font/local in lib/fonts.ts.
Re-run only if the name changes or Google ships a new version of the face.
"""

from pathlib import Path
import re
import sys
import urllib.request

try:
    from fontTools import subset
    from fontTools.ttLib import TTFont, newTable
    from fontTools.ttLib.tables import otTables
except ImportError:  # pragma: no cover - operator-facing
    sys.exit("fontTools is required: pip install 'fonttools[woff]' brotli")

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "fonts" / "anek-kannada-name-subset.woff2"

# Every character the three .kn surfaces render. Keep the space: it is set from
# Anek Latin at runtime (see --f-kannada in styles/press/tokens.css), but a
# font that cannot draw its own word separator is a trap for the next edit.
TEXT = "ಗಣಪತಿ ವಿ ಎಸ್"

CSS_URL = "https://fonts.googleapis.com/css2?family=Anek+Kannada:wght@100..800&display=swap"
# Google serves woff2 only to browsers that ask like one.
UA = (
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
)

# Kannada shaping, in full. Dropping any of these silently breaks conjuncts.
# `rvrn` is here because Anek is a variable font: it swaps forms across the
# weight axis, and .kn-name sets 600.
FEATURES = (
    "ccmp,akhn,rphf,rkrf,blwf,half,vatu,cjct,pres,abvs,blws,psts,haln,"
    "locl,calt,liga,clig,kern,mark,mkmk,abvm,blwm,dist,rvrn"
)


def source_glyph_classes(path: Path) -> dict[str, int]:
    """The source face's GDEF glyph classes, by glyph name."""
    font = TTFont(path)
    try:
        gdef = font["GDEF"].table if "GDEF" in font else None
        if gdef is None or gdef.GlyphClassDef is None:
            return {}
        return dict(gdef.GlyphClassDef.classDefs)
    finally:
        font.close()


def keep_gdef_alive(path: Path, source_classes: dict[str, int]) -> None:
    """Put a GDEF GlyphClassDef back, or the name shapes wrong.

    Anek Kannada draws ತ + ಿ as one glyph (`TamatraI.kn`) through a `psts`
    ligature lookup — and that lookup is flagged `IgnoreMarks`. The face gets
    away with it because its GDEF classifies exactly twenty glyphs (the Ja and
    Pha families as bases, two nuktas as marks) and leaves everything else
    unclassified: to HarfBuzz an unclassified glyph is class 0, not a mark, so
    ಿ survives the flag and the ligature fires.

    None of those twenty glyphs are in this subset, so fontTools drops the whole
    ClassDef — and with no GDEF classes at all HarfBuzz falls back to Unicode
    general category, where U+0CBF is Mn. It becomes a mark, `IgnoreMarks` skips
    it, the ligature never fires, and the matra renders as a loose spacing glyph
    beside its base. That is the bug this function exists to prevent: the table
    has to survive, and the signs have to stay non-marks.

    So classify every retained glyph as a base, except the ones the source
    classified itself — a nukta has to stay a mark if TEXT ever grows one.
    """
    font = TTFont(path)
    try:
        gdef = font["GDEF"].table if "GDEF" in font else None
        if gdef is None:
            record = newTable("GDEF")
            record.table = gdef = otTables.GDEF()
            gdef.Version = 0x00010000
            gdef.GlyphClassDef = None
            gdef.AttachList = None
            gdef.LigCaretList = None
            gdef.MarkAttachClassDef = None
            font["GDEF"] = record

        if gdef.GlyphClassDef is not None and gdef.GlyphClassDef.classDefs:
            return  # The source classes survived on their own.

        class_def = otTables.GlyphClassDef()
        class_def.classDefs = {
            name: source_classes.get(name, 1)
            for name in font.getGlyphOrder()
            if name != ".notdef"
        }
        gdef.GlyphClassDef = class_def
        font.save(path)
    finally:
        font.close()


def fetch(url: str) -> bytes:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=30) as resp:
        return resp.read()


def kannada_face_url(css: str) -> str:
    """The @font-face block whose unicode-range covers the Kannada block."""
    for block in css.split("@font-face"):
        if "U+0C80" not in block.upper():
            continue
        m = re.search(r"url\((https://[^)]+\.woff2)\)", block)
        if m:
            return m.group(1)
    sys.exit("No Kannada @font-face found in the Google Fonts CSS — did the API change?")


def main() -> None:
    css = fetch(CSS_URL).decode("utf-8")
    url = kannada_face_url(css)
    source = ROOT / ".cache-anek-kannada.woff2"
    source.write_bytes(fetch(url))
    before = source.stat().st_size

    OUT.parent.mkdir(parents=True, exist_ok=True)
    subset.main(
        [
            str(source),
            f"--text={TEXT}",
            f"--layout-features={FEATURES}",
            "--flavor=woff2",
            "--no-hinting",
            # fvar/gvar survive by default, so the 500 and 600 weights stay
            # real instances rather than one static cut the browser fakes.
            "--name-IDs=*",
            f"--output-file={OUT}",
        ]
    )
    keep_gdef_alive(OUT, source_glyph_classes(source))
    source.unlink()

    after = OUT.stat().st_size
    print(
        f"wrote {OUT.relative_to(ROOT)} — {before / 1024:.1f} kB → {after / 1024:.1f} kB "
        f"({100 - after / before * 100:.1f}% smaller)\n"
        f"  source: {url}\n"
        f"  text:   {TEXT}"
    )


if __name__ == "__main__":
    main()
