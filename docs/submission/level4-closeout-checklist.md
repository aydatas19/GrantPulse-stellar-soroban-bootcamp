# Level 4 Closeout Checklist

Use this after technical fixes are merged and before the final Green Belt resubmission.

## Technical Closeout

- [x] Root GitHub Actions workflow exists in `.github/workflows/`.
- [x] Smart contract CI runs formatting, Clippy, tests, and WASM build.
- [x] Frontend CI runs install, integration verification, and production build.
- [x] Deploy waits for both smart contract and frontend jobs.
- [x] Frontend uses generated Soroban TypeScript binding.
- [x] React UI calls every public contract function.
- [x] Runtime monitoring and feedback evidence export are documented.

## Evidence Closeout

- [ ] 10+ real wallet interaction rows added.
- [ ] Wallet interaction rows include Testnet transaction proof links.
- [ ] Real feedback summary completed.
- [ ] Final product UI screenshot updated.
- [ ] Final mobile screenshot updated.
- [ ] Final analytics/monitoring screenshot updated.
- [ ] Final Level 4 demo video link added.

## Resubmission Note

The technical Level 4 resubmission is complete when:

```text
npm run test:integration
npm run build
cargo test
```

all pass locally and the GitHub Actions workflow passes on `main`.
