import { migrate, usingPostgres } from "@/lib/db";

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});

async function main() {
  await migrate();
  console.log(
    `Airdrop database is ready (${usingPostgres() ? "Postgres" : "SQLite"}).`,
  );
}
