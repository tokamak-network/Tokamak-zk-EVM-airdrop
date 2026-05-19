# Tonnel Airdrop

Minimal public airdrop app for Tonnel. Tonnel is the public brand name for `the-great-first-channel`, one of the Tokamak Private App Channels. Tokamak private-state is the dApp running in that channel.

The app collects qualifying transaction hashes, verifies that each Tokamak private-state `transfer notes` transaction in `the-great-first-channel` was submitted by a channel participant, resolves that participant's registered L2 address for the transaction block, and sends `25 TON` per valid submission.

## Status Labels

- `Pending`: default status for new applications and valid applications waiting for payout.
- `Transferred`: reward transfer succeeded.
- `Duplication`: duplicate resolved L2 address or qualifying transaction hash.
- `Failed`: any non-duplication failure.

## Setup

```bash
npm install
npm run db:init
npm run dev
```

## Environment

The public app collects submissions. The payout worker is local-only and must be run on the operator MacBook. It installs the latest private-state CLI before each run, verifies submitted transactions through Ethereum RPC, pays through `private-state-cli wallet transfer-notes`, and syncs remaining budget from `private-state-cli wallet get-notes`.

```bash
AIRDROP_DB_PATH=./data/airdrop.sqlite
AIRDROP_NETWORK=mainnet
AIRDROP_CHANNEL=the-great-first-channel
AIRDROP_REWARD_TON=25
AIRDROP_TOTAL_BUDGET_TON=5000
OPERATOR_TOKEN=change-me

AIRDROP_RPC_URL=https://eth-mainnet.example
AIRDROP_RPC_PROVIDER=alchemy
AIRDROP_RPC_BLOCK_RANGE_CAP=1000
AIRDROP_CHANNEL_GENESIS_BLOCK=25018368
AIRDROP_CHANNEL_MANAGER_ADDRESS=0x3108d92A38bFb4B3396DE7ad4D92318a8fbE61D7
AIRDROP_REWARD_ACCOUNT=account2
AIRDROP_REWARD_PRIVATE_KEY_FILE=~/user-secrets/account2.key
# Optional. If omitted, the worker derives: the-great-first-channel-<account2 L1 address>
AIRDROP_REWARD_WALLET=
AIRDROP_PAYOUTS_PAUSED=false
```

Do not store `~/user-secrets/account2.key` in this repository, the database, logs, or deployment environment.

For local worker execution, put these values in `.env.local` on the operator MacBook. The worker loads `.env` and `.env.local` before reading configuration, which keeps `launchd` runs consistent with manual runs.

## Operator Commands

Run pending verification, payout, and budget sync locally:

```bash
npm run worker
```

Install or remove the twice-daily macOS `launchd` job:

```bash
npm run worker:install-launchd
npm run worker:uninstall-launchd
```

The public server does not run payouts. The legacy HTTP worker endpoint returns `410`; use the local worker command above.

## Worker Notes

- The worker updates the global `@tokamak-private-dapps/private-state-cli` package to latest before running.
- Transaction eligibility is checked through RPC, not through CLI.
- The reward wallet note balance from `wallet get-notes --json` is the public remaining-budget source.
- The worker prefers one exact `25 TON` note. If unavailable, it uses the smallest larger one-note input and sends change back to the reward wallet. Exact two-note sums are supported. Two-note overpaying selections fail because the current CLI does not support `2->2` transfer change.
- Duplicate transaction hashes and duplicate resolved Tonnel channel addresses cannot receive multiple payouts.

Inspect stuck rows with SQLite:

```bash
sqlite3 ./data/airdrop.sqlite \
  "SELECT id, qualifying_tx_hash, resolved_l2_address, status, reason FROM applications ORDER BY created_at DESC LIMIT 20;"
```
