# Level 5 Google Form Setup

Create a Google Form named `GrantPulse Level 5 Testnet Onboarding`.

Published form URL:

```text
TODO - paste the public Google Form link here after creating the form
```

## Required Questions

1. Full name
   - Type: Short answer
   - Required: Yes

2. Email address
   - Type: Short answer
   - Required: Yes
   - Validation: Email

3. Stellar Testnet wallet address
   - Type: Short answer
   - Required: Yes
   - Validation: Regular expression `^G[A-Z2-7]{55}$`

4. Tester role
   - Type: Multiple choice
   - Required: Yes
   - Options: Builder, Reviewer, Founder, Tester, Other

5. Did you complete a real Stellar Testnet transaction in GrantPulse?
   - Type: Multiple choice
   - Required: Yes
   - Options: Yes, No

6. Transaction hash or Stellar Expert Testnet URL
   - Type: Short answer
   - Required: Yes
   - Accepted format: 64-character Testnet transaction hash or `https://stellar.expert/explorer/testnet/tx/<hash>`

7. Rate GrantPulse
   - Type: Linear scale
   - Required: Yes
   - Scale: 1 to 10
   - Labels: 1 = Very unclear, 10 = Very useful

8. What worked well?
   - Type: Paragraph
   - Required: Yes

9. What felt confusing, slow, or risky?
   - Type: Paragraph
   - Required: Yes

10. What should we improve next?
    - Type: Paragraph
    - Required: Yes

11. Can we use your anonymized feedback in the Level 5 submission?
    - Type: Multiple choice
    - Required: Yes
    - Options: Yes, No

## Recommended Form Description

```text
Please test GrantPulse on Stellar Testnet before submitting this form. Your response counts toward Level 5 only if it includes your name, email, unique Stellar Testnet wallet address, rating, product feedback, and a real transaction hash or Stellar Expert Testnet URL.
```

## Response Sheet Columns

Keep these columns when exporting to Excel:

```text
submitted_at
name
email
wallet_address
role
completed_testnet_transaction
transaction_hash_or_url
rating
worked_well
confusing_or_risky
next_improvement
anonymous_feedback_permission
transaction_hash
stellar_expert_url
```

The final two columns can be added in Google Sheets before exporting. They make the proof review faster:

- `transaction_hash`: normalized 64-character hash extracted from `transaction_hash_or_url`
- `stellar_expert_url`: full Testnet Explorer URL for the normalized hash

## Export Workflow

1. Open the form responses tab.
2. Link responses to a Google Sheet.
3. Add `transaction_hash` and `stellar_expert_url` helper columns if they are not already present.
4. Download the response sheet as Microsoft Excel `.xlsx`.
5. Replace `docs/submission/level5-user-feedback-export.xlsx` with the exported file.
6. Keep `docs/submission/level5-user-onboarding-template.csv` in the repo as the column reference.
7. Review rows with `docs/submission/level5-user-proof-review.md`.
8. Update the README with the published form link, exported Excel link, valid user count, proof count, and feedback-driven improvement notes.
