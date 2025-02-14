// import { defineConfig } from "drizzle-kit"
// import dotenv from "dotenv"

// // Load environment variables from .env.local
// dotenv.config({ path: ".env.local" })

// export default defineConfig({
//   schema: "./db/schema.ts",
//   dialect: "postgresql",
//   out: "./drizzle",
//   dbCredentials: {
//     url: process.env.POSTGRES_URL!,
//   },
//   verbose: true,
//   strict: true,
// })
 import { defineConfig } from "drizzle-kit"
 import dotenv from "dotenv"
 dotenv.config({ path: ".env.local" })

 export default defineConfig({
   schema: "./db/schema.ts",
   out: "./drizzle",
   dialect: "postgresql",
   dbCredentials: {
     url: process.env.DATABASE_URL!,
   },
 })
