# GrantPulse Level 4 Submission Checklist

Date prepared: 2026-08-14

## Status Legend

- Ready: implemented in the repository and can be shown in the live app.
- Evidence needed: the repo has the collection flow or template, but the final submission needs real user data.
- Pending asset: record or capture this after the Level 4 build is deployed.

## Requirement Matrix

| Requirement | Status | Evidence |
| --- | --- | --- |
| Production-ready MVP | Ready | React + TypeScript frontend, deployed Soroban testnet contract client, wallet/payment/grant/review flows |
| Stable frontend architecture | Ready | `frontend/src/App.tsx`, `frontend/src/lib/grantpulse.ts`, `frontend/src/lib/telemetry.ts` |
| Stable smart contract architecture | Ready | `contracts/grantpulse/src/lib.rs`, lifecycle tests in `contracts/grantpulse/src/test.rs` |
| Mobile responsive UI | Ready | Responsive CSS in `frontend/src/styles.css`; capture updated Level 4 mobile screenshot after deploy |
| Loading states and error handling | Ready | Busy states, result panels, runtime error monitoring, Horizon/Freighter error parsing |
| User onboarding | Evidence needed | Use the app with 10+ real wallets and record rows in `docs/submission/level4-user-wallet-interactions.csv` |
| Proof of wallet interactions | Evidence needed | Add Stellar Expert links for each real wallet interaction hash |
| Basic user feedback collection | Ready + evidence needed | In-app feedback form and export; summarize real responses in `docs/submission/level4-feedback-summary.md` |
| Production deployment | Ready | GitHub Pages workflow: `.github/workflows/deploy-pages.yml`; live link in README |
| Monitoring and analytics integration | Ready | Local telemetry, runtime error monitor, optional `VITE_ANALYTICS_ENDPOINT`, evidence export |
| Optimized UX | Ready | Onboarding validation panel, evidence export, responsive controls, status/error surfaces |
| Proper documentation | Ready | README plus Level 4 submission docs in `docs/submission/` |
| Smart contract deployed on Stellar testnet | Ready | Contract ID: `CDNCS5MQUHT2XAOITMC74U7SKKDHQ4WJMEDNLLKFSMESSOK3SSNNFMWV` |
| Minimum 15+ meaningful commits | Ready after local Level 4 commits | Confirm with `git log --oneline --decorate -20` before submission |
| Public GitHub repository | Ready | <https://github.com/aydatas19/GrantPulse-stellar-soroban-bootcamp> |
| Demo video | Pending asset | Record a new Level 4 demo after deployment |
| Product UI screenshot | Ready baseline | `docs/screenshots/level4-product-ui.png`; recapture after live deployment if the URL changes |
| Mobile screenshot | Ready baseline | `docs/screenshots/level4-mobile-responsive-ui.png`; recapture after live deployment if the URL changes |
| Analytics/monitoring screenshot | Ready baseline + real data recommended | `docs/screenshots/level4-analytics-monitoring.png`; recapture after 10 tester sessions for stronger evidence |

## Evidence Capture Flow

1. Ask each tester to open the live demo with Freighter on Stellar Testnet.
2. Have the tester connect a wallet and perform at least one wallet-backed action.
3. Prefer actions that create on-chain proof: XLM payment, grant creation, milestone update, review, or archive.
4. Copy the wallet address, interaction type, grant ID, transaction hash, and Stellar Expert URL into `level4-user-wallet-interactions.csv`.
5. Ask the tester to submit feedback in the in-app User Feedback panel.
6. Export the in-app evidence JSON after the test session.
7. Summarize feedback themes in `level4-feedback-summary.md`.

## Demo Video Script

1. Open the deployed GitHub Pages app.
2. Show the contract ID and Stellar Expert link from the top actions.
3. Connect Freighter on Stellar Testnet.
4. Show wallet balance loading and status feedback.
5. Create a grant, complete a milestone, refresh verification, and approve or reject from a second wallet if available.
6. Show the Level 4 Validation panel with analytics events.
7. Submit one feedback entry.
8. Export the evidence bundle.
9. Close by showing the README Level 4 section and the contract deployment address.
