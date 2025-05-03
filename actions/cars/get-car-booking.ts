/* eslint-disable @typescript-eslint/no-unused-vars */
import { eq } from "drizzle-orm"
import { carBookings, cars, user } from "@/db/schema"
import db from "@/db/drizzle"

export async function getCarBookingDetails(bookingId: number) {
  try {
    const booking = await db
      .select()
      .from(carBookings)
      .leftJoin(cars, eq(carBookings.car_id, cars.id))
      .leftJoin(user, eq(carBookings.user_id, user.id))
      .where(eq(carBookings.id, bookingId))
      .limit(1)

    if (!booking || booking.length === 0) {
      return { error: "Booking not found" }
    }

    const [result] = booking
    return {
      success: true,
      data: {
        booking: {
          id: result.car_bookings.id,
          startDate: result.car_bookings.start_date,
          endDate: result.car_bookings.end_date,
          totalPrice: result.car_bookings.total_price,
          status: result.car_bookings.status,
          paymentStatus: result.car_bookings.paymentStatus,
          paymentMethod: result.car_bookings.paymentMethod,
          drivingLicense: result.car_bookings.drivingLicense,
        },
        car: result.cars
          ? {
              id: result.cars.id,
              model: result.cars.model,
              brand: result.cars.brand,
              year: result.cars.year,
              plateNumber: result.cars.plateNumber,
              color: result.cars.color,
              originalPrice: result.cars.originalPrice,
              discountPercentage: result.cars.discountPercentage,
              priceAfterDiscount: result.cars.priceAfterDiscount,
              currency: result.cars.currency,
              images: result.cars.images,
            }
          : null,
        user: result.user
          ? {
              id: result.user.id,
              name: result.user.name,
              email: result.user.email,
              phoneNumber: result.user.phoneNumber,
              address: result.user.address,
              image: result.user.image,
            }
          : null,
      },
    }
  } catch (error) {
    return { error: "Failed to fetch booking details" }
  }
}
