import { runAirdropWorker } from "@/lib/worker";

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  const summary = await runAirdropWorker();
  console.log(JSON.stringify(summary, null, 2));
}
