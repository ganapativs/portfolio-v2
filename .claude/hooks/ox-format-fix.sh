#!/usr/bin/env bash
# PostToolUse hook: format + lint-fix the file Claude just edited.
# Wired in .claude/settings.json for Edit | Write | MultiEdit.
# Silent on success; surfaces stderr only when oxfmt/oxlint errors.
# Always exits 0 — never block Claude's edit flow on tool hiccups.

set -u

# jq is required to parse the hook's stdin JSON. If missing, no-op.
command -v jq >/dev/null 2>&1 || exit 0

INPUT=$(cat)
FILE=$(printf '%s' "$INPUT" | jq -r '.tool_input.file_path // empty')

# Bail if no file path or file doesn't exist on disk yet.
[ -n "${FILE:-}" ] || exit 0
[ -f "$FILE" ] || exit 0

# Resolve project root (the dir containing this script's .claude/hooks parent).
SCRIPT_DIR=$(cd -- "$(dirname -- "$0")" && pwd)
PROJECT_ROOT=$(cd -- "$SCRIPT_DIR/../.." && pwd)

# Only act on files inside this project.
case "$FILE" in
  "$PROJECT_ROOT"/*) ;;
  /*) exit 0 ;;  # absolute path outside project — skip
  *) FILE="$PROJECT_ROOT/$FILE" ;;  # relative path — anchor to project root
esac

# Skip ignored dirs cheaply (oxfmt/oxlint also ignore via .gitignore, but
# stopping here saves a process spawn for hot paths).
case "$FILE" in
  *"/node_modules/"*|*"/.next/"*|*"/.git/"*) exit 0 ;;
esac

cd "$PROJECT_ROOT" || exit 0

run_oxfmt() {
  pnpm exec oxfmt "$1" >/dev/null 2>&1 || true
}
run_oxlint_fix() {
  pnpm exec oxlint --fix --quiet "$1" >/dev/null 2>&1 || true
}

case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    run_oxfmt "$FILE"
    run_oxlint_fix "$FILE"
    ;;
  *.json|*.jsonc|*.md|*.mdx|*.css)
    run_oxfmt "$FILE"
    ;;
esac

exit 0
