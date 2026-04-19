import { closeDb } from "@/lib/db";
import { listAuditLogs, listSupportAgents, listTenants, listTickets } from "@/lib/data";
import { env, hasDatabase } from "@/lib/env";

async function main() {
  if (!hasDatabase) {
    throw new Error("DATABASE_URL is missing. The app would fall back to mock mode.");
  }

  const [agents, tenants, tickets, auditLogs] = await Promise.all([
    listSupportAgents(),
    listTenants(),
    listTickets({}),
    listAuditLogs(5),
  ]);

  console.log("TiDB connection OK.");
  console.log(`Database host: ${new URL(env.DATABASE_URL!).host}`);
  console.log(`Support agents: ${agents.length}`);
  console.log(`Tenants: ${tenants.length}`);
  console.log(`Tickets: ${tickets.length}`);
  console.log(`Recent audit entries: ${auditLogs.length}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await closeDb();
  });