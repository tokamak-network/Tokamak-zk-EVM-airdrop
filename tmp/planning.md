# Tonigma Airdrop Domain and Brand Migration Plan

## Audience

This document is for the repository operator and developer responsible for updating the public airdrop application and executing the Vercel domain cutover.

## Goal

Move the public airdrop page from `https://airdrop.tonnel.io` to `https://airdrop.tonigma.network` and update the user-facing brand name from `Tonnel` to `Tonigma`.

The migration should preserve existing traffic, search visibility, crawler access, and submission functionality. Existing `airdrop.tonnel.io` links should continue to work through redirects during the transition.

## Scope

In scope:

- User-facing page copy.
- Public metadata, canonical URLs, Open Graph data, Twitter card data, JSON-LD, sitemap, robots, `llms.txt`, and IndexNow submission settings.
- Redirects from legacy domains to the new canonical domain.
- Public documentation that describes the airdrop page.
- Public visual assets that embed the old brand, old domain, or QR code.
- Vercel project domain assignment and DNS verification.

Out of scope unless explicitly approved:

- Database schema changes.
- Historical payout records.
- Existing exact failure reason strings stored or queried by the app.
- Local worker install paths, launchd labels, environment variable names, and runtime directory names.
- Vercel project renaming.
- Package renaming.
- Telegram channel migration.

## Current Findings

The linked Vercel project is `tonigma-airdrop` with project ID `prj_cXdkWqVZJ5kOkEGCapm65rJbA9KJ`. Its current domains include:

- `tonnel.io`
- `www.tonnel.io`
- `airdrop.tonnel.io`
- Vercel-generated project domains

`airdrop.tonigma.network` is the only Tonigma domain that should be assigned to this project.

The repository currently hard-codes `https://airdrop.tonnel.io` and `Tonnel` in user-facing UI, metadata, crawler files, docs, and an IndexNow script.

## Main Risk

Do not perform a blind repository-wide replacement from `Tonnel` to `Tonigma`.

Some `Tonnel` strings are part of internal operational behavior, tests, exact database reason matching, worker paths, or historical audit reports. Changing those together with the public brand can introduce avoidable regressions.

The first migration should update only public brand and public URL surfaces. Internal identifiers should remain stable unless a separate migration is approved.

## Repository Update Plan

1. Add shared public constants if the existing structure supports it.
   - Prefer `lib/site-content.ts` as the source for `siteUrl`, `siteTitle`, and public brand wording.
   - Avoid adding a new abstraction unless it reduces repeated domain literals.

2. Update the canonical site URL.
   - Change `siteUrl` from `https://airdrop.tonnel.io` to `https://airdrop.tonigma.network`.
   - Ensure `metadataBase`, Open Graph URL, JSON-LD URL, sitemap URLs, robots sitemap URL, and public FAQ link resolve from the new URL.

3. Update public UI copy.
   - Update hero brand text and headline from `Tonnel` / `TONNEL` to `Tonigma` / `TONIGMA`.
   - Update participation copy, eligibility guidance, duplicate guidance, and the copied LLM-agent prompt where the public brand or official page is shown.
   - Keep technical references to `the-great-first-channel` unchanged unless the underlying channel name changes.

4. Update public crawler and AI discovery files.
   - Update `public/llms.txt` to use the new public domain and Tonigma brand.
   - Keep crawler policy semantics unchanged.

5. Update redirects.
   - Change existing redirects in `next.config.ts`, `vercel.json`, and `proxy.ts` so `tonnel.io`, `www.tonnel.io`, and `airdrop.tonnel.io` redirect to `https://airdrop.tonigma.network/:path*`.
   - Keep the redirect permanent only after the new domain is verified and serving production correctly.
   - Do not assign or route `tonigma.network` or `www.tonigma.network` through this airdrop project.

6. Update IndexNow.
   - Change `scripts/submit-indexnow.mjs` host from `airdrop.tonnel.io` to `airdrop.tonigma.network`.
   - Ensure the existing key file is reachable at `https://airdrop.tonigma.network/acc6167f5ad091cd2414f1e84a5bddab.txt` after deployment.

7. Update public documentation.
   - Update `README.md` for the new public brand and page URL.
   - Do not rewrite historical audit docs unless the user explicitly asks for historical docs to be rebranded.

8. Update visual assets.
   - Regenerate or edit public poster and QR assets that include the old brand or `airdrop.tonnel.io`.
   - Candidate files:
     - `public/tonigma-airdrop-poster.jpg`
     - `poster/tonigma-airdrop-poster-v2.png`
     - `poster/tonigma-airdrop-poster-tokamak-logo.png`
     - `poster/airdrop-tonigma-network-qr.png`
   - Rename public asset paths from `tonnel` to `tonigma` and update all references so public metadata does not expose the old brand in asset URLs.

9. Leave internal operational names unchanged in the first migration.
   - Keep local worker paths such as `TonnelAirdrop`.
   - Keep env var prefixes such as `TONNEL_AIRDROP_*`.
   - Keep exact eligibility reason strings unless a DB/test migration is planned.
- Keep `package.json` name and Vercel project name unless the operator approves a broader rename.
   - Keep `package.json` name unless a separate package/runtime rename is approved.

## Vercel Domain Cutover Plan

1. Add `airdrop.tonigma.network` to the existing Vercel project.
   - Use the project Domains settings or Vercel CLI.
   - Since this is a subdomain, Vercel normally expects a CNAME record to the target shown in the dashboard.
   - Follow Vercel's current domain setup instructions: `https://vercel.com/docs/domains/set-up-custom-domain`.

2. Configure DNS.
   - If `tonigma.network` uses Vercel DNS, add the required DNS record in Vercel.
   - If it uses an external DNS provider, add the record there and then re-check in Vercel.
   - Do not switch canonical app metadata until Vercel reports the new domain is configured and certificate issuance is complete.

3. Deploy a preview or production candidate containing the repository changes.
   - Verify the app loads through the generated Vercel deployment URL before relying on the custom domain.

4. Promote the deployment to production after validation.
   - Verify `https://airdrop.tonigma.network/`.
   - Verify `https://airdrop.tonigma.network/status`.
   - Verify `https://airdrop.tonigma.network/robots.txt`.
   - Verify `https://airdrop.tonigma.network/sitemap.xml`.
   - Verify `https://airdrop.tonigma.network/llms.txt`.

5. Keep old domains assigned to the project.
   - `https://airdrop.tonnel.io/*` should redirect to `https://airdrop.tonigma.network/*`.
   - `https://tonnel.io/*` and `https://www.tonnel.io/*` should redirect to the new canonical host if those domains remain attached to this project.
   - Keep the legacy airdrop-domain redirect active until the old domain expires on May 21, 2027.

6. Submit the new URLs for indexing.
   - Run the updated IndexNow script after production deployment.
   - Confirm the submitted URL list uses the new host.

## Validation Checklist

Run locally before deployment:

- `npm run typecheck`
- `npm test`
- `npm run build`

Check string drift:

- Search for `airdrop.tonnel.io` and confirm only intentional legacy redirect references remain.
- Search for `Tonnel` and classify remaining matches as either intentional internal terminology or missed public copy.
- Search for `TONNEL` and confirm no public headline or metadata still uses it unintentionally.

Check deployed behavior:

- `curl -I https://airdrop.tonigma.network/` returns a successful response.
- `curl -I https://airdrop.tonigma.network/status` returns a successful response.
- `curl -I https://airdrop.tonnel.io/` redirects to `https://airdrop.tonigma.network/`.
- `curl -I https://airdrop.tonnel.io/status` redirects to `https://airdrop.tonigma.network/status`.
- `/api/` remains disallowed in `robots.txt`.
- The submission form still validates and submits through the same API routes.
- Operator routes still require the same auth.
- Vercel Analytics and runtime logs show no unexpected runtime errors.

## Rollback Plan

1. If the new domain fails DNS or TLS validation, keep the current production deployment and old canonical domain unchanged.
2. If the deployed app fails after the code change, roll back to the previous Vercel production deployment.
3. If redirects are wrong, fix redirect configuration first because permanent redirects can be cached by browsers and crawlers.
4. Keep the legacy airdrop-domain redirect active until the old domain expires on May 21, 2027, unless a separate decision changes the retention policy.

## Confirmed Decisions

- Only `airdrop.tonigma.network` is in scope for this airdrop project. Do not change `tonigma.network` or `www.tonigma.network` from this repository.
- The Telegram link changes to `https://t.me/tonigma_network`.
- Public poster and QR assets are replaced and renamed to Tonigma-based filenames.
- Only public documentation is rebranded to Tonigma. Historical audit documents and internal implementation notes keep their original wording unless separately requested.
- The Vercel project has been renamed to `tonigma-airdrop`.
- The legacy airdrop-domain redirect remains active until the old domain expires on May 21, 2027.
