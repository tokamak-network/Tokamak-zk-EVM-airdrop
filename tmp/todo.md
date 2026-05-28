# AI Search and Crawl Improvement TODO

This list excludes items that are already implemented in this repository, such as the FAQ UI, `/llms.txt`, sitemap, AI crawler allow rules, canonical metadata, Open Graph/Twitter metadata, baseline JSON-LD, README overview, and landing-page participation content.

## Remaining Actions

1. Submit the site to webmaster tools.
   - Register `tonnel.io` as a domain property in Google Search Console so all protocols and subdomains, including `airdrop.tonnel.io`, `www.tonnel.io`, and future `*.tonnel.io` hosts, are covered.
   - Register or import the `tonnel.io` domain property in Bing Webmaster Tools.
   - Submit `https://airdrop.tonnel.io/sitemap.xml`.

2. Strengthen official external links.
   - Link `https://airdrop.tonnel.io` from official Tokamak/Tonnel pages, docs, announcements, and social channels.
   - Prefer stable, descriptive anchor text that names Tonnel and the TON airdrop.

3. Verify crawler access in logs.
   - Check whether `GPTBot`, `OAI-SearchBot`, `ClaudeBot`, `PerplexityBot`, `CCBot`, and search crawlers can fetch public pages.
   - Confirm Vercel, DNS, or bot protection layers do not block allowed crawlers.
