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

## Vision

GrantPulse helps small teams prove progress without relying only on private forms or spreadsheets. A bootcamp, hackathon, or community program can use it to show which projects exist, how far they have moved, and how reviewers responded. It gives new builders a practical way to learn wallet authorization, smart contract storage, and public verification while creating a funding workflow that feels useful in real life.

## Development Plan

1. Create Soroban storage keys for grants, reviewer actions, each owner's grant count, and total grant count.
2. Add `create_grant(owner, grant_id, title, requested_amount, milestone_count)` with wallet authorization and duplicate protection.
3. Add `complete_milestone(owner, grant_id, status)` and `archive_grant(owner, grant_id)` for owner-controlled progress updates.
4. Add `review_grant(reviewer, owner, grant_id, approved)` so reviewers can approve or reject once.
5. Build a React frontend with Freighter wallet connection, grant creation, progress updates, review buttons, and verification cards.
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

## Tech Stack

- Stellar Soroban smart contract
- Rust
- React
- TypeScript
- Vite
- Freighter wallet
- Stellar Testnet

## Installation

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
