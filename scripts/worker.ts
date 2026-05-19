import { loadLocalEnv } from "@/lib/load-env";

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  loadLocalEnv();
  const { runAirdropWorker } = await import("@/lib/worker");
  const summary = await runAirdropWorker();

  console.log(JSON.stringify(summary, null, 2));
}
