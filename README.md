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

The verifier and payout worker call explicit command templates so the app does not depend on undocumented CLI behavior.

```bash
AIRDROP_DB_PATH=./data/airdrop.sqlite
AIRDROP_CHANNEL=the-great-first-channel
AIRDROP_REWARD_TON=25
AIRDROP_TOTAL_BUDGET_TON=5000
OPERATOR_TOKEN=change-me

PRIVATE_STATE_VERIFY_COMMAND=private-state-cli
PRIVATE_STATE_VERIFY_ARGS='["verify-transfer","--channel","{channel}","--tx","{txHash}","--json"]'

PRIVATE_STATE_PAYOUT_COMMAND=private-state-cli
PRIVATE_STATE_PAYOUT_ARGS='["transfer-notes","--to","{l2Address}","--amount","{amountTon}","--json"]'
```

Verification command stdout must be JSON:

```json
{ "valid": true, "resolvedL1Address": "0x...", "resolvedL2Address": "0x..." }
```

or:

```json
{ "valid": false, "reason": "transaction submitter is not a channel participant" }
```

The verifier must resolve `resolvedL2Address` from the channel participation epoch that contains the submitted transaction block, not from a later current registration.

Payout command stdout must include a transaction hash:

```json
{ "txHash": "0x..." }
```

## Operator Commands

Run pending verification and payout work:

```bash
npm run worker
```

The same worker can be triggered over HTTP:

```bash
curl -X POST http://localhost:3000/api/operator/run \
  -H "Authorization: Bearer $OPERATOR_TOKEN"
```
