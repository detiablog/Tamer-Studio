import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "@/core/config";
import * as schema from "./schema";

const connectionString = config.database.url;

// Create connection with proper pooling
const client = postgres(connectionString, {
  max: 10, // connection pool size
  idle_timeout: 30, // close idle connections after 30s
  connect_timeout: 5, // timeout for new connections
});

export const db = drizzle(client, { schema });

// Graceful shutdown
if (typeof globalThis !== "undefined") {
  globalThis.onExit = async () => {
    await client.end();
  };
}
