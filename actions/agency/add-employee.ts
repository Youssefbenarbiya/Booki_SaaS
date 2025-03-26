"use server"

import { user, account, agencyEmployees, agencies } from "@/db/schema"
import { nanoid } from "nanoid"
import { sendEmail } from "@/actions/users/email"
import { z } from "zod"
import bcrypt from "bcrypt"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { auth } from "@/auth"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"
import jwt from "jsonwebtoken"

// Schema for validation
const employeeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

// Generate a secure random password
function generateRandomPassword(length = 12) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+"
  let password = ""
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}

// Function to generate a unique ID
function generateUniqueId() {
  return nanoid(21)
}

// Function to generate a mock access token (similar to OAuth tokens)
function generateAccessToken() {
  const prefix = "ya29.a0"
  const randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"
  let token = prefix

  // Generate a random token similar to Google's OAuth tokens
  for (let i = 0; i < 180; i++) {
    token += randomChars.charAt(Math.floor(Math.random() * randomChars.length))
  }

  return token
}

// Function to generate an ID token (JWT format)
function generateIdToken(userId: string, name: string, email: string) {
  // Create a simple JWT token with necessary fields
  const payload = {
    iss: "https://auth.booki.app", // Issuer
    aud: "booki-app", // Audience
    sub: userId,
    email: email,
    email_verified: true,
    name: name,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  }

  // Use a secret key for signing the token
  const secret = process.env.JWT_SECRET || "your-secret-key-for-jwt-signing"

  // Sign the token
  return jwt.sign(payload, secret)
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

    // Check if user with email already exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, validatedData.email.toLowerCase()),
    })

    if (existingUser) {
      return { error: "User with this email already exists" }
    }

    // Generate a random password
    const password = generateRandomPassword()

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create new user with role "employee"
    const userId = generateUniqueId()
    const now = new Date()

    // Generate authentication tokens
    const accessToken = generateAccessToken()
    const idToken = generateIdToken(
      userId,
      validatedData.name,
      validatedData.email.toLowerCase()
    )

    console.log("Creating new employee:", {
      id: userId,
      name: validatedData.name,
      email: validatedData.email.toLowerCase(),
      role: "employee",
    })

    try {
      // Instead of a transaction, let's do each step separately to see where it fails
      // Step 1: Insert user
      console.log("Inserting user")
      await db.insert(user).values({
        id: userId,
        name: validatedData.name,
        email: validatedData.email.toLowerCase(),
        role: "employee",
        phoneNumber: validatedData.phone || null,
        address: validatedData.address || null,
        emailVerified: true,
        banned: false,
        createdAt: now,
        updatedAt: now,
      })

      // Step 2: Insert account with tokens
      console.log("Inserting account with authentication tokens")
      await db.insert(account).values({
        id: generateUniqueId(),
        userId: userId,
        providerId: "credentials",
        accountId: userId,
        password: hashedPassword,
        accessToken: accessToken, // Add the access token
        idToken: idToken, // Add the ID token
        createdAt: now,
        updatedAt: now,
      })

      // Step 3: Insert agency employee link
      console.log("Inserting agency employee link")
      await db.insert(agencyEmployees).values({
        employeeId: userId,
        agencyId: agencyResult.userId,
        createdAt: now,
      })

      console.log("Database operations completed successfully")
    } catch (dbError) {
      console.error("Database error:", dbError)
      return {
        error:
          "Database error: " +
          (dbError instanceof Error ? dbError.message : String(dbError)),
      }
    }

    // Send email to employee with credentials
    try {
      console.log("Sending email")
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
    } catch (emailError) {
      console.error("Email error:", emailError)
      // Continue even if email fails - employee is still created
    }

    // Ensure we're revalidating the path correctly
    console.log("Revalidating path")
    revalidatePath("/agency/dashboard/employees")

    console.log("Employee creation completed successfully")
    return { success: true }
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
