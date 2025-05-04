/* eslint-disable @typescript-eslint/ban-ts-comment */
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

import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import * as schema from '../../db/schema';

// Configure neon to work with websockets in Node.js
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

// Create the neon client
const sql = neon(process.env.DATABASE_URL);

// Use type assertion to work around type incompatibility
// @ts-expect-error - We know this works in practice despite the type error
const db = drizzle(sql, { schema });

export default db;
export { sql };
