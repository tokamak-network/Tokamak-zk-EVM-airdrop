# Public Airdrop Implementation Plan

## Goal

Rebuild this repository as a simple public airdrop application for Tonnel.

Tonnel is the public brand name for `the-great-first-channel`, one of the Tokamak Private App Channels. Tokamak private-state is the dApp running in that channel.

The event rewards `25 TON` per valid submission when the server verifies one valid Tokamak private-state `transfer notes` transaction generated in `the-great-first-channel`. KYC is not required. The same person may claim multiple times by creating multiple valid submissions. Duplicate L2 addresses or duplicate qualifying transaction hashes are not valid submissions.

This document is the pre-implementation plan. It intentionally avoids a large admin system, complex event configuration, or extra audit tables unless they become necessary.

## Scope

Build only what is needed for the first public event:

- A public instruction page.
- A submission form for L2 address and qualifying transaction hash.
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
- Duplicate prevention: the same L2 address or the same qualifying transaction hash must not receive multiple payouts.
- Submission status labels: `Pending`, `Transferred`, `Duplication`, `Failed`.
- No KYC.
- Multiple L2 accounts controlled by the same person are allowed.

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
- `l2_address`: submitted recipient L2 account.
- `qualifying_tx_hash`: submitted `transfer notes` transaction hash.
- `status`: `Pending`, `Transferred`, `Duplication`, `Failed`.
- `reason`: failure reason for `Duplication` or `Failed`.
- `payout_tx_hash`: reward transaction hash for `Transferred`.
- `created_at`, `updated_at`.

Status meanings:

- `Pending`: default status for a newly submitted application. It also covers applications waiting for verification or payout.
- `Transferred`: reward transfer succeeded.
- `Duplication`: application failed because the L2 address or qualifying transaction hash was already submitted.
- `Failed`: application failed for any non-duplication reason.

Duplicate detection must prevent multiple payouts for the same L2 address or qualifying transaction hash. Duplicate submissions are still stored, but their status is `Duplication` and they are never eligible for payout.

## Submission Flow

1. User reads the guide.
2. User submits:
   - L2 address.
   - Qualifying `transfer notes` transaction hash.
3. Server validates basic formats.
4. Server checks whether the L2 address or transaction hash was already submitted.
5. Server stores the application with default status `Pending` if it is not duplicated.
6. Server stores the application with status `Duplication` if it is duplicated.

The website must never ask users to submit private keys.

## Verification Flow

The verifier checks only the facts needed for eligibility:

1. Load `Pending` applications.
2. Fetch the submitted private-state transaction from the authoritative source.
3. Confirm it is a `transfer notes` transaction.
4. Confirm it belongs to `the-great-first-channel`.
5. Confirm the submitted L2 address is the account that satisfies the event rule.
6. Keep valid applications as `Pending` and pass them to the payout step.
7. Mark invalid applications as `Failed`.

The exact verification method must be confirmed before implementation:

- Preferred: programmatic API from `@tokamak-private-dapps/private-state-cli`, if available.
- Acceptable: a stable private-state RPC or indexer.
- Last resort: call the CLI from the server with a pinned version and strict timeout.

## Payout Flow

1. Handle `Pending` applications that passed verification.
2. Before sending, recheck that the L2 address has not already been paid.
3. Send `25 TON` as a private-state `transfer notes` reward to the submitted L2 address.
4. Store `payout_tx_hash` and mark the row `Transferred`.
5. If payout fails, mark `Failed` with the reason so the operator can inspect it.

Idempotency is required. A retry must not create a second payout for the same L2 address.

## Public UI

### Guide Page

Explain:

- Event reward and rule.
- Required channel: Tonnel, backed by `the-great-first-channel`.
- Required package: `@tokamak-private-dapps/private-state-cli`.
- How to generate a qualifying `transfer notes` transaction.
- How to find the L2 address and transaction hash.
- That private keys must not be submitted to the website.
- That valid submissions are unlimited, but duplicate L2 addresses or duplicate transaction hashes are not valid.
- That multiple L2 accounts are allowed.

### Submission Form

Fields:

- L2 address.
- Qualifying transaction hash.

The form should be plain and direct. Client-side validation can help, but the server is authoritative.

### Status Page

Allow lookup by L2 address or application ID and show:

- Current status.
- Rejection or failure reason, if any.
- Payout transaction hash, if status is `Transferred`.

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
- Use duplicate checks and payout idempotency for L2 address and qualifying transaction hash.
- Do not pay unless verification passed.
- Do not pay if `payout_tx_hash` already exists for the L2 address.
- Do not pay `Duplication` or `Failed` applications.
- Keep a total budget limit in configuration or environment variables.
- Add a simple payout pause flag.

## Known Risk

The event rule allows one person to drain the budget by creating many L2 accounts and qualifying transactions. This is not a bug in the implementation; it is part of the requested rule.

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
- What exact API or CLI command verifies a private-state `transfer notes` transaction?
- What exact transaction field proves `the-great-first-channel` membership?
- Does the submitted L2 address need to be the sender of the qualifying transfer?
- What is the total TON budget?
- Should payout run manually first, or should it be scheduled from day one?
- What funded account will send rewards, and how will its secret be provided to the server?

## Acceptance Criteria

- Users can read instructions, submit a claim, and check status.
- The server stores each claim.
- New applications default to `Pending`.
- Successful payouts are labeled `Transferred`.
- Duplicate L2 addresses or duplicate qualifying transactions are labeled `Duplication` and cannot create multiple payouts.
- Invalid transactions or other non-duplicate errors are labeled `Failed`.
- Valid submissions can receive exactly `25 TON`.
- Payout retry does not double-pay.
- The implementation avoids unnecessary admin, campaign, and audit systems.
