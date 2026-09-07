# GitHub Grass

> One slash command. Your grass, right in the terminal.

![GitHub stars](https://img.shields.io/github/stars/minsu0707/github-grass?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/minsu0707/github-grass?style=flat-square)
![GitHub repo size](https://img.shields.io/github/repo-size/minsu0707/github-grass?style=flat-square)
![License](https://img.shields.io/github/license/minsu0707/github-grass?style=flat-square)

## Install in One Line

```bash
curl -fsSL https://raw.githubusercontent.com/minsu0707/github-grass/main/install.sh | bash
```

This installs (or updates) the plugin into `~/.claude/skills/github-grass`, which
Claude Code auto-loads as a plugin on the next session — no marketplace
registration, no `--plugin-dir` flag.

## Run in Claude Code

Restart Claude Code once after installing, then:

```text
/github-grass
/github-grass octocat   # someone else's grass
```

## What It Is

GitHub Grass is a Claude Code plugin that renders your GitHub contribution
graph ("잔디") as a text heatmap, right where you're already working.

- No token setup — reuses your existing `gh auth login` session
- No network call from Claude itself — the plugin shells out to `gh api graphql`
- Matches the count GitHub shows on your profile (local-timezone day
  boundaries, not a naive rolling 24h window)

## Core Features

- Last 365 days, rendered as a week × weekday grid with 5 shade levels (`  ` `░░` `▒▒` `▓▓` `██`)
- Month labels aligned above the correct week
- Total contribution count in the header, matching your GitHub profile
- Optional `[github-username]` argument to view anyone's public grass

## Requirements

- [GitHub CLI (`gh`)](https://cli.github.com/), authenticated via `gh auth login`
- Node.js 18+
- git (for the installer)

## How It Works

1. `commands/github-grass.md` defines the `/github-grass` slash command.
2. It runs `scripts/grass.js` via the plugin's pre-approved `Bash` tool access.
3. `grass.js` calls `gh api graphql` for `contributionsCollection`, bucketed
   over the last 365 local-calendar days, and renders the heatmap as plain text.
4. Claude Code shows that output back to you verbatim, inside a code block.

## Repository Layout

- `.claude-plugin/plugin.json`: plugin manifest
- `commands/github-grass.md`: the `/github-grass` command definition
- `scripts/grass.js`: fetches and renders the contribution heatmap
- `install.sh`: one-line installer (clones into `~/.claude/skills/github-grass`)

## Manual / Local Testing

Try it without installing anything, pointed straight at a local checkout:

```bash
claude --plugin-dir "/path/to/github-grass"
```

Or run the renderer directly, with no Claude Code involved:

```bash
node scripts/grass.js            # your gh-authenticated account
node scripts/grass.js octocat    # a specific user
```
