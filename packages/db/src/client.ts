import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index";

let client: ReturnType<typeof postgres> | null = null;
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }

  if (!client) {
    client = postgres(url, { prepare: false, max: 10 });
    db = drizzle(client, { schema });
  }

  return db!;
}

export function createDb(url: string) {
  const pg = postgres(url, { prepare: false, max: 10 });
  return drizzle(pg, { schema });
}
