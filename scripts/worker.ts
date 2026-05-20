import { loadLocalEnv } from "@/lib/load-env";

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  loadLocalEnv();

  if (!process.env.DATABASE_URL && process.env.AIRDROP_ALLOW_SQLITE_WORKER !== "true") {
    throw new Error(
      "DATABASE_URL is required for the local payout worker. Set AIRDROP_ALLOW_SQLITE_WORKER=true only for isolated local testing.",
    );
  }

  const { runAirdropWorker } = await import("@/lib/worker");
  const summary = await runAirdropWorker();

  console.log(JSON.stringify(summary, null, 2));
}
