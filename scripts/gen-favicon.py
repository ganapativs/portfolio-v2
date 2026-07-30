#!/usr/bin/env python3
"""Regenerate app/favicon.ico from the built /icon-512 PNG.

Why a committed .ico at all, when app/icon.tsx already serves a crisp SVG:

  * /favicon.ico is probed by feed readers, link unfurlers, some crawlers and
    every browser old enough to predate SVG favicons. Without a file there,
    every one of those requests is a 404 in the logs and a blank square in the
    UI.
  * Google's SERP favicon wants a square raster whose side is a multiple of 48.
    The .ico carries 16/32/48; /icon-192 covers the larger end.

The source is the *build output* rather than a re-render, so the .ico can never
drift from the mark the rest of the icon family draws — if lib/icon-png.tsx
changes, this picks the change up on the next build.

    pnpm build && pnpm gen:favicon

Requires Pillow (`pip install pillow`). Run it when the mark or its colours
change, not on every build — the .ico is committed.
"""

from pathlib import Path
import sys

try:
    from PIL import Image
except ImportError:  # pragma: no cover - operator-facing
    sys.exit("Pillow is required: pip install pillow")

ROOT = Path(__file__).resolve().parent.parent
# Static route handlers are prerendered to <route>.body at build time.
SOURCE = ROOT / ".next" / "server" / "app" / "icon-512.body"
# public/, not app/. As an app-router file convention Next would emit its own
# <link rel="icon" sizes="16x16"> for it — a third, wrongly-labelled tag next
# to the two the `icons` metadata in app/layout.tsx already declares.
TARGET = ROOT / "public" / "favicon.ico"
SIZES = [(16, 16), (32, 32), (48, 48)]


def main() -> None:
    if not SOURCE.exists():
        sys.exit(f"{SOURCE.relative_to(ROOT)} is missing — run `pnpm build` first.")

    with Image.open(SOURCE) as img:
        # LANCZOS down to 16px keeps the bar under the G from vanishing.
        img.convert("RGBA").save(TARGET, format="ICO", sizes=SIZES)

    kb = TARGET.stat().st_size / 1024
    print(f"wrote {TARGET.relative_to(ROOT)} ({kb:.1f} kB) — {', '.join(f'{w}x{h}' for w, h in SIZES)}")


if __name__ == "__main__":
    main()
