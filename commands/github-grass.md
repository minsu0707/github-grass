---
description: Show your GitHub contribution graph (잔디) as a terminal heatmap
argument-hint: "[github-username]"
allowed-tools: Bash
---

Run this exact command via the Bash tool:

```
node "${CLAUDE_PLUGIN_ROOT}/scripts/grass.js" $ARGUMENTS
```

It uses the local `gh` CLI's existing login — do not pass a token, do not ask
the user for one. If `gh` is not installed or not authenticated, tell the
user to run `gh auth login` first instead of trying anything else.

Then show the script's raw output to the user **verbatim, inside a fenced
code block**, with no reformatting, added emoji, or commentary before it.
The script already renders the full heatmap, month labels, and totals.
