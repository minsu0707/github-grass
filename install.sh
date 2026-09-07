#!/usr/bin/env bash
# One-line installer for the github-grass Claude Code plugin.
#
#   curl -fsSL https://raw.githubusercontent.com/minsu0707/github-grass/main/install.sh | bash
#
# Installs (or updates) the plugin into ~/.claude/skills/github-grass, which
# Claude Code auto-loads as a "skills-dir" plugin on the next session — no
# marketplace registration or --plugin-dir flag needed.
set -euo pipefail

REPO_URL="https://github.com/minsu0707/github-grass.git"
TARGET_DIR="${CLAUDE_SKILLS_DIR:-$HOME/.claude/skills}/github-grass"

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

mkdir -p "$(dirname "$TARGET_DIR")"

if [ -d "$TARGET_DIR/.git" ]; then
  echo "Updating existing install at $TARGET_DIR"
  git -C "$TARGET_DIR" pull --ff-only
else
  echo "Installing github-grass to $TARGET_DIR"
  rm -rf "$TARGET_DIR"
  git clone --depth 1 "$REPO_URL" "$TARGET_DIR"
fi

echo
echo "Done. Restart Claude Code, then run:"
echo "  /github-grass"
