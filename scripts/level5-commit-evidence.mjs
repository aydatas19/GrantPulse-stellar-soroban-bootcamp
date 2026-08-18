#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const repoUrl = "https://github.com/aydatas19/GrantPulse-stellar-soroban-bootcamp";
const raw = execFileSync("git", [
  "log",
  "--grep=Level 5",
  "--regexp-ignore-case",
  "--date=short",
  "--pretty=format:%H%x09%h%x09%ad%x09%s",
]).toString();

const commits = raw
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [hash, shortHash, date, ...subjectParts] = line.split("\t");
    return {
      hash,
      shortHash,
      date,
      subject: subjectParts.join("\t"),
    };
  });

const dailyCounts = new Map();

for (const commit of commits) {
  dailyCounts.set(commit.date, (dailyCounts.get(commit.date) ?? 0) + 1);
}

const dailyRows = [...dailyCounts.entries()].sort(([leftDate], [rightDate]) =>
  leftDate.localeCompare(rightDate)
);

console.log("# Level 5 Commit Evidence");
console.log("");
console.log("GrantPulse tracks Level 5 technical progress separately from earlier belt work.");
console.log("");
console.log(`Level 5 meaningful commit count: ${commits.length}`);
console.log(`Level 5 active commit days: ${dailyRows.length}`);
console.log("");
console.log("## Reviewer Note Response");
console.log("");
console.log(
  "The Blue Belt review asked for more daily commits. This report now shows the Level 5 commit dates and daily distribution so the cadence can be verified directly from Git history."
);
console.log("");
console.log("## Daily Commit Distribution");
console.log("");
console.log("| Date | Level 5 Commits |");
console.log("| --- | ---: |");
for (const [date, count] of dailyRows) {
  console.log(`| ${date} | ${count} |`);
}
console.log("");
console.log("## Level 5 Commits");
console.log("");

for (const commit of commits) {
  console.log(`- ${commit.shortHash} - ${commit.date} - ${commit.subject}`);
  console.log(`  ${repoUrl}/commit/${commit.hash}`);
}

console.log("");
console.log("## Verification");
console.log("");
console.log("Run this command from the repository root:");
console.log("");
console.log("```bash");
console.log("node scripts/level5-commit-evidence.mjs > docs/submission/level5-commit-evidence.md");
console.log("```");
