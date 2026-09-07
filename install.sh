#!/usr/bin/env bash
# One-line installer for the github-grass Claude Code skill.
#
#   curl -fsSL https://raw.githubusercontent.com/minsu0707/github-grass/main/install.sh | bash
#
# Installs it as a bare skill at ~/.claude/skills/github-grass (SKILL.md +
# scripts/, no .claude-plugin manifest) so it registers unnamespaced and
# shows up as exactly "/github-grass" — Claude Code auto-loads it on the
# next session, no marketplace registration or --plugin-dir flag needed.
set -euo pipefail

REPO_URL="https://github.com/minsu0707/github-grass.git"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SRC_DIR="$CLAUDE_DIR/.github-grass-src"
SKILL_DIR="$CLAUDE_DIR/skills/github-grass"

if ! command -v git >/dev/null 2>&1; then
  echo "error: git is required to install github-grass." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "error: Node.js 18+ is required to run github-grass." >&2
  exit 1
fi

if ! command -v gh >/dev/null 2>&1; then
  echo "warning: GitHub CLI (gh) not found. Install it and run 'gh auth login' before using /github-grass." >&2
fi

mkdir -p "$(dirname "$SRC_DIR")"

if [ -d "$SRC_DIR/.git" ]; then
  echo "Updating source at $SRC_DIR"
  git -C "$SRC_DIR" pull --ff-only
else
  echo "Fetching github-grass into $SRC_DIR"
  rm -rf "$SRC_DIR"
  git clone --depth 1 "$REPO_URL" "$SRC_DIR"
fi

echo "Installing skill to $SKILL_DIR"
rm -rf "$SKILL_DIR"
mkdir -p "$SKILL_DIR/scripts"
cp "$SRC_DIR/scripts/grass.js" "$SKILL_DIR/scripts/grass.js"

SCRIPT_PATH="$SKILL_DIR/scripts/grass.js"
sed "s#__SCRIPT_PATH__#$SCRIPT_PATH#" "$SRC_DIR/skill/SKILL.md" > "$SKILL_DIR/SKILL.md"

echo
echo "Done. Restart Claude Code, then run:"
echo "  /github-grass"
