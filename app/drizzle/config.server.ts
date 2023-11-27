import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import Database from "better-sqlite3";
import type { Config } from "drizzle-kit";
import * as dotenv from "dotenv";
dotenv.config();

if (!process.env.DATABASE_PATH) {
  throw new Error("Missing environment variable: DATABASE_PATH");
}
console.log(process.env.DATABASE_PATH);
export const db = drizzle(new Database(process.env.DATABASE_PATH));
// Automatically run migrations on startup
void migrate(db, {
  migrationsFolder: "app/drizzle/migrations",
});

export default {
  schema: "./schema.server.ts",
  driver: "better-sqlite",
  dbCredentials: {
    url: `sqlite:///${process.env.DATABASE_PATH}`,
  },
  verbose: true,
} satisfies Config;
