# Level 5 User Proof Review

Use this checklist after exporting Google Form responses to Excel. It prevents inflated user counts and keeps the Level 5 evidence auditable.

## Valid Response Rules

| Field | Valid When |
| --- | --- |
| `name` | Not blank and not a test placeholder |
| `email` | Unique and formatted as an email address |
| `wallet_address` | Unique and matches `^G[A-Z2-7]{55}$` |
| `completed_testnet_transaction` | `Yes` |
| `transaction_hash_or_url` | A 64-character transaction hash or Stellar Expert Testnet transaction URL |
| `rating` | Number from 1 through 10 |
| Feedback text | At least one concrete product observation is present |

## Duplicate Handling

- If the same person submits multiple rows, count only the latest complete row.
- If the same wallet appears in multiple rows, count only one row unless the tester can explain a shared testing wallet.
- If the same transaction hash appears in multiple rows, count only the first valid row.

## Transaction Proof QA

Accepted proof formats:

```text
1f49394a95040b8c3ac1651f8727b4346eee33e21e5e5c674d9d1654b611f485
https://stellar.expert/explorer/testnet/tx/1f49394a95040b8c3ac1651f8727b4346eee33e21e5e5c674d9d1654b611f485
```

Rejected proof formats:

```text
mainnet Stellar Expert links
contract IDs without transaction hashes
wallet addresses pasted into the transaction field
screenshots without a hash or URL
```

## Final Count Statement

Before submission, add a one-line summary to the README:

```text
Level 5 user proof: 50 valid rows reviewed from the Google Form Excel export on YYYY-MM-DD.
```
