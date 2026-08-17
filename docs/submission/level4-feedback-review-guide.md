# Level 4 Feedback Review Guide

Level 4 asks for basic user feedback collection, optimized UX, and proof that the app is ready for production validation. Use this guide after testers submit feedback through the deployed app.

## Feedback Fields To Review

| Field | Why It Matters |
| --- | --- |
| Wallet address | Connects feedback to a real tester session |
| Role | Separates builder, reviewer, founder, and general tester feedback |
| Rating | Gives a quick quality signal |
| Comment | Captures what worked and what felt unclear |
| Blocker | Identifies UX, wallet, network, or stability issues |
| Transaction hash | Links feedback to real testnet activity when available |

## Theme Tags

Use these tags in `docs/submission/level4-feedback-summary.md`:

| Tag | Use When |
| --- | --- |
| `wallet` | Freighter access, network switching, Friendbot, or balance display |
| `transaction` | Payment, grant write, signing, or Explorer proof issues |
| `grant-flow` | Create, milestone, review, archive, or lookup confusion |
| `responsive-ui` | Mobile or desktop layout feedback |
| `stability` | Runtime errors, failed loads, or inconsistent state |
| `documentation` | Setup, README, demo, or evidence instructions |

## Summary Template

```text
Reviewed responses:
Valid wallet-linked responses:
Average rating:
Top positive theme:
Top blocker:
Product change made:
Commit link:
```

## Submission Rule

Do not describe placeholder feedback as real user feedback. If real responses are not collected yet, keep the summary marked as evidence needed.
