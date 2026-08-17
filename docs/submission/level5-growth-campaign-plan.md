# Level 5 Growth Campaign Plan

This plan keeps the Level 5 user growth work separate from earlier belt submissions. The target is 50 real Stellar Testnet users with named feedback and transaction proof.

## Campaign Target

| Metric | Target | Evidence |
| --- | ---: | --- |
| Testnet users onboarded | 50+ | Google Form Excel export |
| Unique wallet addresses | 50+ | `wallet_address` column |
| Real transaction proofs | 50+ | Transaction hash or Stellar Expert Testnet URL |
| Product ratings | 50+ | `rating` column |
| Feedback comments | 50+ | `worked_well`, `confusing_or_risky`, and `next_improvement` columns |

## Tester Segments

| Segment | Target Count | Primary Scenario |
| --- | ---: | --- |
| Builders | 20 | Connect wallet, create a grant, complete a milestone |
| Reviewers | 10 | Connect wallet, review a grant, submit feedback |
| Founders | 10 | Validate whether the proof dashboard supports demo-day reporting |
| General testers | 10 | Complete wallet, payment, feedback, and export flow |

## Daily Operating Loop

1. Invite 8-12 testers per day until the form reaches at least 55 responses.
2. Ask each tester to submit the form only after completing a real Testnet transaction.
3. Review response rows daily for duplicate email, duplicate wallet, invalid wallet format, missing transaction proof, and low ratings.
4. Add blockers and repeated requests to `docs/submission/level5-feedback-iteration-summary.md`.
5. Commit one product or documentation improvement based on the highest-frequency blocker and paste that commit link into the improvement section.

## Submission Gate

Do not mark the user-growth requirement complete until the exported Excel file contains at least 50 valid rows with unique emails, unique wallet addresses, and usable transaction proof links.
