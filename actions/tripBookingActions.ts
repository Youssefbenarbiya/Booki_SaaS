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
    console.log("Creating booking with params:", { tripId, userId, seatsBooked });
    
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

    // Create booking
    const [booking] = await db
      .insert(tripBookings)
      .values({
        tripId,
        userId,
        seatsBooked,
        status: "pending",
        paymentStatus: "pending",
        paymentMethod: null,
      })
      .returning();
      
    console.log("Booking created:", booking);

    // Note: We'll update the trip capacity only after successful payment
    revalidatePath(`/trips/${tripId}`);
    
    return booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

export async function updateTripBookingPaymentStatus(
  bookingId: number,
  status: "pending" | "completed" | "failed",
  paymentMethod: string
) {
  try {
    // Get booking details
    const booking = await db.query.tripBookings.findFirst({
      where: eq(tripBookings.id, bookingId),
      with: {
        trip: true,
      },
    })

    if (!booking) {
      throw new Error("Booking not found")
    }

    // Update booking payment status
    await db
      .update(tripBookings)
      .set({
        paymentStatus: status,
        paymentMethod,
        status: status === "completed" ? "confirmed" : "pending",
      })
      .where(eq(tripBookings.id, bookingId))

    // If payment is completed, update trip capacity
    if (status === "completed" && booking.trip) {
      await db
        .update(trips)
        .set({
          capacity: booking.trip.capacity - booking.seatsBooked,
        })
        .where(eq(trips.id, booking.tripId))
    }

    revalidatePath(`/trips/${booking.tripId}`)
    revalidatePath("/dashboard/bookings")
    return { success: true }
  } catch (error) {
    console.error("Error updating payment status:", error)
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
