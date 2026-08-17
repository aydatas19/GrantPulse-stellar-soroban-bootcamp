# Level 4 CI Troubleshooting

Use this when the Level 4 GitHub Actions workflow fails.

## Smart Contract CI

| Failure | Local Command | Likely Fix |
| --- | --- | --- |
| Rust format | `cargo fmt --all -- --check` | Run `cargo fmt --all` and commit formatting |
| Clippy | `cargo clippy --workspace --all-targets -- -D warnings` | Fix the lint instead of lowering the lint gate |
| Contract tests | `cargo test --workspace` | Update contract logic or tests |
| WASM build | `cargo build --workspace --target wasm32v1-none --release` | Add target or fix no-std compatibility |

## Frontend CI

| Failure | Local Command | Likely Fix |
| --- | --- | --- |
| Install | `npm ci` | Commit lockfile changes |
| Integration check | `npm run test:integration` | Restore contract binding, client, or UI call wiring |
| Build | `npm run build` | Fix TypeScript or Vite errors |

## Deployment Job

If CI passes but deploy fails:

1. Confirm the workflow has `pages: write` and `id-token: write` permissions.
2. Confirm Pages is configured to deploy from GitHub Actions.
3. Confirm `frontend/dist` exists after the frontend build.
4. Re-run the failed job from GitHub Actions after the fix is committed.

## Reviewer Note

CI failures should be fixed in code or workflow configuration. Do not bypass CI by removing checks during the Level 4 review period.
