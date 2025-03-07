"use server"

import db from "../db/drizzle"
import { room, roomBookings } from "@/db/schema"
import { eq, and, or, between } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { generatePaymentLink } from "@/services/flouciPayment"

interface CreateRoomBookingParams {
  roomId: string
  userId: string
  checkIn: Date
  checkOut: Date
  totalPrice?: number
  status?: string
  adultCount?: number
  childCount?: number
  infantCount?: number
}

interface CreateRoomBookingWithPaymentParams extends CreateRoomBookingParams {
  initiatePayment?: boolean
}

export async function createRoomBooking({
  roomId,
  userId,
  checkIn,
  checkOut,
  totalPrice,
  status,
  adultCount,
  childCount,
  infantCount,
  initiatePayment = true,
}: CreateRoomBookingWithPaymentParams) {
  try {
    // Check if room exists and is available for these dates
    const existingBookings = await db.query.roomBookings.findMany({
      where: and(
        eq(roomBookings.roomId, roomId),
        or(
          between(
            roomBookings.checkIn,
            checkIn.toISOString(),
            checkOut.toISOString()
          ),
          between(
            roomBookings.checkOut,
            checkIn.toISOString(),
            checkOut.toISOString()
          )
        )
      ),
    })

    if (existingBookings.length > 0) {
      throw new Error("Room is not available for these dates")
    }

    // If totalPrice is not provided, calculate it based on room price and nights
    let finalTotalPrice = totalPrice

    if (!finalTotalPrice) {
      // Get room price from database
      const roomData = await db.query.room.findFirst({
        where: eq(room.id, roomId),
      })

      if (!roomData) {
        throw new Error("Room not found")
      }

      // Calculate nights
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Calculate total price
      finalTotalPrice =
        (parseFloat(roomData.pricePerNightAdult) +
          parseFloat(roomData.pricePerNightChild)) *
        nights
    }

    // Create booking with the correct total price
    const [booking] = await db
      .insert(roomBookings)
      .values({
        roomId,
        userId,
        checkIn: checkIn.toISOString(),
        checkOut: checkOut.toISOString(),
        totalPrice: finalTotalPrice.toString(),
        status: "pending", // Set initial status to pending until payment is confirmed
        paymentStatus: "pending",
      })
      .returning()

    // If payment is requested, generate a payment link
    if (initiatePayment) {
      try {
        const { paymentLink, paymentId } = await generatePaymentLink({
          amount: parseFloat(booking.totalPrice),
          bookingId: booking.id,
          developerTrackingId: `room_booking_${booking.id}`,
        })

        // Update booking with payment ID
        await db
          .update(roomBookings)
          .set({
            paymentId,
          })
          .where(eq(roomBookings.id, booking.id))

        // Return booking with payment link
        return {
          ...booking,
          paymentLink,
          paymentId,
        }
      } catch (error) {
        console.error("Error generating payment link:", error)
        // Return booking without payment link if there's an error
        return booking
      }
    }

    revalidatePath(`/hotels/${booking.roomId}`)
    revalidatePath("/dashboard/bookings")
    return booking
  } catch (error) {
    console.error("Error creating room booking:", error)
    throw error
  }
}

export async function updateBookingPaymentStatus(
  bookingId: number,
  paymentStatus: string,
  paymentMethod?: string
) {
  try {
    const [updatedBooking] = await db
      .update(roomBookings)
      .set({
        paymentStatus,
        paymentMethod,
        paymentDate: new Date(),
        status: paymentStatus === "completed" ? "confirmed" : "pending",
      })
      .where(eq(roomBookings.id, bookingId))
      .returning()

    revalidatePath(`/hotels/${updatedBooking.roomId}`)
    revalidatePath("/dashboard/bookings")
    return updatedBooking
  } catch (error) {
    console.error("Error updating booking payment status:", error)
    throw error
  }
}

export async function getRoomBookingsByUserId(userId: string) {
  try {
    const bookings = await db.query.roomBookings.findMany({
      where: eq(roomBookings.userId, userId),
      with: {
        room: {
          with: {
            hotel: true,
          },
        },
      },
    })
    return bookings
  } catch (error) {
    console.error("Error getting room bookings:", error)
    throw error
  }
}

export async function checkRoomAvailability(
  roomId: string,
  checkIn: Date,
  checkOut: Date
) {
  try {
    const existingBookings = await db.query.roomBookings.findMany({
      where: and(
        eq(roomBookings.roomId, roomId),
        or(
          between(
            roomBookings.checkIn,
            checkIn.toISOString(),
            checkOut.toISOString()
          ),
          between(
            roomBookings.checkOut,
            checkIn.toISOString(),
            checkOut.toISOString()
          )
        )
      ),
    })

    return existingBookings.length === 0
  } catch (error) {
    console.error("Error checking room availability:", error)
    throw error
  }
}
