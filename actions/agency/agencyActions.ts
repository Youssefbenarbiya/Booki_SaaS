"use server"

import { agencies, agencyEmployees } from "@/db/schema"
import { eq } from "drizzle-orm"
import db from "@/db/drizzle"
import { auth } from "@/auth"
import { headers } from "next/headers"

// Helper function to get the current session
async function getSession() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    throw new Error("Unauthorized: No session found")
  }
  return session
}

// Fetch current agency data
export async function getAgencyProfile() {
  try {
    const session = await getSession()
    
    // First check if the user is an agency owner
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
    })
    
    if (agency) {
      return { agency }
    }
    
    // If not an owner, check if they're an employee
    const employeeRecord = await db.query.agencyEmployees.findFirst({
      where: eq(agencyEmployees.employeeId, session.user.id),
      with: {
        agency: true
      }
    })
    
    if (employeeRecord && employeeRecord.agency) {
      return { agency: employeeRecord.agency }
    }
    
    return { agency: null }
  } catch (error) {
    console.error("Failed to fetch agency profile:", error)
    return { agency: null, error: "Failed to fetch agency profile" }
  }
}

// Update agency profile
export async function updateAgencyProfile(data: {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  description?: string;
  website?: string;
  logo?: string;
}) {
  try {
    const session = await getSession()
    
    // First check if the user is an agency owner
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.userId, session.user.id),
    })
    
    if (agency) {
      // Update the agency record
      await db
        .update(agencies)
        .set({
          agencyName: data.name,
          contactEmail: data.email,
          contactPhone: data.phone || null,
          address: data.address || null,
          description: data.description || null,
          website: data.website || null,
          logo: data.logo || null,
          updatedAt: new Date(),
        })
        .where(eq(agencies.id, agency.id))
      
      return { success: true }
    }
    
    // If it's an employee, they shouldn't be able to update the agency profile
    // This is just a safety check, as the UI should prevent this
    const employeeRecord = await db.query.agencyEmployees.findFirst({
      where: eq(agencyEmployees.employeeId, session.user.id),
    })
    
    if (employeeRecord) {
      throw new Error("Employees cannot update the agency profile")
    }
    
    throw new Error("No agency found for this user")
  } catch (error) {
    console.error("Failed to update agency profile:", error)
    return { success: false, error: "Failed to update agency profile" }
  }
} 