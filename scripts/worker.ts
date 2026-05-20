import { loadLocalEnv } from "@/lib/load-env";

const usage = `Usage:
  npm run worker
  npm run worker -- --check
  npm run worker -- --help

Commands:
  --check   Validate local worker configuration without installing the CLI,
            verifying submissions, or sending payouts.
  --help    Print this message.
`;

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  loadLocalEnv();

  if (hasFlag("--help") || hasFlag("-h")) {
    console.log(usage);
    return;
  }

  if (hasFlag("--check")) {
    const { getConfig } = await import("@/lib/config");
    const config = getConfig();

    assertDatabaseConfigured();
    console.log(
      JSON.stringify(
        {
          database: process.env.DATABASE_URL ? "Postgres" : "SQLite",
          payoutsPaused: config.payoutsPaused,
          rpcConfigured: Boolean(config.rpcUrl),
          rpcConfigSource: config.rpcConfigSource,
          rewardWallet: config.rewardWallet ? "configured" : "derived",
        },
        null,
        2,
      ),
    );
    return;
  }

  assertDatabaseConfigured();

  const { runAirdropWorker } = await import("@/lib/worker");
  const summary = await runAirdropWorker();

  console.log(JSON.stringify(summary, null, 2));
}

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

function assertDatabaseConfigured(): void {
  if (!process.env.DATABASE_URL && process.env.AIRDROP_ALLOW_SQLITE_WORKER !== "true") {
    throw new Error(
      "DATABASE_URL is required for the local payout worker. Set AIRDROP_ALLOW_SQLITE_WORKER=true only for isolated local testing.",
    );
  }
}
