"use server"

import { eq, desc } from "drizzle-orm"
import { tripBookings, roomBookings, carBookings } from "@/db/schema"
import db from "@/db/drizzle"

// Define the unified booking display type
type BookingDisplay = {
  id: number
  type: "trip" | "stay" | "car"
  image: string
  name: string
  startDate: string
  endDate: string
  status: string
  totalPrice: string
}

export async function getBookingHistory(
  userId: string
): Promise<BookingDisplay[]> {
  // Fetch trip bookings
  const tripBookingsData = await db.query.tripBookings.findMany({
    where: eq(tripBookings.userId, userId),
    with: {
      trip: {
        columns: {
          name: true,
          startDate: true,
          endDate: true,
        },
        with: {
          images: {
            columns: {
              imageUrl: true,
            },
            limit: 1,
          },
        },
      },
    },
    orderBy: [desc(tripBookings.bookingDate)],
  })

  // Fetch room bookings
  const roomBookingsData = await db.query.roomBookings.findMany({
    where: eq(roomBookings.userId, userId),
    with: {
      room: {
        columns: {
          name: true,
          images: true,
        },
        with: {
          hotel: {
            columns: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: [desc(roomBookings.bookingDate)],
  })

  // Fetch car bookings
  const carBookingsData = await db.query.carBookings.findMany({
    where: eq(carBookings.user_id, userId),
    with: {
      car: {
        columns: {
          model: true,
          brand: true,
          images: true,
        },
      },
    },
    orderBy: [desc(carBookings.createdAt)],
  })

  // Transform trip bookings
  const tripBookingsDisplay = tripBookingsData.map((booking) => ({
    id: booking.id,
    type: "trip" as const,
    image: booking.trip.images[0]?.imageUrl || "/default-trip.jpg",
    name: booking.trip.name,
    startDate: booking.trip.startDate,
    endDate: booking.trip.endDate,
    status: booking.status,
    totalPrice: booking.totalPrice,
  }))

  // Transform room bookings
  const roomBookingsDisplay = roomBookingsData.map((booking) => ({
    id: booking.id,
    type: "stay" as const,
    image: booking.room.images[0] || "/default-room.jpg",
    name: `${booking.room.hotel.name} - ${booking.room.name}`,
    startDate: booking.checkIn,
    endDate: booking.checkOut,
    status: booking.status,
    totalPrice: booking.totalPrice,
  }))

  // Transform car bookings
  const carBookingsDisplay = carBookingsData.map((booking) => ({
    id: booking.id,
    type: "car" as const,
    image: booking.car.images[0] || "/default-car.jpg",
    name: `${booking.car.brand} ${booking.car.model}`,
    startDate: booking.start_date.toISOString(),
    endDate: booking.end_date.toISOString(),
    status: booking.status,
    totalPrice: booking.total_price,
  }))

  // Combine and sort all bookings by start date (most recent first)
  const allBookings = [
    ...tripBookingsDisplay,
    ...roomBookingsDisplay,
    ...carBookingsDisplay,
  ].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
  )
  console.log("Final bookings:", allBookings)
  return allBookings
}
