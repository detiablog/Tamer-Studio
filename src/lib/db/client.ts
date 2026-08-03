import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "@/core/config";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | null = null;
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null;

function getDb() {
  if (!dbInstance) {
    if (!client) {
      client = postgres(config.database.url, {
        max: 10,
        idle_timeout: 30,
        connect_timeout: 5,
      });

      if (typeof globalThis !== "undefined") {
        (globalThis as any).onExit = async () => {
          await client!.end();
        };
      }
    }

    dbInstance = drizzle(client, { schema });
  }

  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    return (getDb() as any)[prop];
  },
});
