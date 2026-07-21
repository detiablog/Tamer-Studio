import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { config } from "@/core/config";

const connectionString = config.database.url;

const client = postgres(connectionString);

export const db = drizzle(client);
