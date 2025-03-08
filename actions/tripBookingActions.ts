"use server"

import db from "../db/drizzle"
import { tripBookings, trips } from "@/db/schema"
import { eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generateTripPaymentLink } from "@/services/tripPayment"
import { sql } from "drizzle-orm"

interface CreateBookingParams {
  tripId: number
  userId: string
  seatsBooked: number
  totalPrice?: number
  status?: string
}

export async function createBooking({
  tripId,
  userId,
  seatsBooked,
  pricePerSeat,
}: CreateBookingParams & { pricePerSeat: number }) {
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

    const totalPrice = seatsBooked * pricePerSeat

    // Create booking using snake_case keys matching your schema
    const [booking] = await db
      .insert(tripBookings)
      .values({
        tripId: tripId,
        userId: userId,
        seatsBooked: seatsBooked,
        totalPrice: sql`${totalPrice}::decimal`, // Convert to decimal
        status: "pending",
        bookingDate: new Date(),
      })
      .returning()

    // Update trip capacity
    await db
      .update(trips)
      .set({
        capacity: trip.capacity - seatsBooked,
      })
      .where(eq(trips.id, tripId))

    revalidatePath(`/trips/${tripId}`)
    revalidatePath("/dashboard/bookings")
    return booking
  } catch (error) {
    console.error("Error creating booking:", error)
    throw error
  }
}

export async function createBookingWithPayment({
  tripId,
  userId,
  seatsBooked,
  pricePerSeat,
}: CreateBookingParams & { pricePerSeat: number }) {
  try {
    const totalPrice = seatsBooked * pricePerSeat

    // Create the initial booking
    const booking = await createBooking({
      tripId,
      userId,
      seatsBooked,
      pricePerSeat,
    })

    if (!booking) {
      throw new Error("Failed to create booking")
    }

    console.log("Created booking:", booking) // Debug log

    // Generate payment link using the trip payment service
    const paymentData = await generateTripPaymentLink({
      amount: totalPrice,
      bookingId: booking.id,
    })

    console.log("Generated payment data:", paymentData) // Debug log

    if (!paymentData || !paymentData.paymentId) {
      // If payment link generation fails, delete the booking
      await db.delete(tripBookings).where(eq(tripBookings.id, booking.id))
      throw new Error("Failed to generate payment link")
    }

    // Update booking with the payment ID and mark payment status as pending
    await db
      .update(tripBookings)
      .set({
        paymentId: paymentData.paymentId,
        paymentStatus: "pending",
      })
      .where(eq(tripBookings.id, booking.id))

    return {
      booking,
      paymentLink: paymentData.paymentLink,
      paymentId: paymentData.paymentId,
    }
  } catch (error) {
    console.error("Error creating booking with payment:", error)
    throw new Error(
      error instanceof Error
        ? error.message
        : "Failed to process booking payment"
    )
  }
}

export async function updateTripBookingPaymentStatus(
  bookingId: number,
  status: string,
  method: string
) {
  try {
    await db
      .update(tripBookings)
      .set({
        paymentStatus: status,
        paymentMethod: method,
        paymentDate: new Date(),
        status: status === "completed" ? "confirmed" : "failed",
      })
      .where(eq(tripBookings.id, bookingId))

    revalidatePath("/dashboard/bookings")
  } catch (error) {
    console.error("Error updating payment status:", error)
    throw error
  }
}
