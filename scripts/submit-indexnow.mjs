#!/usr/bin/env node

const host = "airdrop.tonnel.io";
const key = "acc6167f5ad091cd2414f1e84a5bddab";
const keyLocation = `https://${host}/${key}.txt`;
const endpoint = "https://api.indexnow.org/indexnow";
const urls = [`https://${host}/`, `https://${host}/status`];

const response = await fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    host,
    key,
    keyLocation,
    urlList: urls,
  }),
});

if (!response.ok) {
  const body = await response.text();

  throw new Error(
    `IndexNow submission failed with ${response.status}: ${body}`,
  );
}

console.log(`Submitted ${urls.length} URLs to IndexNow.`);
