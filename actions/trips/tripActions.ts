"use server"

import db from "@/db/drizzle"
import { trips, tripImages, tripActivities } from "@/db/schema"
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
  priceAfterDiscount: z.coerce.number().positive("Price after discount must be positive").optional().nullable(),
  capacity: z.coerce.number().int().positive("Capacity must be positive"),
  isAvailable: z.boolean().default(true),
  images: z.array(z.string()),
  activities: z
    .array(
      z.object({
        activityName: z.string(),
        description: z.string().optional(),
        scheduledDate: z.coerce.date().optional(),
      }),
    )
    .optional(),
})

export type TripInput = z.infer<typeof tripSchema>

export async function createTrip(data: TripInput) {
  try {
    const validatedData = tripSchema.parse(data)

    // Get the current user's session to set as agencyId
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      throw new Error("Unauthorized: You must be logged in to create a trip")
    }

    console.log(`Creating trip with agency ID: ${session.user.id}`)

    // Create trip with agencyId set to the current user's ID
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
        priceAfterDiscount: validatedData.priceAfterDiscount?.toString() || undefined,
        capacity: validatedData.capacity,
        isAvailable: validatedData.isAvailable,
        agencyId: session.user.id, // Set the agencyId to the current user's ID
      })
      .returning()

    // Add images
    if (validatedData.images.length > 0) {
      await db.insert(tripImages).values(
        validatedData.images.map((url) => ({
          tripId: trip.id,
          imageUrl: url,
        })),
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
        })),
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
    const trips = await db.query.trips.findMany({
      with: {
        images: true,
        activities: true,
        bookings: true,
      },
    })
    return trips
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

    // Update trip
    const [trip] = await db
      .update(trips)
      .set({
        name: validatedData.name,
        description: validatedData.description,
        destination: validatedData.destination,
        startDate: validatedData.startDate.toISOString(),
        endDate: validatedData.endDate.toISOString(),
        originalPrice: validatedData.originalPrice.toString(),
        discountPercentage: validatedData.discountPercentage || undefined,
        priceAfterDiscount: validatedData.priceAfterDiscount?.toString() || undefined,
        capacity: validatedData.capacity,
        isAvailable: validatedData.isAvailable,
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
        })),
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
        })),
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
    const [deletedTrip] = await db.delete(trips).where(eq(trips.id, id)).returning()

    revalidatePath("/agency/dashboard/trips")
    revalidatePath("/")
    return deletedTrip
  } catch (error) {
    console.error("Error deleting trip:", error)
    throw error
  }
}