# GrantPulse Level 4 Resubmission Evidence

Date prepared: 2026-08-17

## Purpose

This note addresses the Level 4 revision feedback that the judged subset could not inspect frontend integration or CI/CD configuration.

## Evidence Files

| Evidence area | File |
| --- | --- |
| Root revision response | `LEVEL4_REVISION_RESPONSE.md` |
| GitHub Actions CI/CD workflow | `.github/workflows/deploy-pages.yml` |
| React app contract calls and Stellar SDK payment flow | `frontend/src/App.tsx` |
| Typed Soroban client setup and Freighter signing | `frontend/src/lib/grantpulse.ts` |
| Generated Soroban TypeScript binding | `frontend/packages/grantpulse/src/index.ts` |
| Frontend dependency and integration test scripts | `frontend/package.json` |
| Static integration verification script | `frontend/scripts/verify-contract-integration.mjs` |
| Smart contract source | `contracts/grantpulse/src/lib.rs` |
| Smart contract tests | `contracts/grantpulse/src/test.rs` |

## Automated Checks Added

The Level 4 GitHub Actions workflow now verifies:

- `cargo fmt --all -- --check`
- `cargo clippy --workspace --all-targets -- -D warnings`
- `cargo test --workspace`
- `cargo build --workspace --target wasm32v1-none --release`
- `npm ci`
- `npm run test:integration`
- `npm run build`

The deployment job runs only after both the smart contract CI job and frontend CI job pass.

## Frontend Integration Assertions

`npm run test:integration` checks that:

- `frontend/package.json` depends on `@stellar/stellar-sdk`.
- `frontend/package.json` consumes `grantpulse` from `file:packages/grantpulse`.
- `frontend/src/lib/grantpulse.ts` imports the generated binding and wires Freighter `signTransaction`.
- `frontend/packages/grantpulse/src/index.ts` exports the deployed Testnet contract ID.
- The React UI calls all eight public contract methods.
- The React UI uses Stellar SDK primitives for Horizon account loading, Testnet transaction building, payments, account creation, public key validation, and transaction submission.
- Wallet, contract, and feedback events are recorded for evidence export.

## Remaining Human Evidence

The technical revision is complete in code. The following Level 4 proof should still be collected from real testers before final submission:

- 10+ real wallet interaction rows in `docs/submission/level4-user-wallet-interactions.csv`.
- A real tester feedback summary in `docs/submission/level4-feedback-summary.md`.
- Updated screenshots and a Level 4 demo video from the deployed app.
