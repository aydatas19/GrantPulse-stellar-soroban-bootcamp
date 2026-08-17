# Level 4 Wallet Proof Guide

Use this guide to collect and review the 10+ real wallet interactions required for Green Belt validation.

## Valid Wallet Interaction

A row counts as real Level 4 wallet proof only when it includes:

| Field | Requirement |
| --- | --- |
| Tester name or alias | Identifies the tester without exposing private keys |
| Wallet address | Stellar Testnet public key beginning with `G` |
| Action | Wallet connect, Friendbot funding, XLM payment, grant create, milestone, review, or archive |
| Transaction hash | 64-character Testnet transaction hash when the action writes to chain |
| Stellar Expert URL | Testnet Explorer URL for the transaction or contract |
| Result | Success, failed with reason, or follow-up needed |

## Accepted Proof Links

```text
https://stellar.expert/explorer/testnet/tx/<transaction_hash>
https://stellar.expert/explorer/testnet/contract/CDNCS5MQUHT2XAOITMC74U7SKKDHQ4WJMEDNLLKFSMESSOK3SSNNFMWV
```

## Rejected Proof

- Mainnet links.
- Screenshots with no wallet address or transaction hash.
- Wallet addresses pasted into the transaction field.
- Duplicate transaction hashes counted as separate users.
- Placeholder rows such as `TODO`, `test`, or `sample`.

## Review Workflow

1. Export the in-app JSON evidence from the deployed app.
2. Copy real interaction rows into `docs/submission/level4-user-wallet-interactions.csv`.
3. Open every Stellar Expert URL and confirm it is on Testnet.
4. Keep failed interactions if they show real usage and the failure reason is documented.
5. Summarize the final reviewed count in `docs/submission/level4-feedback-summary.md`.
