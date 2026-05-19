# Tokamak Private-State Airdrop

Minimal public airdrop app for collecting L2 account submissions, verifying a qualifying `transfer notes` transaction in `the-great-first-channel`, and sending a `25 TON` reward once per L2 account.

## Status Labels

- `Pending`: default status for new applications and valid applications waiting for payout.
- `Transferred`: reward transfer succeeded.
- `Duplication`: duplicate L2 address or qualifying transaction hash.
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
AIRDROP_TOTAL_BUDGET_TON=1200
OPERATOR_TOKEN=change-me

PRIVATE_STATE_VERIFY_COMMAND=private-state-cli
PRIVATE_STATE_VERIFY_ARGS='["verify-transfer","--channel","{channel}","--l2-address","{l2Address}","--tx","{txHash}","--json"]'

PRIVATE_STATE_PAYOUT_COMMAND=private-state-cli
PRIVATE_STATE_PAYOUT_ARGS='["transfer-notes","--to","{l2Address}","--amount","{amountTon}","--json"]'
```

Verification command stdout must be JSON:

```json
{ "valid": true }
```

or:

```json
{ "valid": false, "reason": "not a transfer notes transaction" }
```

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
