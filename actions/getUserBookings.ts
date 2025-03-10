// getUserBookings.ts
import { BookingHistory } from "@/app/user/profile/types"
import db from "@/db/drizzle"
import { tripBookings, roomBookings, carBookings } from "@/db/schema"
import { eq } from "drizzle-orm"

export async function getUserBookings(userId: string): Promise<BookingHistory> {
  try {
    const [trips, hotels, cars] = await Promise.all([
      // Get trip bookings
      db.query.tripBookings.findMany({
        where: eq(tripBookings.userId, userId),
        with: {
          trip: {
            with: {
              images: true,
            },
          },
        },
        orderBy: (trips, { desc }) => [desc(trips.bookingDate)],
      }),

      // Get hotel bookings
      db.query.roomBookings.findMany({
        where: eq(roomBookings.userId, userId),
        with: {
          room: {
            with: {
              hotel: true,
            },
          },
        },
        orderBy: (hotels, { desc }) => [desc(hotels.bookingDate)],
      }),

      // Get car bookings
      db.query.carBookings.findMany({
        where: eq(carBookings.userId, userId),
        with: {
          car: true,
        },
        orderBy: (cars, { desc }) => [desc(cars.createdAt)],
      }),
    ])

    // Transformations to match BookingHistory
    const transformedTrips = trips.map((booking) => ({
      id: booking.id,
      trip: {
        ...booking.trip,
        isAvailable: booking.trip.isAvailable ?? true,
      },
      seatsBooked: booking.seatsBooked,
      totalPrice: booking.totalPrice,
      status: booking.status,
      bookingDate: booking.bookingDate ?? new Date(),
      paymentStatus: booking.paymentStatus ?? "",
    }))

    const transformedHotels = hotels.map((booking) => ({
      id: booking.id,
      room: booking.room,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      totalPrice: booking.totalPrice,
      status: booking.status,
      bookingDate: booking.bookingDate ?? new Date(),
      paymentStatus: booking.paymentStatus ?? "",
    }))

    const transformedCars = cars.map((booking) => ({
      id: booking.id,
      car: booking.car,
      startDate: booking.startDate,
      endDate: booking.endDate,
      totalPrice: booking.totalPrice,
      status: booking.status,
      createdAt: booking.createdAt ?? new Date(),
    }))

    return {
      trips: transformedTrips,
      hotels: transformedHotels,
      cars: transformedCars,
    }
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    // Optionally, return empty arrays instead of throwing if you want the UI to handle it gracefully
    return { trips: [], hotels: [], cars: [] }
  }
}
