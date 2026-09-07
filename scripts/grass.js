#!/usr/bin/env node
/**
 * github-grass: renders the caller's GitHub contribution graph ("잔디")
 * as a text/ASCII heatmap in the terminal, using the local `gh` CLI's
 * existing auth (no token handling needed).
 *
 * Usage: node grass.js [github-username] [--weeks=N | --full]
 * If no username is given, uses the currently active `gh auth` account.
 *
 * By default only the most recent DEFAULT_WEEKS weeks are drawn as a grid
 * — a full 53-week year is ~106 columns wide and wraps/garbles in a split
 * or narrow terminal pane. The contribution *total* in the header is
 * always the full last-365-days count regardless of how many weeks are
 * drawn. Pass --full (or --weeks=53) to draw the whole year anyway.
 */

import { execFileSync } from "node:child_process";

// Two characters per day so each cell reads as an actual square instead of
// a thin sliver (monospace glyphs are taller than they are wide).
const LEVELS = ["  ", "░░", "▒▒", "▓▓", "██"];

const DEFAULT_WEEKS = 13; // ~3 months — safe width for a split terminal pane

// Thresholds for mapping a raw contribution count to one of the 5 levels
// above. Roughly mirrors GitHub's own quartile buckets.
function levelFor(count, max) {
  if (count === 0) return 0;
  if (max <= 0) return 1;
  const ratio = count / max;
  if (ratio > 0.75) return 4;
  if (ratio > 0.5) return 3;
  if (ratio > 0.25) return 2;
  return 1;
}

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8" });
}

function parseArgs(argv) {
  let username;
  let weeksToShow = DEFAULT_WEEKS;
  for (const arg of argv) {
    if (arg === "--full" || arg === "full") {
      weeksToShow = null; // null = show everything fetched
    } else if (arg.startsWith("--weeks=")) {
      const n = parseInt(arg.slice("--weeks=".length), 10);
      if (Number.isFinite(n) && n > 0) weeksToShow = n;
    } else if (!username) {
      username = arg;
    }
  }
  return { username, weeksToShow };
}

function getLogin(explicit) {
  if (explicit) return explicit;
  const out = JSON.parse(gh(["api", "user"]));
  return out.login;
}

const QUERY = `
query($login: String!, $from: DateTime!, $to: DateTime!) {
  user(login: $login) {
    contributionsCollection(from: $from, to: $to) {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            weekday
            contributionCount
          }
        }
      }
    }
  }
}`;

function fetchCalendar(login) {
  // Match GitHub's own "last year" window: 365 full calendar days ending
  // today, using the machine's local timezone (GitHub's contribution graph
  // is bucketed by the viewer's local day, not UTC) — a rolling
  // 24h-from-now window, or UTC day boundaries, both drift the total off
  // by however many contributions land in the partial day at either edge.
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setDate(from.getDate() - 364);
  from.setHours(0, 0, 0, 0);

  const out = gh([
    "api",
    "graphql",
    "-f",
    `query=${QUERY}`,
    "-f",
    `login=${login}`,
    "-f",
    `from=${from.toISOString()}`,
    "-f",
    `to=${to.toISOString()}`,
  ]);
  const data = JSON.parse(out);
  const user = data.data && data.data.user;
  if (!user) {
    throw new Error(
      `GitHub user "${login}" not found or contributionsCollection unavailable.`
    );
  }
  return user.contributionsCollection.contributionCalendar;
}

function monthLabelRow(weeks) {
  // one label slot per week-column (2 chars wide, matching a grid cell),
  // filled in when that week is the first week to contain a new month.
  const labels = new Array(weeks.length).fill("  ");
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week.contributionDays[0];
    if (!firstDay) return;
    const d = new Date(firstDay.date);
    const m = d.getUTCMonth();
    if (m !== lastMonth) {
      labels[i] = d.toLocaleString("en-US", { month: "short" }).slice(0, 2);
      lastMonth = m;
    }
  });
  return labels;
}

function render(calendar, login, weeksToShow) {
  const { totalContributions } = calendar;
  const allWeeks = calendar.weeks;
  const weeks =
    weeksToShow && weeksToShow < allWeeks.length
      ? allWeeks.slice(allWeeks.length - weeksToShow)
      : allWeeks;

  const max = Math.max(
    0,
    ...weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount))
  );

  const grid = Array.from({ length: 7 }, () => new Array(weeks.length).fill("  "));
  weeks.forEach((week, col) => {
    week.contributionDays.forEach((day) => {
      grid[day.weekday][col] = LEVELS[levelFor(day.contributionCount, max)];
    });
  });

  const monthLabels = monthLabelRow(weeks);
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const rangeNote =
    weeks.length < allWeeks.length
      ? ` — showing last ${weeks.length} weeks (pass --full for the whole year)`
      : "";

  const lines = [];
  lines.push(
    `GitHub contributions for @${login} — last 365 days (${totalContributions} total)${rangeNote}`
  );
  lines.push("");
  lines.push("     " + monthLabels.join(""));
  for (let r = 0; r < 7; r++) {
    // label every other row (Mon/Wed/Fri), same convention GitHub's own
    // graph uses, so the day column doesn't get too noisy.
    const label = r % 2 === 1 ? dayLabels[r].padEnd(5) : "     ";
    lines.push(label + grid[r].join(""));
  }
  lines.push("");
  lines.push("Less " + LEVELS.join(" ") + " More");
  return lines.join("\n");
}

function main() {
  const { username, weeksToShow } = parseArgs(process.argv.slice(2));
  const login = getLogin(username);
  const calendar = fetchCalendar(login);
  console.log(render(calendar, login, weeksToShow));
}

main();
