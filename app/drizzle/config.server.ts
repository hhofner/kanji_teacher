import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";

// import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { migrate } from "drizzle-orm/libsql/migrator";
// import Database from "better-sqlite3";
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_PATH) {
  throw new Error("Missing environment variable: DATABASE_PATH");
}
if (!process.env.AUTH_TOKEN) {
  throw new Error("Missing environment variable: AUTH_TOKEN");
}

const client = createClient({
  url: process.env.DATABASE_PATH,
  authToken: process.env.AUTH_TOKEN,
});

export const db = drizzle(client);

// export const db = drizzle(new Database(process.env.DATABASE_PATH));
// Automatically run migrations on startup
void migrate(db, {
  migrationsFolder: "app/drizzle/migrations",
});

export default {
  schema: "./schema.server.ts",
  driver: "turso",
  dbCredentials: {
    url: process.env.DATABASE_PATH,
    authToken: process.env.AUTH_TOKEN,
  },
  verbose: true,
} satisfies Config;
