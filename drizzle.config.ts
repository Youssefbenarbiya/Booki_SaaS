import { defineConfig } from "drizzle-kit"
import dotenv from "dotenv"
dotenv.config({ path: ".env.local" })

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
})
