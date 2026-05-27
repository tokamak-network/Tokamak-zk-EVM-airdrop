# AI Search and Crawl Improvement TODO

This list excludes items that are already implemented in this repository, such as the FAQ UI, `/llms.txt`, sitemap, AI crawler allow rules, canonical metadata, Open Graph/Twitter metadata, baseline JSON-LD, README overview, and landing-page participation content.

## Remaining Actions

1. Tighten `robots.txt` scope.
   - Keep public landing content crawlable.
   - Disallow operational and data endpoints such as `/api/*` and `/api/operator/*`.
   - Decide whether `/status` should remain indexable or become `noindex`.

2. Add `FAQPage` JSON-LD.
   - Reuse the existing on-page FAQ content.
   - Keep the structured data synchronized with the visible FAQ.

3. Submit the site to webmaster tools.
   - Register `https://airdrop.tonnel.io` in Google Search Console.
   - Register the site in Bing Webmaster Tools.
   - Submit `https://airdrop.tonnel.io/sitemap.xml`.

4. Add IndexNow support.
   - Add an IndexNow key file at the public root.
   - Add a script or deployment hook to notify supported search engines when public URLs change.

5. Strengthen official external links.
   - Link `https://airdrop.tonnel.io` from official Tokamak/Tonnel pages, docs, announcements, and social channels.
   - Prefer stable, descriptive anchor text that names Tonnel and the TON airdrop.

6. Verify crawler access in logs.
   - Check whether `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `CCBot`, and search crawlers can fetch public pages.
   - Confirm Vercel, DNS, or bot protection layers do not block allowed crawlers.

7. Confirm server-rendered visibility.
   - Inspect raw HTML from `curl` to verify the key campaign description and FAQ are visible without client-side interaction.
   - If needed, move core explanatory content or FAQ markup into a Server Component.

8. Define status page indexing policy.
   - If the campaign should expose only landing content to search and AI crawlers, mark `/status` as `noindex`.
   - If `/status` remains indexable, ensure it does not expose operational or privacy-sensitive details.
