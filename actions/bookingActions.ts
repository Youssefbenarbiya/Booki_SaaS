"use server"

import db from "../db/drizzle"
import { tripBookings, trips } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

interface CreateBookingParams {
  tripId: number
  userId: string
  seatsBooked: number
}

export async function createBooking({
  tripId,
  userId,
  seatsBooked,
}: CreateBookingParams) {
  try {
    return await db.transaction(async (tx) => {
      // Get trip to check capacity
      const trip = await tx.query.trips.findFirst({
        where: eq(trips.id, tripId),
      })

      if (!trip) {
        throw new Error("Trip not found")
      }

      if (!trip.isAvailable) {
        throw new Error("Trip is not available for booking")
      }

      if (seatsBooked > trip.capacity) {
        throw new Error("Not enough seats available")
      }

      // Create booking
      const [booking] = await tx
        .insert(tripBookings)
        .values({
          tripId,
          userId,
          seatsBooked,
          status: "pending",
        })
        .returning()

      // Update trip capacity
      await tx
        .update(trips)
        .set({
          capacity: trip.capacity - seatsBooked,
        })
        .where(eq(trips.id, tripId))

      revalidatePath(`/trips/${tripId}`)
      revalidatePath("/dashboard/bookings")
      return booking
    })
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

export async function getBookingsByUserId(userId: string) {
  try {
    const bookings = await db.query.tripBookings.findMany({
      where: eq(tripBookings.userId, userId),
      with: {
        trip: {
          with: {
            images: true,
          },
        },
      },
    })
    return bookings
  } catch (error) {
    console.error("Error getting bookings:", error)
    throw error
  }
}
