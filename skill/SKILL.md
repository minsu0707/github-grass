---
name: github-grass
description: Show the user's GitHub contribution graph ("잔디"/grass) as a text heatmap in the terminal. Use when the user types "/github-grass" or asks to see their GitHub contributions, grass, or contribution graph.
---

# GitHub Grass

Run this exact command via the Bash tool. If the user gave you a GitHub
username, pass it as the argument; otherwise pass no argument and it falls
back to the locally authenticated `gh` account:

```
node "__SCRIPT_PATH__" [username]
```

It uses the local `gh` CLI's existing login — do not pass a token, do not ask
the user for one. If `gh` is not installed or not authenticated, tell the
user to run `gh auth login` first instead of trying anything else.

Then show the script's raw output to the user **verbatim, inside a fenced
code block**, with no reformatting, added emoji, or commentary before it.
The script already renders the full heatmap, month labels, and totals.
