import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema"
import postgres from "postgres"

// Initialize the Postgres client using POSTGRES_URL
const sql = postgres(process.env.POSTGRES_URL!, {
  debug: true,
  ssl: false, // Set to `true` if connecting to a production database with SSL
})

const db = drizzle(sql, {
  schema,
  logger: true,
})

export default db
