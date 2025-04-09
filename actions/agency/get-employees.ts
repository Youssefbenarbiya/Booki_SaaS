// filepath: d:\booki\actions\agency\get-employees.ts
"use server"

import { headers } from "next/headers"
import db from "@/db/drizzle"
import { agencyEmployees, user } from "@/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/auth"

export async function getEmployeesList() {
  try {
    // Get current session to identify the agency owner
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return { error: "Unauthorized access" }
    }

    // Find all employees linked to this agency
    const employees = await db.query.agencyEmployees.findMany({
      where: eq(agencyEmployees.agencyId, session.user.id),
      with: {
        employee: true,
      },
    })

    if (!employees || employees.length === 0) {
      return { employees: [] }
    }

    // Format the employees data
    const formattedEmployees = employees.map((record) => ({
      id: record.employee.id,
      name: record.employee.name,
      email: record.employee.email,
      phoneNumber: record.employee.phoneNumber,
      address: record.employee.address,
      image: record.employee.image,
      createdAt: record.createdAt,
    }))

    return { employees: formattedEmployees }
  } catch (error) {
    console.error("Error fetching employees:", error)
    
    return { 
      error: error instanceof Error 
        ? `Failed to fetch employees: ${error.message}` 
        : "Failed to fetch employees" 
    }
  }
}
