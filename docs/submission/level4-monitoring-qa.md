# Level 4 Monitoring QA

GrantPulse Level 4 includes local analytics, feedback collection, runtime error monitoring, and optional forwarding endpoints. Use this QA pass before recording or submitting the Green Belt demo.

## Runtime Monitoring Checks

| Check | Expected Result |
| --- | --- |
| Page load | Adds a `session_started` event |
| Wallet connect success | Adds a `wallet_connected` event |
| Wallet connect failure | Adds a `wallet_connect_failed` error event |
| Payment success | Adds a `wallet_payment_sent` event with transaction hash |
| Contract write success | Adds a `contract_*` event with grant ID and transaction hash |
| Feedback submission | Adds a `feedback_submitted` event |
| Evidence export | Adds an `evidence_exported` event |

## Local Storage Keys

```text
grantpulse.level5.telemetry
grantpulse.level5.feedback
```

The keys include `level5` because the same telemetry surface grew into the Level 5 dashboard, but it also supports Level 4 monitoring proof.

## Optional Endpoint Checks

If endpoints are configured:

```text
VITE_ANALYTICS_ENDPOINT
VITE_FEEDBACK_ENDPOINT
```

Confirm that:

1. The app still stores a local copy.
2. The endpoint receives JSON payloads.
3. A failed endpoint does not block wallet or contract flows.

## Evidence Export Review

Open the exported JSON and confirm these fields exist:

```text
project
generatedAt
contractId
summary
events
feedback
```
