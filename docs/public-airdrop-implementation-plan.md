# Public Airdrop Implementation Plan

## Goal

Rebuild this repository as a simple public airdrop application for Tonnel.

Tonnel is the public brand name for `the-great-first-channel`, one of the Tokamak Private App Channels. Tokamak private-state is the dApp running in that channel.

The event rewards `25 TON` per valid submission when the server verifies one valid Tokamak private-state `transfer notes` transaction generated in `the-great-first-channel` by an L1 address that was participating in the channel at the transaction block. KYC is not required. Participants submit only the qualifying transaction hash. The server resolves the L1 transaction submitter, finds the L2 address registered by that L1 address for the channel participation epoch containing the transaction, and sends the reward to that resolved L2 address. Duplicate resolved L2 addresses or duplicate qualifying transaction hashes are not valid submissions.

This document is the pre-implementation plan. It intentionally avoids a large admin system, complex event configuration, or extra audit tables unless they become necessary.

## Scope

Build only what is needed for the first public event:

- A public instruction page.
- A submission form for a qualifying transaction hash.
- A server API that saves submissions.
- A verification job that checks the submitted transaction.
- A payout job that sends `25 TON` per valid submission after verification.
- A status page that shows submission and payout state.
- A minimal operator-only way to inspect records and rerun failed jobs.

Do not build generalized campaign management, KYC, social verification, manual approval workflows, or a full admin dashboard in the first version.

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

Use a single Next.js app unless implementation later proves that another stack is clearly simpler.

Components:

- Public pages: event guide, submission form, status lookup.
- API routes: create submission, get status.
- Database: one primary table for submissions.
- Worker script or protected API route: verify `Pending` submissions and transfer eligible rewards.

The worker can be run manually at first. A scheduler can be added later only if manual operation becomes inconvenient.

## Minimal Data Model

Start with one table: `applications`.

Fields:

- `id`: internal UUID.
- `qualifying_tx_hash`: submitted `transfer notes` transaction hash.
- `resolved_l1_address`: L1 transaction submitter resolved during verification.
- `resolved_l2_address`: L2 address registered by the resolved L1 address for the channel participation epoch containing the submitted transaction.
- `status`: `Pending`, `Transferred`, `Duplication`, `Failed`.
- `reason`: failure reason for `Duplication` or `Failed`.
- `payout_tx_hash`: reward transaction hash for `Transferred`.
- `created_at`, `updated_at`.

Status meanings:

- `Pending`: default status for a newly submitted application. It also covers applications waiting for verification or payout.
- `Transferred`: reward transfer succeeded.
- `Duplication`: application failed because the resolved L2 address or qualifying transaction hash was already used.
- `Failed`: application failed for any non-duplication reason.

Duplicate detection must prevent multiple payouts for the same resolved L2 address or qualifying transaction hash. Duplicate submissions are still stored, but their status is `Duplication` and they are never eligible for payout. A duplicate transaction hash can be detected at submission time. Duplicate resolved L2 addresses are detected after verification, because the participant no longer submits an L2 address.

## Submission Flow

1. User reads the guide.
2. User submits:
   - Qualifying `transfer notes` transaction hash.
3. Server validates basic formats.
4. Server checks whether the transaction hash was already submitted.
5. Server stores the application with default status `Pending` if the transaction hash is not duplicated.
6. Server stores the application with status `Duplication` if the transaction hash is duplicated.

The website must never ask users to submit private keys.

## Verification Flow

The verifier checks only the facts needed for eligibility:

1. Load `Pending` applications.
2. Fetch the submitted private-state transaction from the authoritative source.
3. Confirm it is a `transfer notes` transaction.
4. Confirm it belongs to `the-great-first-channel`.
5. Resolve the L1 address that submitted the transaction.
6. Confirm that this L1 address was a participant in `the-great-first-channel` at the submitted transaction block.
7. Resolve the L2 address registered by that L1 address for the participation epoch containing the submitted transaction block.
8. Store `resolved_l1_address`, store `resolved_l2_address`, keep valid applications as `Pending`, and pass them to the payout step.
9. Mark invalid applications as `Failed`.

The verification command must perform these concrete checks:

- Fetch the L1 transaction and receipt by `qualifying_tx_hash`.
- Confirm the transaction called the channel manager for `the-great-first-channel`.
- Confirm the accepted private-state function is a supported `transfer notes` entrypoint.
- Use the transaction `from` address as `resolved_l1_address`.
- Read channel participation records for `resolved_l1_address`.
- Select the registration epoch whose active block range contains the submitted transaction block.
- Return the epoch's registered L2 address as `resolved_l2_address`.
- Return invalid when no matching participation epoch exists.
- Return invalid when the transaction was submitted through a different L1 account that is not itself a channel participant.

The verifier stdout contract is JSON:

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
3. Send `25 TON` as a private-state `transfer notes` reward to the resolved L2 address.
4. Store `payout_tx_hash` and mark the row `Transferred`.
5. If payout fails, mark `Failed` with the reason so the operator can inspect it.

Idempotency is required. A retry must not create a second payout for the same resolved L2 address.

## Public UI

The public page uses one column with four sections in this exact order:

1. `How To Participate`
2. `Submit`
3. `Status`
4. `Winner Criteria`

### How To Participate

Explain:

- Event reward and rule.
- Ask your AI agents to install the latest version of the NPM package `@tokamak-private-dapps/private-state-cli`.
- Ask your AI agents to join the channel `the-great-first-channel`.
- Ask your AI agents to create one private-state `transfer notes` transaction in Tonnel.
- Ask your AI agents to provide the transaction hash.
- Submit the transaction hash with this form.
- That users must never share their EOA private key, seed phrase, or RPC secret with others including us.
- That the transaction submitter must be a channel participant.
- That valid submissions are unlimited, but duplicate resolved L2 addresses or duplicate transaction hashes are not valid.

### Submit

Fields:

- Qualifying transaction hash.

The form should be plain and direct. Client-side validation can help, but the server is authoritative.

### Status

Allow lookup by transaction hash, resolved address, or application ID and show:

- Current status.
- Rejection or failure reason, if any.
- Resolved L1 submitter and reward L2 address after verification.
- Payout transaction hash, if status is `Transferred`.

### Winner Criteria

Explain:

- Submit the transaction hash from a real private-state `transfer notes` transaction made in Tonnel.
- The Ethereum wallet address that sent that transaction must have been joined to Tonnel when the transaction happened.
- The reward goes to the Tonnel channel address (L2 address) that was registered to that Ethereum wallet address at that time.
- A Tonnel channel address can receive only one reward. A transaction hash can also be used only once.
- A second transaction from the same Tonnel channel address will not receive another reward. The same transaction hash will not receive another reward, even if it is submitted with a different Tonnel channel address.

## Operator Tools

Keep this minimal:

- A script or protected route to run verification.
- A script or protected route to run payouts.
- A basic record list, or a documented database query, for checking status.

Do not build a large admin dashboard unless the first version proves it is needed.

## Required Safety Checks

These are not optional because they prevent loss of funds:

- Never store participant private keys.
- Keep payout credentials only in server-side secrets.
- Do not expose payout credentials to browser code.
- Use duplicate checks and payout idempotency for resolved L2 address and qualifying transaction hash.
- Do not pay unless verification passed.
- Do not pay if `payout_tx_hash` already exists for the resolved L2 address.
- Do not pay `Duplication` or `Failed` applications.
- Keep a total budget limit in configuration or environment variables.
- Add a simple payout pause flag.

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

## Implementation Steps

1. Confirm the unresolved decisions below.
2. Reset the repository contents for the new app.
3. Scaffold the simple Next.js app.
4. Add the database and `applications` table.
5. Build the guide, form, status page, and API routes.
6. Implement the verifier.
7. Implement the payout job with idempotency.
8. Add minimal operator commands.
9. Test duplicate submission, invalid transaction, valid transaction, payout success, and payout retry.
10. Commit all repository changes.

## Decisions Required Before Coding

Implementation should not start until these are answered:

- What database should be used?
- Where will the app run?
- What exact API or CLI command verifies a private-state `transfer notes` transaction and returns the transaction submitter's channel participation epoch?
- What exact transaction field proves `the-great-first-channel` membership?
- What is the total TON budget?
- Should payout run manually first, or should it be scheduled from day one?
- What funded account will send rewards, and how will its secret be provided to the server?

## Acceptance Criteria

- Users can read instructions, submit a transaction-hash claim, and check status.
- The server stores each claim.
- New applications default to `Pending`.
- Successful payouts are labeled `Transferred`.
- Duplicate resolved L2 addresses or duplicate qualifying transactions are labeled `Duplication` and cannot create multiple payouts.
- Invalid transactions or other non-duplicate errors are labeled `Failed`.
- Valid submissions can receive exactly `25 TON`.
- Payout retry does not double-pay.
- The implementation avoids unnecessary admin, campaign, and audit systems.
