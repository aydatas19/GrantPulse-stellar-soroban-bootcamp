# Level 5 Google Form Setup

Create a Google Form named `GrantPulse Level 5 Testnet Onboarding`.

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

## Export Workflow

1. Open the form responses tab.
2. Link responses to a Google Sheet.
3. Download the response sheet as Microsoft Excel `.xlsx`.
4. Replace `docs/submission/level5-user-feedback-export.xlsx` with the exported file.
5. Keep `docs/submission/level5-user-onboarding-template.csv` in the repo as the column reference.
6. Update the README with the published form link, exported Excel link, user count, and feedback-driven improvement notes.
