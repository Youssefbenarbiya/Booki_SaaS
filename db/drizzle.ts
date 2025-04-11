// import { drizzle } from "drizzle-orm/postgres-js"
// import postgres from "postgres"
// import * as schema from "./schema"

// // Initialize the Postgres client using DATABASE_URL for Docker
// const sql = postgres(process.env.DATABASE_URL!, {
//   max: 10,
//   ssl: false, // No SSL for local Docker connection
// })

// const db = drizzle(sql, {
//   schema,
//   logger: process.env.NODE_ENV === "development",
// })

// export default db

import { drizzle } from "drizzle-orm/neon-http"
import { neon } from "@neondatabase/serverless"
import * as schema from "./schema"

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

export default db
