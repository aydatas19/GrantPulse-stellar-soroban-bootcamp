#!/usr/bin/env node
import { execFileSync } from "node:child_process";

const repoUrl = "https://github.com/aydatas19/GrantPulse-stellar-soroban-bootcamp";
const raw = execFileSync("git", [
  "log",
  "--grep=Level 4",
  "--regexp-ignore-case",
  "--pretty=format:%H%x09%h%x09%s",
]).toString();

const commits = raw
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean)
  .map((line) => {
    const [hash, shortHash, ...subjectParts] = line.split("\t");
    return {
      hash,
      shortHash,
      subject: subjectParts.join("\t"),
    };
  });

console.log("# Level 4 Commit Evidence");
console.log("");
console.log("GrantPulse tracks Level 4 Green Belt technical progress separately from the earlier and later belt stages.");
console.log("");
console.log(`Level 4 meaningful commit count: ${commits.length}`);
console.log("");
console.log("## Level 4 Commits");
console.log("");

for (const commit of commits) {
  console.log(`- ${commit.shortHash} - ${commit.subject}`);
  console.log(`  ${repoUrl}/commit/${commit.hash}`);
}

console.log("");
console.log("## Verification");
console.log("");
console.log("Run this command from the repository root:");
console.log("");
console.log("```bash");
console.log("node scripts/level4-commit-evidence.mjs > docs/submission/level4-commit-evidence.md");
console.log("```");
