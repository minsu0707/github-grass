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

This installs it as a plain Claude Code **skill** at `~/.claude/skills/github-grass`
(just `SKILL.md` + `scripts/`, no plugin manifest) — it registers unnamespaced,
so it shows up as exactly `/github-grass`, not `/something:github-grass`.
No marketplace registration, no `--plugin-dir` flag.

## Run in Claude Code

Restart Claude Code once after installing, then:

```text
/github-grass
/github-grass octocat     # someone else's grass
/github-grass --full      # the whole year instead of the default ~3 months
```

## What It Is

GitHub Grass renders your GitHub contribution graph ("잔디") as a text
heatmap, right where you're already working.

- No token setup — reuses your existing `gh auth login` session
- No network call from Claude itself — the skill shells out to `gh api graphql`
- Matches the count GitHub shows on your profile (local-timezone day
  boundaries, not a naive rolling 24h window)
- Sized to survive a split or narrow terminal pane by default

## Core Features

- Week × weekday grid with 5 shade levels (`  ` `░░` `▒▒` `▓▓` `██`), month labels aligned above the correct week
- Header always shows the accurate last-365-days total, matching your GitHub profile, even when the grid itself is showing a shorter window
- Defaults to the last ~13 weeks (~3 months) so it doesn't wrap/garble in a narrow pane — pass `--full` (whole year) or `--weeks=N` to widen it
- Optional `[github-username]` argument to view anyone's public grass

## Requirements

- [GitHub CLI (`gh`)](https://cli.github.com/), authenticated via `gh auth login`
- Node.js 18+
- git (for the installer)

## How It Works

1. `~/.claude/skills/github-grass/SKILL.md` registers the `github-grass` skill, invoked by typing `/github-grass`.
2. It runs `scripts/grass.js` via the Bash tool.
3. `grass.js` calls `gh api graphql` for `contributionsCollection`, bucketed
   over the last 365 local-calendar days, and renders the heatmap as plain text.
4. Claude Code shows that output back to you verbatim, inside a code block.

## Repository Layout

- `skill/SKILL.md`: the skill definition template (`__SCRIPT_PATH__` is filled in by `install.sh` at install time)
- `scripts/grass.js`: fetches and renders the contribution heatmap
- `install.sh`: one-line installer — builds the final skill at `~/.claude/skills/github-grass`
- `.claude-plugin/plugin.json`, `commands/github-grass.md`: kept only so `claude --plugin-dir` still works for local testing (see below); not used by the installer

## Manual / Local Testing

Try it without installing anything, using the plugin-style layout kept for this purpose:

```bash
claude --plugin-dir "/path/to/github-grass"
```

Or run the renderer directly, with no Claude Code involved:

```bash
node scripts/grass.js                  # your gh-authenticated account, last ~13 weeks
node scripts/grass.js octocat          # a specific user
node scripts/grass.js --full           # your account, full year
node scripts/grass.js octocat --weeks=26
```
