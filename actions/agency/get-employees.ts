// filepath: d:\booki\actions\agency\get-employees.ts
"use server"

import db from "@/db/drizzle"
import { user, agencies, agencyEmployees } from "@/db/schema"
import { eq } from "drizzle-orm"
import { headers } from "next/headers"
import { auth } from "@/auth"
export async function getEmployeesList() {
  try {
const session = await auth.api.getSession({
  headers: await headers(),
})
    if (!session || !session.user) {
      return { error: "Unauthorized access" }
    }

    // Find agency information for the current user
    const agencyResult = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
    })

    if (!agencyResult) {
      return { error: "Agency not found" }
    }

    // Get all employees for this agency
    const employees = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        image: user.image,
        createdAt: agencyEmployees.createdAt,
      })
      .from(agencyEmployees)
      .innerJoin(user, eq(agencyEmployees.employeeId, user.id))
      .where(eq(agencyEmployees.agencyId, agencyResult.userId))
      .orderBy(agencyEmployees.createdAt)

    return { employees }
  } catch (error) {
    console.error("Error fetching employees:", error)
    return { error: "Failed to fetch employees" }
  }
}
