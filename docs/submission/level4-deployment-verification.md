# Level 4 Deployment Verification

Use this checklist after every push to `main` during the Level 4 Green Belt review window.

## GitHub Actions Verification

| Check | Expected Result |
| --- | --- |
| `Smart contract CI` job | Passes Rust formatting, Clippy, tests, and Soroban WASM build |
| `Frontend CI and Pages artifact` job | Passes `npm ci`, `npm run test:integration`, and `npm run build` |
| `Deploy` job | Runs only after both CI jobs pass |
| Pages artifact | Publishes `frontend/dist` |

## Live App Verification

| Area | Expected Result |
| --- | --- |
| URL | `https://aydatas19.github.io/GrantPulse-stellar-soroban-bootcamp/` loads without a blank page |
| Wallet | Freighter connect button works on Stellar Testnet |
| Contract | Grant create, milestone, review, archive, and lookup flows call the deployed contract |
| Evidence | JSON export contains telemetry, contract ID, and recent events |
| Feedback | Feedback submission writes to local storage or configured endpoint |
| Mobile | Growth, wallet, payment, and grant panels remain readable |

## Required Screenshots

Save updated screenshots when the workflow or UI changes:

```text
docs/screenshots/level4-product-ui.png
docs/screenshots/level4-mobile-responsive-ui.png
docs/screenshots/level4-analytics-monitoring.png
docs/screenshots/cicd-pages-pipeline.png
```

## Failure Handling

If deployment fails, fix the failing CI job first. Do not update the live demo link in the README until the Pages deployment succeeds.
