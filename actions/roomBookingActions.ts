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
}

export async function createRoomBooking({
  roomId,
  userId,
  checkIn,
  checkOut,
}: CreateRoomBookingParams) {
  try {
    return await db.transaction(async (tx) => {
      // Check if room exists and is available for these dates
      const existingBookings = await tx.query.roomBookings.findMany({
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

      // Create booking
      const [booking] = await tx
        .insert(roomBookings)
        .values({
          roomId,
          userId,
          checkIn: checkIn.toISOString(),
          checkOut: checkOut.toISOString(),
          status: "pending",
        })
        .returning()

      revalidatePath(`/hotels/${booking.roomId}`)
      revalidatePath("/dashboard/bookings")
      return booking
    })
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
