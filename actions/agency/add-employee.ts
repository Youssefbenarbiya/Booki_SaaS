/* eslint-disable @typescript-eslint/no-explicit-any */
"use server"

import { agencyEmployees, agencies, user } from "@/db/schema"
import { sendEmail } from "@/actions/users/email"
import { z } from "zod"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"
import { authClient } from "@/auth-client" // Add this import for authClient

// Schema for validation
const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

// Function to generate a secure random password
function generateRandomPassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

export async function addEmployee(formData: EmployeeFormData) {
  try {
    console.log("Starting addEmployee with data:", formData)

    // Validate form data
    const validatedData = employeeSchema.parse(formData)

    // Get current session to identify the agency owner
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    console.log("Session:", session?.user?.id)

    if (!session || !session.user) {
      return { error: "Unauthorized access" }
    }

    // Find agency information for the current user
    const agencyResult = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
    })

    console.log("Agency Result:", agencyResult)

    if (!agencyResult) {
      return {
        error:
          "Agency not found. You must be an agency owner to add employees.",
      }
    }

    // Generate a random password
    const password = generateRandomPassword()

    // Create user data for auth client
    const userData = {
      email: validatedData.email.toLowerCase(),
      password: password,
      name: validatedData.name,
      phoneNumber: validatedData.phone || null,
      role: "employee", // Specify role
      address: validatedData.address || null,
    }

    // Use authClient to create user account (like in sign-up page)
    return await new Promise((resolve) => {
      authClient.signUp.email(userData as any, {
        onSuccess: async (authResult) => {
          console.log(
            "Employee created successfully with auth client:",
            authResult
          )

          try {
            // Since the auth result structure varies, let's find the user by email
            // Wait a moment to ensure the user is in the database
            console.log("Waiting for user creation to propagate...")
            await new Promise((r) => setTimeout(r, 2000))

            // Find the newly created employee by email
            const createdUser = await db.query.user.findFirst({
              where: eq(user.email, validatedData.email.toLowerCase()),
            })

            if (!createdUser || !createdUser.id) {
              console.error("Could not find created user in database")
              throw new Error(
                "Failed to find employee in database after creation"
              )
            }

            console.log("Found created employee:", createdUser)

            // Link employee to the agency
            const now = new Date()
            await db.insert(agencyEmployees).values({
              employeeId: createdUser.id,
              agencyId: agencyResult.userId,
              createdAt: now,
            })

            // Send email to employee with credentials
            await sendEmail({
              to: validatedData.email,
              subject: `Welcome to ${agencyResult.agencyName} Team!`,
              text: `
Hello ${validatedData.name},

You've been added as an employee to ${agencyResult.agencyName}.

Here are your login credentials:
Email: ${validatedData.email}
Password: ${password}

Please log in at our platform and change your password as soon as possible.

Thank you,
${agencyResult.agencyName} Team
              `,
            })

            console.log("Email sent successfully")

            // Revalidate path
            revalidatePath("/agency/dashboard/employees")

            resolve({ success: true })
          } catch (error) {
            console.error("Error linking employee to agency:", error)
            resolve({
              error:
                error instanceof Error
                  ? `Employee created but linking failed: ${error.message}`
                  : "Employee created but linking failed",
            })
          }
        },
        onError: (error: any) => {
          console.error("Employee creation error:", error)
          resolve({
            error: error?.message || "Failed to create employee account",
          })
        },
      })
    })
  } catch (error) {
    console.error("Error adding employee:", error)
    // More detailed error logging
    if (error instanceof Error) {
      console.error("Error details:", error.message)
      return { error: `Failed to add employee: ${error.message}` }
    }

    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message }
    }

    return { error: "Failed to add employee. Please try again." }
  }
}
