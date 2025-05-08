import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "./schema"

// Connection string from environment variable
const connectionString = process.env.DATABASE_URL || ""

// Create Postgres client
const client = postgres(connectionString)

// Create Drizzle ORM instance
export const db = drizzle(client, { schema }) 