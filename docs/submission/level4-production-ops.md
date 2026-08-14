# GrantPulse Level 4 Production Ops

Date prepared: 2026-08-14

## Environment

The app runs without external analytics services. For production validation, these optional variables can forward the same local evidence events to a server or form endpoint:

```bash
VITE_ANALYTICS_ENDPOINT=https://example.com/analytics
VITE_FEEDBACK_ENDPOINT=https://example.com/feedback
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
VITE_SOROBAN_RPC_URL=https://soroban-testnet.stellar.org
```

If no endpoint is configured, telemetry and feedback are stored in browser local storage and can be exported from the app.

## Local Verification

```bash
cargo test
cd frontend
npm ci
npm run build
npm run preview
```

## Production Deployment

GitHub Pages deployment is handled by:

```text
.github/workflows/deploy-pages.yml
```

Push `main` or run the workflow manually from GitHub Actions. The expected live demo URL is:

```text
https://aydatas19.github.io/GrantPulse-stellar-soroban-bootcamp/
```

## Screenshot Set

Capture these after the Level 4 workflow has deployed:

| Screenshot | Suggested file |
| --- | --- |
| Product UI | `docs/screenshots/level4-product-ui.png` |
| Mobile responsive UI | `docs/screenshots/level4-mobile-responsive-ui.png` |
| Analytics/monitoring setup | `docs/screenshots/level4-analytics-monitoring.png` |
| 10+ wallet interaction evidence | `docs/screenshots/level4-wallet-proof.png` |

## Demo Recording Checklist

1. Show the deployed app URL.
2. Connect Freighter on Testnet.
3. Show wallet balance and network state.
4. Create or verify a grant.
5. Complete a milestone.
6. Approve or reject a grant from another wallet if available.
7. Show the Level 4 Validation analytics panel.
8. Submit feedback.
9. Export evidence.
10. Show the Stellar Expert contract page.

## Final Gate

Before submitting, verify:

- The public GitHub repository is up to date.
- `git log --oneline` shows at least 15 meaningful commits.
- The live demo URL opens the current Level 4 build.
- The README includes the contract ID, live demo, demo video, screenshots, and feedback summary links.
- `level4-user-wallet-interactions.csv` has 10 real rows with Stellar Expert URLs.
