# Level 5 Analytics Capture Guide

Capture screenshots only after real testers have completed the 50-user campaign. Placeholder screenshots should stay labeled as placeholders until the final export is ready.

## Required Screenshots

| Screenshot | Source | Save As |
| --- | --- | --- |
| Growth proof dashboard | Live GrantPulse app | `docs/screenshots/level5-growth-proof.png` |
| Growth panel close-up | Live GrantPulse app | `docs/screenshots/level5-growth-panel.png` |
| Mobile growth proof | Live GrantPulse app at mobile width | `docs/screenshots/level5-mobile-growth-proof.png` |
| Transaction activity | Stellar Expert Testnet contract or tx page | `docs/screenshots/level5-transaction-activity.png` |
| Feedback workbook summary | Excel or Google Sheets summary tab | `docs/screenshots/level5-feedback-workbook-summary.png` |

## Capture Order

1. Open the live GitHub Pages deployment.
2. Confirm the connected wallet is on Stellar Testnet.
3. Show at least one recent successful app transaction with a Stellar Expert link.
4. Scroll to the Level 5 Growth Proof panel.
5. Confirm the user count, proof count, active usage events, average rating, and errors are visible.
6. Export the JSON evidence bundle and CSV feedback from the app.
7. Open the Excel workbook summary and capture the reviewed 50-user totals.

## Review Notes

- Do not crop away the app URL, contract link, or transaction hash when the screenshot is used as activity proof.
- Do not claim 50+ users in screenshot captions until the workbook has 50 valid reviewed rows.
- Keep the old screenshots only if they still reflect the current UI after the Level 5 changes.
