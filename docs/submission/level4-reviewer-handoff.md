# Level 4 Reviewer Handoff

This handoff points reviewers to the exact Level 4 Green Belt evidence files.

## Technical Evidence

| Reviewer Question | Evidence |
| --- | --- |
| Is the app deployed? | `README.md`, `.github/workflows/deploy-pages.yml` |
| Does CI validate the contract? | `.github/workflows/deploy-pages.yml`, `docs/submission/level4-production-ops.md` |
| Does CI validate the frontend? | `.github/workflows/deploy-pages.yml`, `frontend/package.json` |
| Is the frontend wired to the contract? | `frontend/scripts/verify-contract-integration.mjs`, `frontend/src/lib/grantpulse.ts`, `frontend/src/App.tsx` |
| Are all contract functions exposed? | `contracts/grantpulse/src/lib.rs`, `frontend/packages/grantpulse/src/index.ts` |
| Is monitoring available? | `frontend/src/lib/telemetry.ts`, `docs/submission/level4-monitoring-qa.md` |

## Human Evidence

| Reviewer Question | Evidence |
| --- | --- |
| Are real wallet interactions collected? | `docs/submission/level4-user-wallet-interactions.csv` |
| Is feedback collected? | `docs/submission/level4-feedback-summary.md` |
| Are screenshots available? | `docs/screenshots/level4-product-ui.png`, `docs/screenshots/level4-mobile-responsive-ui.png`, `docs/screenshots/level4-analytics-monitoring.png` |
| Are proof rules documented? | `docs/submission/level4-wallet-proof-guide.md` |

## Final Reviewer Path

1. Read `LEVEL4_REVISION_RESPONSE.md`.
2. Run `npm run test:integration` in `frontend/`.
3. Inspect `.github/workflows/deploy-pages.yml`.
4. Open the live GitHub Pages app.
5. Review wallet interaction and feedback evidence after real tester collection is complete.
