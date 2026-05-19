# Public Airdrop Implementation Plan

## Purpose

This document defines the implementation plan for rebuilding this repository as a public Tokamak private-state airdrop application.

The new event rewards a participant with `25 TON` after the participant submits an L2 account and a valid `transfer notes` transaction generated in `the-great-first-channel`. KYC is not part of the event. Rewards are limited to one payment per L2 account, but the event intentionally allows the same person to create additional L2 accounts and receive additional rewards if each account submits a distinct valid transaction.

This plan is intentionally written before implementation. Existing repository content is considered archived elsewhere and can be removed during the rebuild only after the implementation scope is confirmed.

## Requirements Coverage Check

The plan covers the requested product requirements:

- A public guide page for the new airdrop event.
- A participant submission form.
- Server-side persistence of submitted applications.
- Server-side verification of L2 account validity, `transfer notes` transaction authenticity, channel membership context, and duplicate claims.
- Automated `25 TON` private-state reward transfer to eligible L2 accounts.
- Public or admin-readable submission and payout status views.
- A rebuild path that starts from a cleaned repository.

The plan also records the decisions that must be confirmed before implementation because they affect security, treasury custody, and abuse handling.

## Explicit Event Rules

- Channel: `the-great-first-channel`.
- Qualifying action: one valid `transfer notes` transaction generated in the channel.
- Reward amount: `25 TON` per approved L2 account.
- Claim limit: one reward per L2 account.
- Identity policy: no KYC.
- Sybil policy: multiple accounts controlled by the same person are allowed if each L2 account has its own qualifying transaction.
- Submission policy: duplicate submissions for the same L2 account or same qualifying transaction must not create additional payouts.

## Proposed Architecture

Use a small full-stack web application with four main parts:

- Public web UI: event guide, participation instructions, submission form, and status lookup.
- Admin/status UI: review queue, verification state, payout state, failure reasons, and aggregate reward statistics.
- API server: receives applications, validates input, stores records, exposes status, and schedules verification/payout work.
- Background worker: verifies private-state data, deduplicates claims, and submits reward `transfer notes` transactions.

The default implementation should remain a Next.js application unless the repository reset reveals a better established stack. Next.js App Router can serve the public UI, API routes, and admin views from a single deployable service. The payout worker should be implemented as an explicit server-side job rather than hidden inside a user-facing request path.

## Data Model

Minimum tables:

### `applications`

- `id`: internal UUID.
- `l2_address`: submitted recipient L2 account.
- `qualifying_tx_hash`: submitted `transfer notes` transaction identifier.
- `channel_name`: expected to be `the-great-first-channel`.
- `status`: `submitted`, `verifying`, `approved`, `rejected`, `paying`, `paid`, `payout_failed`.
- `rejection_reason`: normalized reason for rejected submissions.
- `payout_failure_reason`: last payout error, if any.
- `payout_tx_hash`: reward `transfer notes` transaction identifier.
- `created_at`, `updated_at`.

Constraints:

- Unique `l2_address` for paid or payable applications.
- Unique `qualifying_tx_hash` for paid or payable applications.
- Case-normalized or canonicalized L2 address storage, depending on the private-state address format.

### `verification_attempts`

- `id`.
- `application_id`.
- `status`.
- `details`.
- `created_at`.

This keeps an audit trail when verification fails because of RPC errors, indexer lag, malformed submissions, or invalid transactions.

### `payout_attempts`

- `id`.
- `application_id`.
- `status`.
- `reward_amount`.
- `payout_tx_hash`.
- `error_message`.
- `created_at`.

This prevents silent double payments and supports retry decisions.

### `event_config`

- `channel_name`.
- `reward_amount`.
- `max_total_budget`.
- `starts_at`, `ends_at`.
- `submissions_enabled`.
- `payouts_enabled`.

The initial implementation can store this in environment variables if the event parameters are fixed, but a table is safer if admins need to pause payouts without redeploying.

## Verification Flow

1. Receive a submission with L2 address and qualifying transaction reference.
2. Normalize and validate the address and transaction reference format.
3. Check duplicate L2 address and duplicate qualifying transaction constraints.
4. Fetch the qualifying transaction from the private-state source of truth.
5. Verify that the transaction is a `transfer notes` transaction.
6. Verify that the transaction belongs to `the-great-first-channel`.
7. Verify that the submitted L2 address is the sender or otherwise satisfies the intended participant relationship.
8. Mark the application `approved` only after every deterministic check passes.
9. Mark invalid submissions `rejected` with a stable reason.
10. Mark inconclusive checks as retryable verification failures instead of rejecting immediately.

The exact data source for steps 4-7 must be confirmed. Preferred order:

- Official `@tokamak-private-dapps/private-state-cli` library or exported SDK APIs, if programmatic APIs exist.
- A maintained private-state indexer or RPC API, if available.
- A controlled CLI wrapper as a last resort, with strict timeout, output parsing, and version pinning.

## Payout Flow

1. Select approved applications that have no successful payout.
2. Recheck duplicate constraints immediately before payment.
3. Confirm `payouts_enabled` and remaining budget.
4. Use a server-held funded payout account to create a `25 TON` `transfer notes` reward to the submitted L2 account.
5. Store the payout transaction hash before or atomically with marking the application as `paid`.
6. Treat unknown transaction submission results as pending or retryable, not as safe-to-repeat, until chain/private-state status is resolved.
7. Expose payout status in the participant/admin views.

Payment idempotency is mandatory. A retry must never create a second reward for the same L2 address.

## Public Pages

### Event Guide

Content should explain:

- What the event rewards.
- Required package: `@tokamak-private-dapps/private-state-cli`.
- Required channel: `the-great-first-channel`.
- How to generate a qualifying `transfer notes` transaction.
- How to find the participant's L2 address and qualifying transaction reference.
- Reward amount and one-payment-per-L2-account rule.
- No-KYC policy and the explicit allowance of multiple L2 accounts.
- Required participant materials: EOA private key, RPC URL, channel fee, and local CLI environment.

All user-facing instructions should avoid asking users to paste private keys into the website. Private keys should only be used locally with their own LLM or terminal environment.

### Submission Form

Fields:

- L2 address.
- Qualifying `transfer notes` transaction hash or reference.
- Optional contact handle for support.
- Required acknowledgment that no private key should be submitted.

The form should provide immediate client-side format feedback, but server-side validation is authoritative.

### Status View

Participants should be able to query by L2 address or application ID and see:

- Submitted.
- Verifying.
- Approved.
- Rejected with reason.
- Paying.
- Paid with payout transaction hash.
- Payout failed or pending retry.

## Admin Views

Admin pages should include:

- Submission table with filters by status.
- Application detail with verification attempts and payout attempts.
- Manual retry controls for verification and payout.
- Global event controls for pausing submissions and pausing payouts.
- Aggregate counters: submitted, approved, rejected, paid, failed, total TON paid, remaining budget.

Admin authentication must be implemented before any write-capable admin controls are exposed.

## Security and Operational Requirements

- Never store participant private keys.
- Store payout private keys only in server-side secrets or a managed key service.
- Do not expose payout credentials to browser code.
- Add rate limits to submission and status endpoints.
- Add structured logs for verification and payout jobs.
- Add idempotency for every payout operation.
- Keep `submissions_enabled` and `payouts_enabled` as separate controls.
- Treat CLI or RPC timeouts as retryable infrastructure failures.
- Pin the private-state CLI or SDK version for reproducible verification.
- Use a database transaction for state changes that affect payout eligibility.
- Keep all code comments and documentation in English.

## Abuse and Product Risks

The requested no-KYC and multi-account policy means the event can be drained by one actor who automates L2 account creation and qualifying transfers. This is allowed by the stated rule, but the UI and admin dashboard should make the policy visible and should expose budget exhaustion clearly.

Recommended controls that do not contradict the stated rule:

- Total event budget cap.
- Event start and end timestamps.
- Payout pause switch.
- Per-IP submission rate limits.
- Queue-based payout throughput limits.
- Public remaining budget display.

Controls that would change the stated rule and require explicit approval before implementation:

- One reward per EOA.
- One reward per IP, device, social account, or contact handle.
- KYC or sanctions screening.
- Manual approval gates.
- Minimum account age or minimum transfer amount.

## Repository Rebuild Plan

1. Confirm the implementation decisions listed below.
2. Remove archived application code from the working branch while keeping repository metadata and any explicitly retained files.
3. Scaffold the selected web stack.
4. Add database schema and migrations.
5. Implement event configuration and environment validation.
6. Implement participant submission APIs and persistence.
7. Implement verification service with deterministic tests.
8. Implement payout service with idempotency tests and dry-run mode.
9. Implement public guide, form, and status pages.
10. Implement authenticated admin dashboard.
11. Add operational scripts for worker execution, retries, and event pause/resume.
12. Run lint, typecheck, unit tests, and a local end-to-end submission flow.
13. Commit all repository changes after verification.

## Implementation Phases

### Phase 1: Foundation

- Reset the app structure.
- Choose and configure the database.
- Add environment validation.
- Add shared event constants and types.
- Add basic UI shell.

### Phase 2: Submissions

- Build public form.
- Implement application create API.
- Implement duplicate detection.
- Add status lookup API and page.

### Phase 3: Verification

- Integrate with the confirmed private-state data source.
- Verify transaction type, channel, participant address, and duplicate constraints.
- Persist verification attempts.
- Add tests for valid, invalid, duplicate, and retryable cases.

### Phase 4: Payouts

- Integrate the funded payout account.
- Implement idempotent payout worker.
- Persist payout attempts.
- Add dry-run mode.
- Add tests for retry, duplicate prevention, and budget exhaustion.

### Phase 5: Admin and Operations

- Add admin authentication.
- Add dashboard views.
- Add retry and pause controls.
- Add deployment documentation.
- Run end-to-end verification before launch.

## Decisions Required Before Implementation

Implementation should not start until these are answered:

- What database should be used for production: Postgres, SQLite for a single host, or another managed database?
- Where will the app be deployed?
- What is the authoritative API or CLI command for verifying private-state `transfer notes` transactions?
- What exact transaction field proves membership in `the-great-first-channel`?
- Is the submitted L2 address required to be the transfer sender, the transfer recipient, or simply an account that generated the transaction?
- What is the total reward budget?
- Should applications remain visible publicly, or should public status require an application ID to avoid easy scraping?
- What authentication method should protect admin pages?
- Should payouts run automatically on approval, on a schedule, or by manual admin trigger?
- What funded account will perform reward transfers, and how will its secret be managed?

## Acceptance Criteria

The implementation is complete only when:

- A participant can read instructions, submit an L2 address and qualifying transaction, and view status.
- The server persists every submission.
- Invalid or duplicate submissions cannot trigger payouts.
- A valid first submission for an L2 account can receive exactly `25 TON`.
- Payout retries are idempotent.
- Admins can inspect submissions, verification attempts, and payout attempts.
- Submissions and payouts can be paused independently.
- Tests cover duplicate prevention, verification outcomes, and payout retry behavior.
- The final commit includes all repository changes present at completion.
