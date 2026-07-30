#!/usr/bin/env bash
# Regenerate the manifest screenshots in public/brand/.
#
# Chromium only shows the richer install dialog — the one with a preview
# instead of a bare "Install?" — when the manifest carries a screenshot whose
# form_factor matches the device installing. So there are two, and their
# dimensions have to match what app/manifest.ts declares.
#
#   pnpm build && pnpm gen:pwa-screenshots
#
# Committed output; run it when the home page's top fold changes.
set -euo pipefail

cd "$(dirname "$0")/.."

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PORT="${PORT:-4399}"
OUT="public/brand"

[ -x "$CHROME" ] || { echo "Google Chrome not found at $CHROME"; exit 1; }
[ -d .next ] || { echo ".next is missing — run \`pnpm build\` first."; exit 1; }

PORT="$PORT" pnpm exec next start -p "$PORT" >/dev/null 2>&1 &
SERVER=$!
trap 'kill "$SERVER" 2>/dev/null || true' EXIT

for _ in $(seq 1 40); do
  curl -sf "http://localhost:$PORT/" >/dev/null && break
  sleep 0.5
done

shoot() {
  local name=$1 size=$2
  # Light paper, explicitly: headless Chrome reports prefers-color-scheme:dark,
  # and a dark screenshot next to a light `background_color` splash makes the
  # install dialog look like it belongs to two different sites.
  "$CHROME" --headless --disable-gpu --hide-scrollbars \
    --blink-settings=preferredColorScheme=1 \
    --virtual-time-budget=4000 \
    --window-size="$size" \
    --screenshot="$OUT/$name" \
    "http://localhost:$PORT/" >/dev/null 2>&1
  echo "wrote $OUT/$name ($size)"
}

mkdir -p "$OUT"
shoot screenshot-wide.png 1280,800
shoot screenshot-narrow.png 540,1170
