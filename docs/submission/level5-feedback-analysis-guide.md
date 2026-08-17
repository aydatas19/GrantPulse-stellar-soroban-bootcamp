# Level 5 Feedback Analysis Guide

Use the exported Excel workbook to turn raw tester responses into product decisions. The goal is not just to collect 50 rows, but to show how GrantPulse improved because of those rows.

## Required Analysis

| Analysis | How To Calculate | Why It Matters |
| --- | --- | --- |
| Valid user count | Count rows passing `level5-user-proof-review.md` | Confirms 50+ real testers |
| Average rating | Average `rating` for valid rows only | Shows product quality signal |
| Proof completion | Count valid transaction hashes or URLs | Shows active testnet usage |
| Top blocker | Group repeated `confusing_or_risky` themes | Drives the next product commit |
| Most requested improvement | Group `next_improvement` themes | Supports roadmap prioritization |
| Segment feedback | Pivot by `role` | Separates builder and reviewer needs |

## Feedback Theme Tags

Use these tags while reviewing rows:

| Tag | Use When |
| --- | --- |
| `wallet-onboarding` | Tester struggled with Freighter, Testnet, Friendbot, or balance refresh |
| `proof-clarity` | Tester could not find a transaction hash or Explorer URL |
| `grant-flow` | Tester misunderstood grant creation, milestones, review, or archive |
| `ux-copy` | Tester understood the goal but wanted clearer labels |
| `stability` | Tester hit errors, loading failures, or inconsistent state |
| `growth` | Tester suggested onboarding, retention, sharing, or community features |

## Improvement Decision Rule

After 50+ valid rows:

1. Pick the theme with the highest frequency.
2. If there is a tie, prioritize the theme with the lowest average rating.
3. Ship one scoped product or documentation improvement.
4. Commit the change with `Level 5` in the commit message.
5. Paste that commit URL into `docs/submission/level5-feedback-iteration-summary.md`.

## README Summary Format

```text
Feedback iteration: After reviewing 50 valid Level 5 tester responses, the most common blocker was <theme>. We shipped <change> in <commit link>.
```
