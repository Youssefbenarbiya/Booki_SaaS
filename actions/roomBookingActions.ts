"use server"

import db from "../db/drizzle"
import { roomBookings } from "@/db/schema"
import { eq, and, or, between } from "drizzle-orm"
import { revalidatePath } from "next/cache"

interface CreateRoomBookingParams {
  roomId: string
  userId: string
  checkIn: Date
  checkOut: Date
  totalPrice?: number
  status?: string
}

export async function createRoomBooking({
  roomId,
  userId,
  checkIn,
  checkOut,
  totalPrice,
  status,
}: CreateRoomBookingParams) {
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
      const room = await db.query.room.findFirst({
        where: eq(room.id, roomId),
      })

      if (!room) {
        throw new Error("Room not found")
      }

      // Calculate nights
      const nights = Math.ceil(
        (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
      )

      // Calculate total price
      finalTotalPrice =
        (parseFloat(room.pricePerNightAdult) +
          parseFloat(room.pricePerNightChild)) *
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
        status: status || "pending",
      })
      .returning()

    revalidatePath(`/hotels/${booking.roomId}`)
    revalidatePath("/dashboard/bookings")
    return booking
  } catch (error) {
    console.error("Error creating room booking:", error)
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
