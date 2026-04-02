import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

import { env, hasDatabase } from "@/lib/env";

let pool: mysql.Pool | null = null;
let dbInstance: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!hasDatabase) return null;

  if (!pool) {
    pool = mysql.createPool({
      uri: env.DATABASE_URL,
      connectionLimit: 10,
      namedPlaceholders: true,
    });
  }

  if (!dbInstance) {
    dbInstance = drizzle(pool as never) as ReturnType<typeof drizzle>;
  }

  return dbInstance;
}

export async function closeDb() {
  if (pool) {
    await pool.end();
  }
}
