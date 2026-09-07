#!/usr/bin/env node
/**
 * github-grass: renders the caller's GitHub contribution graph ("잔디")
 * as a text/ASCII heatmap in the terminal, using the local `gh` CLI's
 * existing auth (no token handling needed).
 *
 * Usage: node grass.js [github-username]
 * If no username is given, uses the currently active `gh auth` account.
 */

import { execFileSync } from "node:child_process";

const LEVELS = [" ", "░", "▒", "▓", "█"];
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
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - 364);

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
  // one label slot per week-column, filled in when that week is the first
  // week to contain the 1st (or is the very first week) of a new month.
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

function render(calendar, login) {
  const { weeks, totalContributions } = calendar;
  const max = Math.max(
    0,
    ...weeks.flatMap((w) => w.contributionDays.map((d) => d.contributionCount))
  );

  const grid = Array.from({ length: 7 }, () => new Array(weeks.length).fill(" "));
  weeks.forEach((week, col) => {
    week.contributionDays.forEach((day) => {
      grid[day.weekday][col] = LEVELS[levelFor(day.contributionCount, max)];
    });
  });

  const monthLabels = monthLabelRow(weeks);
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const lines = [];
  lines.push(`GitHub contributions for @${login} — last 365 days (${totalContributions} total)`);
  lines.push("");
  lines.push("    " + monthLabels.join(""));
  for (let r = 0; r < 7; r++) {
    const label = r % 2 === 1 ? dayLabels[r].padEnd(4) : "    ";
    lines.push(label + grid[r].join(""));
  }
  lines.push("");
  lines.push("Less " + LEVELS.join(" ") + " More");
  return lines.join("\n");
}

function main() {
  const explicit = process.argv[2];
  const login = getLogin(explicit);
  const calendar = fetchCalendar(login);
  console.log(render(calendar, login));
}

main();
