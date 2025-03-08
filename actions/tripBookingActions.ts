"use server"

import db from "../db/drizzle"
import { tripBookings, trips } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generatePaymentLink } from "@/services/flouciPayment"

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
    // Get trip to check capacity
    const trip = await db.query.trips.findFirst({
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

    // Calculate total price
    const totalPrice = Number(trip.price) * seatsBooked

    // Create booking with pending status
    const [booking] = await db
      .insert(tripBookings)
      .values({
        userId,
        tripId,
        seatsBooked,
        status: "pending",
        totalPrice: totalPrice.toString(),
        paymentStatus: "pending",
        bookingDate: new Date(),
      })
      .returning()

    // Generate payment link
    const { paymentLink, paymentId } = await generatePaymentLink({
      amount: totalPrice,
      bookingId: booking.id,
      developerTrackingId: `trip_booking_${booking.id}`,
    })

    // Update booking with payment ID
    await db
      .update(tripBookings)
      .set({
        paymentId,
      })
      .where(eq(tripBookings.id, booking.id))

    // Update trip capacity
    await db
      .update(trips)
      .set({
        capacity: trip.capacity - seatsBooked,
      })
      .where(eq(trips.id, tripId))

    revalidatePath(`/trips/${tripId}`)
    revalidatePath("/dashboard/bookings")
    
    return { booking, paymentLink }
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

export async function updateBookingPaymentStatus(bookingId: number, status: string) {
  try {
    await db
      .update(tripBookings)
      .set({
        paymentStatus: status,
        status: status === "completed" ? "confirmed" : "failed",
        paymentDate: status === "completed" ? new Date() : null,
      })
      .where(eq(tripBookings.id, bookingId))

    revalidatePath("/dashboard/bookings")
  } catch (error) {
    console.error("Error updating booking payment status:", error)
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
