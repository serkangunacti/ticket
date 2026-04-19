import { closeDb, ensureDatabaseReady } from "@/lib/db";
import { listSupportAgents, listTenants, listTickets } from "@/lib/data";
import { env, hasDatabase } from "@/lib/env";

function getMissingEnvVars() {
  const requiredKeys = [
    "DATABASE_URL",
    "AUTH_SECRET",
    "ADMIN_EMAIL",
    "ADMIN_PASSWORD",
  ] as const;

  return requiredKeys.filter((key) => !process.env[key]);
}

async function main() {
  const missingKeys = getMissingEnvVars();

  if (missingKeys.length || !hasDatabase) {
    throw new Error(
      `Missing required env vars: ${missingKeys.join(", ") || "DATABASE_URL"}`,
    );
  }

  console.log("Connecting to TiDB and preparing schema...");

  await ensureDatabaseReady();

  const [agents, tenants, tickets] = await Promise.all([
    listSupportAgents(),
    listTenants(),
    listTickets({}),
  ]);

  const ownerAccount = agents.find((agent) => agent.email === env.ADMIN_EMAIL);

  console.log("TiDB schema is ready.");
  console.log(`Owner account: ${ownerAccount?.email ?? env.ADMIN_EMAIL}`);
  console.log(`Support agents: ${agents.length}`);
  console.log(`Tenants: ${tenants.length}`);
  console.log(`Tickets: ${tickets.length}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await closeDb();
  });