"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import db from "@/db/drizzle"
import { agencyEmployees, user } from "@/db/schema"
import { eq, and } from "drizzle-orm"
import { auth } from "@/auth"
import { z } from "zod"

// Schema for validation
const employeeUpdateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type EmployeeUpdateData = z.infer<typeof employeeUpdateSchema>

export async function updateEmployee(employeeId: string, formData: EmployeeUpdateData) {
  try {
    // Validate form data
    const validatedData = employeeUpdateSchema.parse(formData)

    // Get current session to identify the agency owner
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return { error: "Unauthorized access" }
    }

    // Check if the employee belongs to the agency
    const employeeRecord = await db.query.agencyEmployees.findFirst({
      where: and(
        eq(agencyEmployees.employeeId, employeeId),
        eq(agencyEmployees.agencyId, session.user.id)
      ),
    })

    if (!employeeRecord) {
      return { error: "Employee not found or not part of your agency" }
    }

    // Update user data
    await db
      .update(user)
      .set({
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        phoneNumber: validatedData.phone || null,
        address: validatedData.address || null,
        updatedAt: new Date(),
      })
      .where(eq(user.id, employeeId))

    // Revalidate path
    revalidatePath("/agency/dashboard/employees")

    return { success: true }
  } catch (error) {
    console.error("Error updating employee:", error)
    
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { 
      error: error instanceof Error 
        ? `Failed to update employee: ${error.message}` 
        : "Failed to update employee" 
    }
  }
}

export async function deleteEmployee(employeeId: string) {
  try {
    // Get current session to identify the agency owner
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return { error: "Unauthorized access" }
    }

    // Check if the employee belongs to the agency
    const employeeRecord = await db.query.agencyEmployees.findFirst({
      where: and(
        eq(agencyEmployees.employeeId, employeeId),
        eq(agencyEmployees.agencyId, session.user.id)
      ),
    })

    if (!employeeRecord) {
      return { error: "Employee not found or not part of your agency" }
    }

    // Delete the employee from agencyEmployees
    await db
      .delete(agencyEmployees)
      .where(
        and(
          eq(agencyEmployees.employeeId, employeeId),
          eq(agencyEmployees.agencyId, session.user.id)
        )
      )

    // Set user role back to "user" instead of fully deleting the account
    // This preserves user data while removing them from the agency
    await db
      .update(user)
      .set({
        role: "customer",
        updatedAt: new Date(),
      })
      .where(eq(user.id, employeeId))

    // Revalidate path
    revalidatePath("/agency/dashboard/employees")

    return { success: true }
  } catch (error) {
    console.error("Error deleting employee:", error)
    
    return { 
      error: error instanceof Error 
        ? `Failed to delete employee: ${error.message}` 
        : "Failed to delete employee" 
    }
  }
} 