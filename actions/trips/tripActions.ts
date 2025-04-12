"use server"

import db from "@/db/drizzle"
import {
  trips,
  tripImages,
  tripActivities,
  user,
  agencyEmployees,
} from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { auth } from "@/auth"
import { headers } from "next/headers"

const tripSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  destination: z.string().min(1, "Destination is required"),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  originalPrice: z.coerce.number().positive("Original price must be positive"),
  discountPercentage: z.coerce.number().min(0).max(100).optional().nullable(),
  priceAfterDiscount: z.coerce
    .number()
    .positive("Price after discount must be positive")
    .optional()
    .nullable(),
  capacity: z.coerce.number().int().positive("Capacity must be positive"),
  isAvailable: z.boolean().default(true),
  images: z.array(z.string()),
  currency: z.string().default("USD"),
  activities: z
    .array(
      z.object({
        activityName: z.string(),
        description: z.string().optional(),
        scheduledDate: z.coerce.date().optional(),
      })
    )
    .optional(),
})

export type TripInput = z.infer<typeof tripSchema>

// Helper function to get agency ID - works for both owners and employees
async function getAgencyId(userId: string) {
  // Check if user is an agency owner
  const userWithAgency = await db.query.user.findFirst({
    where: eq(user.id, userId),
    with: {
      agency: true,
    },
  })

  if (userWithAgency?.agency) {
    return userWithAgency.agency.userId
  }

  // Check if user is an employee
  const employeeRecord = await db.query.agencyEmployees.findFirst({
    where: eq(agencyEmployees.employeeId, userId),
  })

  if (employeeRecord) {
    return employeeRecord.agencyId
  }

  throw new Error("No agency found for this user - not an owner or employee")
}

export async function createTrip(data: TripInput) {
  try {
    const validatedData = tripSchema.parse(data)

    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      throw new Error("Unauthorized: You must be logged in to create a trip")
    }

    // Get the agency ID - works for both owners and employees
    const agencyId = await getAgencyId(session.user.id)

    console.log(`Creating trip with agency ID: ${agencyId}`)

    // Create trip with proper agency ID and createdBy
    const [trip] = await db
      .insert(trips)
      .values({
        name: validatedData.name,
        description: validatedData.description,
        destination: validatedData.destination,
        startDate: validatedData.startDate.toISOString(),
        endDate: validatedData.endDate.toISOString(),
        originalPrice: validatedData.originalPrice.toString(),
        discountPercentage: validatedData.discountPercentage || undefined,
        priceAfterDiscount:
          validatedData.priceAfterDiscount?.toString() || undefined,
        capacity: validatedData.capacity,
        isAvailable: validatedData.isAvailable,
        agencyId: agencyId, // Use the agencyId from our helper
        createdBy: session.user.id, // Track who created it
        currency: validatedData.currency || "USD",
      })
      .returning()

    // Add images
    if (validatedData.images.length > 0) {
      await db.insert(tripImages).values(
        validatedData.images.map((url) => ({
          tripId: trip.id,
          imageUrl: url,
        }))
      )
    }

    // Add activities
    if (validatedData.activities?.length) {
      await db.insert(tripActivities).values(
        validatedData.activities.map((activity) => ({
          tripId: trip.id,
          activityName: activity.activityName,
          description: activity.description,
          scheduledDate: activity.scheduledDate?.toISOString(),
        }))
      )
    }

    revalidatePath("/agency/dashboard/trips")
    revalidatePath("/")
    return trip
  } catch (error) {
    console.error("Error creating trip:", error)
    throw error
  }
}

export async function getTrips() {
  try {
    // Get the current user's session
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      console.log("No authenticated user found when getting trips")
      return []
    }

    // Get the agency ID - works for both owners and employees
    const agencyId = await getAgencyId(session.user.id)

    // Get trips belonging to the user's agency
    const tripResults = await db.query.trips.findMany({
      where: eq(trips.agencyId, agencyId),
      with: {
        images: true,
        activities: true,
        bookings: true,
      },
    })

    return tripResults
  } catch (error) {
    console.error("Error getting trips:", error)
    throw error
  }
}

export async function getTripById(id: number) {
  try {
    const trip = await db.query.trips.findFirst({
      where: eq(trips.id, id),
      with: {
        images: true,
        activities: true,
        bookings: true,
      },
    })
    return trip
  } catch (error) {
    console.error("Error getting trip:", error)
    throw error
  }
}

export async function updateTrip(id: number, data: TripInput) {
  try {
    const validatedData = tripSchema.parse(data)

    // Update trip with explicit null values for discount fields when they're undefined
    const [trip] = await db
      .update(trips)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        destination: validatedData.destination,
        startDate: validatedData.startDate.toISOString(),
        endDate: validatedData.endDate.toISOString(),
        originalPrice: validatedData.originalPrice.toString(),
        discountPercentage: validatedData.discountPercentage ?? null,
        priceAfterDiscount:
          validatedData.priceAfterDiscount?.toString() ?? null,
        capacity: validatedData.capacity,
        isAvailable: validatedData.isAvailable,
        currency: validatedData.currency || "USD",
      })
      .where(eq(trips.id, id))
      .returning()

    // Update images
    await db.delete(tripImages).where(eq(tripImages.tripId, id))
    if (validatedData.images.length > 0) {
      await db.insert(tripImages).values(
        validatedData.images.map((url) => ({
          tripId: trip.id,
          imageUrl: url,
        }))
      )
    }

    // Update activities
    await db.delete(tripActivities).where(eq(tripActivities.tripId, id))
    if (validatedData.activities?.length) {
      await db.insert(tripActivities).values(
        validatedData.activities.map((activity) => ({
          tripId: trip.id,
          activityName: activity.activityName,
          description: activity.description,
          scheduledDate: activity.scheduledDate?.toISOString(),
        }))
      )
    }

    revalidatePath("/agency/dashboard/trips")
    revalidatePath("/")
    return trip
  } catch (error) {
    console.error("Error updating trip:", error)
    throw error
  }
}

export async function deleteTrip(id: number) {
  try {
    const [deletedTrip] = await db
      .delete(trips)
      .where(eq(trips.id, id))
      .returning()

    revalidatePath("/agency/dashboard/trips")
    revalidatePath("/")
    return deletedTrip
  } catch (error) {
    console.error("Error deleting trip:", error)
    throw error
  }
}
