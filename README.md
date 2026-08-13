# GrantPulse Stellar

GrantPulse is a Stellar Soroban dApp for tracking mini grants, hackathon projects, and milestone-based builder progress on-chain.

## Project Name

- GrantPulse Stellar

## About Me

- name: Your Name
- Building with Stellar Soroban
- Interested in transparent funding, project progress, and useful blockchain records
- Learning how smart contracts, wallets, and frontends work together
- Creating a project that can be customized for bootcamps, hackathons, and demo days

## Project Details

GrantPulse lets a project owner create an on-chain grant record with a title, requested amount, and milestone count. The owner can mark milestones as completed, archive the grant, and show progress publicly. Reviewers can connect their Freighter wallet and approve or reject a grant once. The smart contract stores the grant owner, grant ID, requested amount, milestone progress, review counts, timestamps, and active status.

The frontend also includes the Level 1 White Belt wallet flow: connect Freighter on Stellar Testnet, disconnect the wallet, fund the connected testnet account with Friendbot, display the native XLM balance, and send a testnet XLM transaction with success or failure feedback.

## Level 1 White Belt Features

- Freighter wallet connection and disconnect controls.
- Stellar Testnet network validation before wallet, balance, grant, and payment actions.
- Friendbot funding button for the connected Testnet wallet.
- Native XLM balance lookup through Horizon Testnet.
- XLM transfer form with recipient address and amount inputs.
- Payment transaction signing through Freighter and submission to Horizon Testnet.
- Transaction result panel with success or failure state and a Stellar Expert transaction hash link.
- Beginner-friendly error handling for invalid addresses, invalid amounts, unfunded source accounts, and new recipient accounts.

## Vision

GrantPulse helps small teams prove progress without relying only on private forms or spreadsheets. A bootcamp, hackathon, or community program can use it to show which projects exist, how far they have moved, and how reviewers responded. It gives new builders a practical way to learn wallet authorization, smart contract storage, and public verification while creating a funding workflow that feels useful in real life.

## Development Plan

1. Create Soroban storage keys for grants, reviewer actions, each owner's grant count, and total grant count.
2. Add `create_grant(owner, grant_id, title, requested_amount, milestone_count)` with wallet authorization and duplicate protection.
3. Add `complete_milestone(owner, grant_id, status)` and `archive_grant(owner, grant_id)` for owner-controlled progress updates.
4. Add `review_grant(reviewer, owner, grant_id, approved)` so reviewers can approve or reject once.
5. Build a React frontend with Freighter wallet connection, Testnet XLM balance display, XLM payment flow, grant creation, progress updates, review buttons, and verification cards.
6. Test, build, generate TypeScript bindings, deploy to Stellar Testnet, and connect the deployed contract ID to the frontend.

## Smart Contract

Main contract:

```text
contracts/grantpulse
```

Functions:

```text
create_grant(owner: Address, grant_id: String, title: String, requested_amount: u32, milestone_count: u32) -> u32
complete_milestone(owner: Address, grant_id: String, status: String) -> u32
review_grant(reviewer: Address, owner: Address, grant_id: String, approved: bool) -> bool
archive_grant(owner: Address, grant_id: String) -> bool
get_grant(owner: Address, grant_id: String) -> Grant
get_progress(owner: Address, grant_id: String) -> u32
get_grant_count(owner: Address) -> u32
get_total_grants() -> u32
```

## Deployed Contract

- Network: Stellar Testnet
- Contract ID: `CDNCS5MQUHT2XAOITMC74U7SKKDHQ4WJMEDNLLKFSMESSOK3SSNNFMWV`
- Explorer: <https://stellar.expert/explorer/testnet/contract/CDNCS5MQUHT2XAOITMC74U7SKKDHQ4WJMEDNLLKFSMESSOK3SSNNFMWV>

## Level 2 Submission Evidence

- Public repository: <https://github.com/aydatas19/GrantPulse-stellar-soroban-bootcamp>
- Live demo: optional, not deployed yet
- Meaningful commits: 5 total commits after this Level 2 evidence update
- Wallet options screenshot: `docs/screenshots/wallet-options-available.png`
- Deployed contract address: `CDNCS5MQUHT2XAOITMC74U7SKKDHQ4WJMEDNLLKFSMESSOK3SSNNFMWV`
- Contract call transaction hash: `1f49394a95040b8c3ac1651f8727b4346eee33e21e5e5c674d9d1654b611f485`
- Contract call Explorer link: <https://stellar.expert/explorer/testnet/tx/1f49394a95040b8c3ac1651f8727b4346eee33e21e5e5c674d9d1654b611f485>
- Contract call function: `create_grant`
- Contract call grant ID: `level2-evidence-20260813-2119`

## Tech Stack

- Stellar Soroban smart contract
- Rust
- React
- TypeScript
- Vite
- Freighter wallet
- Stellar Testnet

## Installation

Before running the dApp, install the Freighter browser extension and switch it to Stellar Testnet.

Install the Soroban target:

```bash
rustup target add wasm32v1-none
```

Run contract tests:

```bash
cargo test
```

Build the contract:

```bash
stellar contract build
```

Generate TypeScript bindings after deployment:

```bash
stellar contract bindings typescript \
  --network testnet \
  --contract-id grantpulse \
  --output-dir frontend/packages/grantpulse
```

Install and build the generated binding:

```bash
cd frontend/packages/grantpulse
npm install
npm run build
cd ../..
```

Install and run the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open:

```bash
http://localhost:4328
```

Optional frontend environment override:

```bash
VITE_HORIZON_URL=https://horizon-testnet.stellar.org
```

## How to Test Level 1

1. Open the app locally and click `Connect`.
2. Approve the Freighter request with a Testnet account selected.
3. Confirm the dashboard shows the connected wallet and XLM balance.
4. Click `Fund Testnet` if the wallet needs testnet XLM.
5. Enter a recipient Testnet public key and an XLM amount.
6. Click `Send XLM`, approve the Freighter signature request, and wait for the result panel.
7. Open the transaction hash link to verify the transaction on Stellar Expert Testnet.
8. Click `Disconnect` to clear the wallet session from the UI.

If the recipient account does not exist yet, the app uses a Stellar `createAccount` operation instead of a payment operation. In that case, send at least `1 XLM`.

## Submission Screenshots

Level 2 wallet options screenshot:

![Wallet options available](docs/screenshots/wallet-options-available.png)

Additional Level 1 test screenshot paths:

- `docs/screenshots/wallet-connected.png`
- `docs/screenshots/balance-displayed.png`
- `docs/screenshots/successful-testnet-transaction.png`

The successful transaction screenshot should show the transaction result panel with the Stellar Testnet transaction hash.

## Visual Concept

- Mascot: robot grant coordinator
- Setting: bright builder studio with project boards and funding signals
- Physical keywords: checking milestones, approving progress, launching projects
- Art direction: futuristic happy digital painting with transparent funding dashboards, energetic builders, clean blockchain signals, and confident progress

## Useful Links

- Stellar Developer Documentation: <https://developers.stellar.org/docs>
- Freighter Documentation: <https://docs.freighter.app/docs>
- Stellar Chain Explorer: <https://stellar.expert/explorer/testnet>
- Stellar Lab: <https://lab.stellar.org>
