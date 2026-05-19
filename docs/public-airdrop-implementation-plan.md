# Public Airdrop Implementation Plan

## Goal

Rebuild this repository as a simple public airdrop application for Tonnel.

Tonnel is the public brand name for `the-great-first-channel`, one of the Tokamak Private App Channels. Tokamak private-state is the dApp running in that channel.

The event rewards `25 TON` per valid submission when the operator worker verifies one valid Tokamak private-state `transfer notes` transaction generated in `the-great-first-channel` by an L1 address that was participating in the channel at the transaction block. KYC is not required. Participants submit only the qualifying transaction hash. The operator worker resolves the L1 transaction submitter, finds the L2 address registered by that L1 address for the channel participation epoch containing the transaction, and sends the reward to that resolved L2 address. Duplicate resolved L2 addresses or duplicate qualifying transaction hashes are not valid submissions.

This document is the implementation plan and status tracker. It intentionally avoids a large admin system, complex event configuration, or extra audit tables unless they become necessary.

## Scope

Build only what is needed for the first public event:

- A public instruction page.
- A submission form for a qualifying transaction hash.
- A lightweight API that saves submissions.
- A local macOS worker script that checks submitted transactions.
- A local macOS payout script path that sends `25 TON` per valid submission after verification.
- A status page that shows submission and payout state.
- A minimal operator-only way to inspect records and rerun failed local worker jobs.

Do not build an always-on server backend worker, generalized campaign management, KYC, social verification, manual approval workflows, or a full admin dashboard in the first version.

## Implementation Status

### Already Implemented

The repository already has these first-version web application pieces:

- Public Tonnel airdrop page with hero content, event summary, participation guide, submission form, status section, winner criteria, and footer documentation copy.
- Transaction-hash submission flow. Participants no longer submit an L2 address.
- Application API for creating submissions, listing public applications, and checking individual status.
- Duplicate transaction-hash handling at submission time. Duplicate transaction hashes are stored with status `Duplication`.
- SQLite-backed `applications` table with the current submission, verification, payout, status, and timestamp fields needed by the public app.
- Public Status table with pagination and at most 10 rows per page.
- Basic operator API routes and a command-template worker skeleton.

The current web application is usable for collecting submissions and showing public status, but it is not yet ready for production payouts.

### Remaining Work

The following pieces are still required before the public event can be operated safely:

- Replace the command-template worker skeleton with the planned local macOS worker.
- Add the `event_state` table and make it the public budget source.
- Change Remaining budget rendering so it reads `event_state.remaining_budget_ton` instead of calculating from `Transferred` rows.
- Add latest-CLI setup, RPC verification, participation lookup, adaptive note selection, CLI payout, and reward-wallet budget sync.
- Add macOS `launchd` install and uninstall scripts for twice-daily worker execution.
- Add worker tests or dry-run checks for duplicate submission, invalid transaction, valid verification, payout retry, unsupported note selection, insufficient notes, and budget sync.

## Event Rules

- Public channel brand: `Tonnel`.
- Underlying channel: `the-great-first-channel`.
- Qualifying action: one valid `transfer notes` transaction in that channel.
- Reward: `25 TON` per valid submission.
- Budget: `5000 TON`.
- Claim limit: unlimited valid submissions.
- Duplicate prevention: the same resolved L2 address or the same qualifying transaction hash must not receive multiple payouts.
- Submission status labels: `Pending`, `Transferred`, `Duplication`, `Failed`.
- No KYC.
- Multiple L2 accounts controlled by the same person are allowed when each claim is backed by a different qualifying transaction and a different resolved L2 address.

## Simple Architecture

Use a single Next.js app for the public page and submission API. Do not run payout or verification as an always-on server backend.

Components:

- Public pages: event guide, submission form, status table.
- API routes: create submission, list applications, get status.
- Database: one primary table for submissions plus one event-state table.
- Local worker script: verify `Pending` submissions, transfer eligible rewards, and sync remaining reward notes.
- macOS scheduling: run the local worker twice per day with `launchd`.

The worker runs on the operator MacBook, not inside the public web server. The worker must use the latest `@tokamak-private-dapps/private-state-cli` package and the commands exposed by that latest CLI version.

The public app and local worker must point at the same database. If the public app is deployed away from the MacBook, the deployment must provide a concrete database access plan before the worker can be considered production-ready.

## Minimal Data Model

Use two tables: `applications` and `event_state`.

`applications` is already implemented as the primary submission table. The final local-worker version should contain these fields:

- `id`: internal UUID.
- `qualifying_tx_hash`: submitted `transfer notes` transaction hash.
- `resolved_l1_address`: L1 transaction submitter resolved during verification.
- `resolved_l2_address`: L2 address registered by the resolved L1 address for the channel participation epoch containing the submitted transaction.
- `status`: `Pending`, `Transferred`, `Duplication`, `Failed`.
- `reason`: failure reason for `Duplication` or `Failed`.
- `payout_tx_hash`: reward transaction hash for `Transferred`.
- `verified_at`: timestamp when RPC verification succeeded.
- `transferred_at`: timestamp when CLI payout succeeded. This field is still pending if the implementation keeps the current schema.
- `created_at`, `updated_at`.

`event_state` is not implemented yet. It should contain these fields:

- `id`: fixed singleton key, for example `tonnel-airdrop`.
- `remaining_budget_ton`: remaining reward notes measured from the reward wallet by `private-state-cli wallet get-notes`.
- `reward_wallet_unused_note_count`: count of unused reward-wallet notes returned by `wallet get-notes`.
- `reward_wallet_unused_note_balance_ton`: total unused reward-wallet note value returned by `wallet get-notes`.
- `transferred_count`: current count of `Transferred` applications.
- `expected_spent_ton`: `transferred_count * 25`; this is an error-checking value only, not the source of truth for remaining budget.
- `budget_discrepancy_ton`: difference between the expected spent amount and the observed reward-wallet note balance change, when the baseline is available.
- `last_budget_sync_at`: timestamp of the latest successful wallet note sync.
- `last_worker_run_at`: timestamp of the latest worker run.
- `last_worker_error`: latest worker-level error, if any.

Status meanings:

- `Pending`: default status for a newly submitted application. It also covers applications waiting for verification or payout.
- `Transferred`: reward transfer succeeded.
- `Duplication`: application failed because the resolved L2 address or qualifying transaction hash was already used.
- `Failed`: application failed for any non-duplication reason.

Duplicate detection must prevent multiple payouts for the same resolved L2 address or qualifying transaction hash. Duplicate submissions are still stored, but their status is `Duplication` and they are never eligible for payout. A duplicate transaction hash can be detected at submission time. Duplicate resolved L2 addresses are detected after verification, because the participant no longer submits an L2 address.

The event page must read the remaining budget from `event_state`, not from `Transferred` count arithmetic. `Transferred count * 25` is retained only as a consistency check against the reward-wallet note balance measured by the CLI.

## Submission Flow

1. User reads the guide.
2. User submits:
   - Qualifying `transfer notes` transaction hash.
3. The application API validates basic formats.
4. The application API checks whether the transaction hash was already submitted.
5. The application API stores the application with default status `Pending` if the transaction hash is not duplicated.
6. The application API stores the application with status `Duplication` if the transaction hash is duplicated.

The website must never ask users to submit private keys.

## Local Worker Setup

The operator MacBook is the execution environment for verification, payout, and budget synchronization.

Required local configuration:

- `AIRDROP_NETWORK=mainnet`.
- `AIRDROP_CHANNEL=the-great-first-channel`.
- `AIRDROP_REWARD_TON=25`.
- `AIRDROP_REWARD_ACCOUNT=account2`.
- `AIRDROP_REWARD_PRIVATE_KEY_FILE=~/user-secrets/account2.key`.
- `AIRDROP_REWARD_WALLET`: optional explicit wallet name. If omitted, derive the deterministic wallet name from `the-great-first-channel` and the L1 address returned by `private-state-cli account get-l1-address --account account2 --network mainnet`.
- `AIRDROP_RPC_URL`: Ethereum mainnet RPC URL used by RPC verification and by `private-state-cli set rpc`.
- `AIRDROP_DB_PATH`: path to the SQLite database used by both the public app and the local worker.

Before each scheduled worker run:

1. Update the global CLI to latest:
   - `npm install -g @tokamak-private-dapps/private-state-cli@latest`.
2. Ensure full CLI runtime artifacts are installed:
   - `private-state-cli install`.
3. Ensure the RPC endpoint is configured:
   - `private-state-cli set rpc --network mainnet --rpc-url "$AIRDROP_RPC_URL"`.
4. Ensure `account2` is imported locally when missing:
   - `private-state-cli account import --account account2 --network mainnet --private-key-file ~/user-secrets/account2.key`.

The worker must not write, copy, print, or store `~/user-secrets/account2.key` in the application database or logs.

## Verification Flow

The verifier checks only the facts needed for eligibility:

1. Load `Pending` applications.
2. Fetch the submitted transaction and receipt through Ethereum RPC.
3. Confirm the receipt exists and succeeded.
4. Confirm the transaction called the channel manager for `the-great-first-channel`.
5. Decode the channel manager call with the installed bridge ABI and confirm it is `executeChannelTransaction`.
6. Confirm the accepted private-state function metadata is one of the registered `transferNotes` function selectors.
7. Use the transaction `from` address as the resolved L1 submitter.
8. Resolve the L2 address registered by that L1 address for the channel participation epoch containing the submitted transaction block.
9. Store `resolved_l1_address`, store `resolved_l2_address`, keep valid applications as `Pending`, and pass them to the payout step.
10. Mark invalid applications as `Failed`.

The worker must perform these concrete RPC checks:

- Fetch the L1 transaction and receipt by `qualifying_tx_hash`.
- Load the bridge ABI manifest from the latest CLI artifact directory, for example `~/tokamak-private-channels/dapps/private-state/chain-id-1/bridge-abi-manifest.1.json`.
- Load the public channel manager address for `the-great-first-channel`. The current mainnet channel manager is `0x3108d92A38bFb4B3396DE7ad4D92318a8fbE61D7`.
- Confirm `transaction.to` is the channel manager.
- Decode calldata using `channelManager.executeChannelTransaction((payload), (functionProof))`.
- Confirm `functionProof.metadata.functionSig` is one of the private-state `transferNotes` selectors registered for the channel. The implementation must derive this selector list from installed private-state deployment or DApp registration artifacts, not from a hard-coded guess.
- Use the transaction `from` address as `resolved_l1_address`.
- Read `ChannelTokenVaultIdentityRegistered` and `ChannelTokenVaultIdentityExited` logs from the channel manager for `resolved_l1_address`.
- Build ordered participation epochs from those logs.
- Select the epoch whose active block range contains the submitted transaction block.
- Return the epoch's registered L2 address as `resolved_l2_address`.
- Return invalid when no matching participation epoch exists.
- Return invalid when the transaction was submitted through a different L1 account that is not itself a channel participant.

Useful ABI surface:

- `channelManager.executeChannelTransaction(payload, functionProof)`.
- `channelManager.getChannelTokenVaultRegistration(address)`.
- `channelManager.getChannelTokenVaultRegistrationByL2Address(address)`.
- `channelManager.getNoteReceivePubKeyByL2Address(address)`.
- `ChannelTokenVaultIdentityRegistered(l1Address, l2Address, channelTokenVaultKey, leafIndex, joinTollPaid, joinedAt, noteReceivePubKeyX, noteReceivePubKeyYParity)`.
- `ChannelTokenVaultIdentityExited(l1Address, leafIndex)`.

The worker-internal verifier result is JSON-shaped data:

```json
{ "valid": true, "resolvedL1Address": "0x...", "resolvedL2Address": "0x..." }
```

or:

```json
{ "valid": false, "reason": "transaction submitter is not a channel participant" }
```

## Payout Flow

1. Handle `Pending` applications that passed verification.
2. Before sending, recheck that the resolved L2 address has not already been paid.
3. Refresh the reward wallet notes with `private-state-cli wallet get-notes --wallet <reward-wallet> --network mainnet --json`.
4. Select input notes adaptively for a `25 TON` payout.
5. Send `25 TON` as a private-state `transfer notes` reward to the resolved L2 address.
6. Store `payout_tx_hash`, store `transferred_at`, and mark the row `Transferred`.
7. Refresh the reward wallet notes again and update `event_state`.
8. If payout fails, mark `Failed` with the reason so the operator can inspect it.

Idempotency is required. A retry must not create a second payout for the same resolved L2 address.

The worker must use the latest CLI command shape:

```bash
private-state-cli wallet get-notes \
  --wallet "$AIRDROP_REWARD_WALLET" \
  --network mainnet \
  --json
```

```bash
private-state-cli wallet transfer-notes \
  --wallet "$AIRDROP_REWARD_WALLET" \
  --network mainnet \
  --note-ids '["0x..."]' \
  --recipients '["0xRecipientL2"]' \
  --amounts '["25"]' \
  --acknowledge-action-impact \
  --tx-submitter account2 \
  --json
```

Use `account2` as both the reward wallet owner account and the L1 transaction submitter account. `account2` is imported from `~/user-secrets/account2.key`.

### Reward Note Selection

The payout script must select notes itself from `wallet get-notes --json`.

Selection policy:

- Prefer one exact `25 TON` unused note.
- If no exact `25 TON` note exists, prefer the smallest single unused note larger than `25 TON` and create a change note back to the reward wallet.
- If no single note is large enough, prefer the smallest two-note combination whose sum is at least `25 TON`.
- If a selected input sum is exactly `25 TON`, use a `1->1` or `2->1` transfer with one recipient and one amount: recipient L2 address gets `25`.
- If a selected input sum is greater than `25 TON`, use a `1->2` transfer when one input note is selected: recipient L2 address gets `25`, reward wallet L2 address gets change.
- If two selected input notes sum to more than `25 TON`, do not execute until the CLI supports a `2->2` transfer shape. The current CLI supports `1->1`, `1->2`, and `2->1`, so a two-input overpaying payout cannot safely preserve change.
- Mark the application `Failed` with a clear reason when no supported note selection exists.

The reward wallet is expected to start with roughly `100 TON` of remaining notes. The worker must not assume the full `5000 TON` budget is already present.

### Budget Synchronization

The source of truth for remaining budget is the reward wallet note state returned by:

```bash
private-state-cli wallet get-notes --wallet "$AIRDROP_REWARD_WALLET" --network mainnet --json
```

The worker must:

- Sum readable unused note values from `unusedNotes`.
- Store that sum in `event_state.remaining_budget_ton`.
- Store note count and last sync timestamp.
- Compute `transferred_count * 25` only as a consistency check.
- Record discrepancies in `event_state`; do not use that arithmetic to display remaining budget.

## Public UI

The public page uses one column with four sections in this exact order:

1. `How To Participate`
2. `Submit`
3. `Status`
4. `Winner Criteria`

### How To Participate

Explain:

- Event reward and rule.
- Ask your AI agents to install the latest version of `@tokamak-private-dapps/private-state-cli`.
- Ask your AI agents to join `the-great-first-channel`.
- Ask your AI agents to make one private-state `transfer notes` transaction on Tonnel.
- Ask your AI agents for the transaction hash.
- Submit the transaction hash with this form.
- That users must never share their Ethereum wallet private key or any secrets with others including us.
- That the transaction submitter must be a channel participant.
- That valid submissions are unlimited, but duplicate resolved L2 addresses or duplicate transaction hashes are not valid.

### Submit

Fields:

- Qualifying transaction hash.

The form should be plain and direct. Client-side validation can help, but the application API is authoritative.

### Status

Show all applications in a paginated table, with at most 10 rows per page.

Columns:

- Qualifying transaction hash.
- Tonnel channel address after verification.
- Current status.
- Submitted time in UTC.
- Payout transaction hash, if status is `Transferred`.

The hero budget card must show remaining budget from `event_state.remaining_budget_ton`. It must not compute remaining budget from `Transferred` rows.

### Winner Criteria

Explain:

- Submit the transaction hash from a real private-state `transfer notes` transaction made in Tonnel.
- The Ethereum wallet address that sent that transaction must have been joined to Tonnel when the transaction happened.
- The reward goes to the Tonnel channel address (L2 address) that was registered to that Ethereum wallet address at that time.
- A Tonnel channel address can receive only one reward. A transaction hash can also be used only once.
- A second transaction from the same Tonnel channel address will not receive another reward. The same transaction hash will not receive another reward, even if it is submitted with a different Tonnel channel address.

## Operator Tools

Keep this minimal:

- A local script to run verification, payout, and budget sync once.
- A local script to install or update the `launchd` schedule.
- A local script to print the latest worker summary and `event_state`.
- A documented database query for inspecting stuck `Pending`, `Duplication`, or `Failed` rows.

Do not build a large admin dashboard unless the first version proves it is needed.

### macOS Scheduling

Use `launchd` for twice-daily execution on the operator MacBook.

The repository should include:

- `scripts/worker.ts`: one-shot local worker entrypoint.
- `scripts/install-launch-agent.sh`: writes `~/Library/LaunchAgents/network.tokamak.tonnel-airdrop-worker.plist`.
- `scripts/uninstall-launch-agent.sh`: unloads and removes the launch agent.

The launch agent should run twice per day, for example at `09:00` and `21:00` local macOS time. Logs should go to a local ignored directory such as `logs/worker.stdout.log` and `logs/worker.stderr.log`.

## Required Safety Checks

These are not optional because they prevent loss of funds:

- Never store participant private keys.
- Keep payout credentials only in local operator machine secrets.
- Do not expose payout credentials to browser code.
- Never copy `~/user-secrets/account2.key` into the repository, database, logs, or launch agent plist.
- Use duplicate checks and payout idempotency for resolved L2 address and qualifying transaction hash.
- Do not pay unless verification passed.
- Do not pay if `payout_tx_hash` already exists for the resolved L2 address.
- Do not pay `Duplication` or `Failed` applications.
- Use `wallet get-notes` as the source of truth for available reward notes.
- Add a simple payout pause flag.
- Stop before payout when the reward wallet has less than `25 TON` in supported selectable notes.

## Known Risk

The event rule allows one person to drain the budget by creating many channel participation epochs, L2 accounts, and qualifying transactions. This is not a bug in the implementation; it is part of the requested rule.

Controls that do not change the rule:

- Total budget cap.
- Payout pause flag.
- Basic request rate limiting.

Controls that would change the rule and require explicit approval:

- One reward per EOA.
- One reward per IP.
- KYC.
- Manual approval.
- Social account verification.

## Remaining Implementation Steps

1. Add `event_state` migration and data access functions.
2. Change public budget rendering to read `event_state.remaining_budget_ton`.
3. Add local worker configuration for `mainnet`, `the-great-first-channel`, `account2`, `~/user-secrets/account2.key`, reward wallet, RPC URL, and DB path.
4. Add CLI setup helpers:
   - update global CLI to latest;
   - run `private-state-cli install`;
   - run `private-state-cli set rpc`;
   - import `account2` when missing.
5. Add RPC verification helpers:
   - load ABI and deployment artifacts from `~/tokamak-private-channels/dapps/private-state/chain-id-1`;
   - fetch submitted transaction and receipt;
   - decode `executeChannelTransaction`;
   - confirm transfer-notes function metadata;
   - reconstruct channel participation epochs from registration and exit logs;
   - resolve the matching L2 address.
6. Add reward note sync:
   - run `wallet get-notes --json`;
   - parse unused notes and note balance;
   - update `event_state`.
7. Add adaptive reward note selection:
   - exact `25 TON` note first;
   - smallest single larger note with change second;
   - exact two-note sum third;
   - unsupported selections fail explicitly.
8. Add payout execution with `wallet transfer-notes --acknowledge-action-impact --tx-submitter account2 --json`.
9. Add idempotency checks immediately before payout.
10. Add local worker summary logging.
11. Add macOS `launchd` install and uninstall scripts.
12. Test duplicate submission, invalid transaction, valid transaction, payout success, payout retry, insufficient notes, and budget sync.
13. Commit all repository changes.

## Decisions Required Before Coding

Implementation should not start until these are answered:

- How will the operator MacBook worker access the same production database used by the public application?
- What is the exact reward wallet name, or should the implementation derive it from `account2` and `the-great-first-channel`?
- Where should worker logs be written on the operator MacBook?
- What two local times should `launchd` use for the twice-daily worker runs?
- Should the worker mark payout failures as `Failed` immediately, or leave them `Pending` with a retry reason when the failure is operational, such as temporary RPC outage or stale CLI workspace?
- Should a `2->2` note-selection path be added later if the CLI adds support for it?

## Acceptance Criteria

- Users can read instructions, submit a transaction-hash claim, and check status.
- The public app stores each claim.
- New applications default to `Pending`.
- Successful payouts are labeled `Transferred`.
- Duplicate resolved L2 addresses or duplicate qualifying transactions are labeled `Duplication` and cannot create multiple payouts.
- Invalid transactions or other non-duplicate errors are labeled `Failed`.
- Valid submissions can receive exactly `25 TON`.
- Payout retry does not double-pay.
- The local worker updates the latest CLI before running.
- The local worker verifies submitted transactions through RPC, not through CLI.
- The local worker sends payouts through `private-state-cli wallet transfer-notes`.
- The local worker updates remaining budget from `private-state-cli wallet get-notes`.
- The event page displays remaining budget from `event_state`, not from `Transferred` count arithmetic.
- The local worker can be scheduled with macOS `launchd` twice per day.
- The implementation avoids unnecessary admin, campaign, and audit systems.
